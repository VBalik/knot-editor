// wf2 verify (3): would stirring inside a temporarily deflated core (_inflate=0.7) loosen tight knots
// while keeping the crossing certificates (which depend on gmin0, not on s)? Measures growth, det, contacts.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function stirDeflated(infl, steps){
    const Rb=knotRadius(); let rej=0, acc=0; const inflSave=_inflate; _inflate=infl; _energyDirty=true; stirField();
    for(let step=0; step<steps; step++){
      const n=N, g0=energyGrad(false), gm0=g0.gmin;
      if(step>0 && step%40===0) stirField();
      for(let i=0;i<n;i++){ _fx[i]=_stirUx[i]; _fy[i]=_stirUy[i]; _fz[i]=_stirUz[i]; }
      dirTangentProject(8); removeRigidModes(); let fm=0; for(let i=0;i<n;i++) fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i]));
      if(fm<1e-300){ stirField(); continue; }
      const cap=Math.max(Math.min(0.35*gm0,0.5*L0),1e-6*L0), a=cap/fm; const xs=verts.map(v=>v.clone());
      for(let i=0;i<n;i++){ verts[i].x=xs[i].x+a*_fx[i]; verts[i].y=xs[i].y+a*_fy[i]; verts[i].z=xs[i].z+a*_fz[i]; }
      projectLengthsSafe(40); const e1=energyGrad(false); let mvT=0; for(let i=0;i<n;i++) mvT=Math.max(mvT, verts[i].distanceTo(xs[i]));
      const ok=isFinite(e1.E) && e1.gmin>0.55*Math.min(gm0,sExcl()) && mvT<0.5*Math.min(gm0,5*sExcl()+0.5*L0);
      if(!ok){ for(let i=0;i<n;i++) verts[i].copy(xs[i]); rej++; stirField(); } else { acc++; recenter(); }
    }
    _inflate=inflSave; _energyDirty=true; const gb=energyGrad(false);
    return {rejected:rej, accepted:acc, grow:+(knotRadius()/Rb).toFixed(3), gminRep_sNom:+(gb.gminRep/sNominal()).toFixed(3), Efinite:isFinite(gb.E), det:_detRobust(3)};
  }
  for(const name of (process.env.WF2_KNOTS||'cinquefoil,septafoil').split(',')){
    H.el('clear').onclick(); if(name.startsWith('rand')) randomKnot(+name.slice(4)); else H.clickPreset(name); H.set({ms:1});
    if(!running) H.play(); const rec={run1:runToEnd(20000), det0:_detRobust(3)};
    const rest=verts.map(v=>v.clone());
    for(const infl of [0.85, 0.7, 0.5]){ for(let i=0;i<N;i++) verts[i].copy(rest[i]); _energyDirty=true; rec['infl'+infl]=stirDeflated(infl, 300); }
    out[name]=rec; }
  return out; })()
