// wf2 review: does stir create sharp kinks (no bending gate)? repeated stirs on presets: track maxTh, max adjacent-angle sum, min cd=2 gap, per-step.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function angles(){ const n=N, th=new Float64Array(n); for(let i=0;i<n;i++){ const a=verts[(i-1+n)%n], b=verts[i], c=verts[(i+1)%n]; th[i]=b.clone().sub(a).angleTo(c.clone().sub(b)); } return th; }
  function minCd2(){ let m=Infinity; for(let i=0;i<N;i++){ const j=(i+2)%N; const r=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]); m=Math.min(m,r.dist); } return m/L0; }
  const knot=process.env.WF2_KNOT||'trefoil', reps=+(process.env.WF2_REPS||4);
  for(let rep=0;rep<reps;rep++){
    H.el('clear').onclick(); if(knot.startsWith('rand')) randomKnot(+knot.slice(4)); else H.clickPreset(knot); H.set({ms:1});
    if(!running) H.play(); const r1=runToEnd(15000);
    const th0=angles(); let m0=0; for(const t of th0) m0=Math.max(m0,t);
    if(!stirStart()){ out['rep'+rep]={stirStart:false, status:H.dbg().status}; continue; }
    let maxTh=0, maxAdj=0, cd2=Infinity, stepOfMax=-1, hist=[];
    while(_stir && _stir.i<STIR_STEPS-1){ stirStep(); const th=angles(); let m=0,ma=0; for(let i=0;i<N;i++){ m=Math.max(m,th[i]); ma=Math.max(ma,th[i]+th[(i+1)%N]); }
      if(m>maxTh){ maxTh=m; stepOfMax=_stir.i; } maxAdj=Math.max(maxAdj,ma); if(_stir.i%50===0) hist.push(+(m*180/Math.PI).toFixed(1)); cd2=Math.min(cd2,minCd2()); }
    const thE=angles(); let mE=0; for(const t of thE) mE=Math.max(mE,t);
    out['rep'+rep]={N, run1:r1, maxTh0_deg:+(m0*180/Math.PI).toFixed(1), maxTh_deg:+(maxTh*180/Math.PI).toFixed(1), stepOfMax, maxThEnd_deg:+(mE*180/Math.PI).toFixed(1), maxAdjSum_deg:+(maxAdj*180/Math.PI).toFixed(1), minCd2_L0:+cd2.toFixed(3), rejected:_stir.rejected, hist, gmin_s:+(energyGrad(false).gmin/sExcl()).toFixed(3), E:energyGrad(false).E};
    stirStep(); if(running) stopPhysics(''); }
  return out; })()
