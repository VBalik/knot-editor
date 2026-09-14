// LENS 2.21 (iv): parallel-series bookkeeping with varying N per try — emulate parRender (N=vs.length without allocBuffers)
// followed by msRestoreBest with a best try of the SAME N as the last preview but different from the base lift.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.el('clear').onclick(); if(H.running()) H.play();
  let t=0; do{ randomKnot(20); }while(isUnknot && t++<20);
  const N0=N, buf0=_fx.length; out.base={N0, buf0, cross:crossings.length};
  // find a random lift with N != N0 (what a worker try would have)
  let alt=null; for(let k=0;k<12 && !alt;k++){ liftFromDiagram(Math.random); if(N!==N0) alt={N:N, verts:verts.map(v=>v.clone())}; }
  // restore base state (as parStart left it): verts of N0, buffers of N0
  liftFromDiagram(null); while(N!==N0){ liftFromDiagram(null); }
  out.alt=alt? alt.N : null; if(!alt) return out;
  out.bufAfterBase=_fx.length;
  // --- emulate parRender preview of the alt try (verbatim: verts=vs; N=vs.length; no allocBuffers)
  verts=alt.verts.map(v=>v.clone()); N=verts.length;
  out.afterPreview={N, buf:_fx.length};
  // --- emulate parFinish: _msBest = alt try (same N as preview) → msRestoreBest
  _msBest={E:1.0, verts:alt.verts.map(v=>v.clone()), msg:'', round:0, det:knotDet, runDet:knotDet};
  msRestoreBest();
  out.afterRestore={N, buf:_fx.length, sx:_sx.length, t1:_t1.length, mx:_mx.length, mismatch:_fx.length!==N};
  // consequences: energyGrad on the restored shape, then a single descent (Play) from it
  const g=energyGrad(true); out.E=isFinite(g.E)? +g.E.toPrecision(4) : String(g.E);
  let nanF=0; for(let i=0;i<N;i++){ if(!isFinite(_fx[i])||_fx[i]===undefined) nanF++; } out.forceNaN=nanF;
  _fromLift=false; _msK=1; startPhysics();
  let bad=0; for(let i=0;i<N;i++){ const v=verts[i]; if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) bad++; }
  out.afterStartPhysics={nanVerts:bad, running, inflate:+_inflate.toFixed(4), status:H.dbg().status.slice(0,120)};
  H.step(50);
  bad=0; for(let i=0;i<N;i++){ const v=verts[i]; if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) bad++; }
  out.after50={nanVerts:bad, running, E:_ePrev, status:H.dbg().status.slice(0,120)};
  return out; })()
