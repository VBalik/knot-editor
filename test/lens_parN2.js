// LENS (iv): same as lens_parN but with a try whose N is LARGER than the base lift's N (buffers shorter than N)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.el('clear').onclick(); if(H.running()) H.play();
  let t=0; do{ randomKnot(20); }while(isUnknot && t++<20);
  const N0=N; out.base={N0, buf0:_fx.length, cross:crossings.length};
  let alt=null; for(let k=0;k<30 && !alt;k++){ liftFromDiagram(Math.random); if(N>N0) alt={N:N, verts:verts.map(v=>v.clone())}; }
  liftFromDiagram(null); for(let k=0;k<30 && N!==N0;k++) liftFromDiagram(null);
  out.alt=alt? alt.N : null; if(!alt || N!==N0) return out;
  verts=alt.verts.map(v=>v.clone()); N=verts.length;              // parRender (verbatim)
  _msBest={E:1.0, verts:alt.verts.map(v=>v.clone()), msg:'', round:0, det:knotDet, runDet:knotDet};
  msRestoreBest();                                                   // parFinish
  out.afterRestore={N, buf:_fx.length, mismatch:_fx.length!==N};
  const g=energyGrad(true); out.E=String(g.E); out.gmin=g.gmin;
  let nanF=0; for(let i=0;i<N;i++){ if(!(isFinite(_fx[i]))) nanF++; } out.forceNaN=nanF;
  _fromLift=false; _msK=1; try{ startPhysics(); }catch(e){ out.err=String(e); }
  let bad=0; for(let i=0;i<N;i++){ const v=verts[i]; if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) bad++; }
  out.afterStartPhysics={nanVerts:bad, running, inflate:_inflate, status:H.dbg().status.slice(0,120)};
  try{ H.step(50); }catch(e){ out.stepErr=String(e); }
  bad=0; for(let i=0;i<N;i++){ const v=verts[i]; if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) bad++; }
  out.after50={nanVerts:bad, running, E:String(_ePrev), status:H.dbg().status.slice(0,120)};
  return out; })()
