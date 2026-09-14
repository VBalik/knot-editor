// wf2 review: kink growth during a contact-free stir (unknot circle): max angle, max adjacent-angle sum, min cd=2 gap, bending energy growth
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function angles(){ const n=N, th=new Float64Array(n); for(let i=0;i<n;i++){ const a=verts[(i-1+n)%n], b=verts[i], c=verts[(i+1)%n]; th[i]=b.clone().sub(a).angleTo(c.clone().sub(b)); } return th; }
  function minCd2(){ let m=Infinity; for(let i=0;i<N;i++){ const j=(i+2)%N; const r=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]); m=Math.min(m,r.dist); } return m/L0; }
  for(let rep=0;rep<3;rep++){
    H.el('clear').onclick(); let t=0; while(t++<60){ randomKnot(4); if(isUnknot) break; } H.set({ms:1});
    if(!running) H.play(); const r1=runToEnd(10000); const bE0=H.bE();
    if(!stirStart()){ out['rep'+rep]={stirStart:false, status:H.dbg().status}; continue; }
    let maxTh=0, maxAdj=0, cd2=Infinity;
    while(_stir && _stir.i<STIR_STEPS-1){ stirStep(); const th=angles(); for(let i=0;i<N;i++){ maxTh=Math.max(maxTh,th[i]); maxAdj=Math.max(maxAdj,th[i]+th[(i+1)%N]); } if(_stir.i%10===0) cd2=Math.min(cd2,minCd2()); }
    const thE=angles(); let mE=0; for(const x of thE) mE=Math.max(mE,x);
    out['rep'+rep]={N, isUnknot, run1:r1, status1:H.dbg().status.slice(0,60), rejected:_stir.rejected, maxTh_deg:+(maxTh*180/Math.PI).toFixed(1), maxThEnd_deg:+(mE*180/Math.PI).toFixed(1), maxAdjSum_deg:+(maxAdj*180/Math.PI).toFixed(1), minCd2_L0:+cd2.toFixed(3), bE_ratio:+(H.bE()/bE0).toFixed(2), grow:+(knotRadius()/_stir.R0).toFixed(3), det:_detRobust(3)};
    stirStep(); if(running) stopPhysics(''); }
  return out; })()
