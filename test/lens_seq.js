// LENS 2.21 (iv): sequential 3-try series on rand12 (5/2/9): N per try, bookkeeping after msRestoreBest, buffers, det
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget, tmax){ let o=null, st=0; const t0=Date.now(); const Ns=[N]; let lastRound=_msRound;
    while(true){ o=H.step(50); st+=50; if(_msRound!==lastRound){ lastRound=_msRound; Ns.push(N); } if(!o.running || st>=budget || Date.now()-t0>tmax) break; } return {steps:st, settled:!o.running, ms:Date.now()-t0, Ns}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  let t=0; do{ randomKnot(12); }while(isUnknot && t++<30);
  out.cross=crossings.length; out.det2d=knotDet; out.N0=N;
  H.set({ms:3}); H.play();
  const r=runToEnd(20000, 240000); out.run=r;
  out.after={N, vertsLen:verts.length, bestLen:_msBest? _msBest.verts.length:null, msLiftLen:_msLift? _msLift.length:null, buf:_fx.length, L0:+L0.toFixed(5), L0chk:+(verts.reduce((a,v,i)=>a+v.distanceTo(verts[(i+1)%N]),0)/N).toFixed(5),
    tubeR:+tubeRadius.toFixed(4), tubeChk:+(0.5*thickCoef*unitLen()).toFixed(4), E:_ePrev, Echk:+energyGrad(false).E.toPrecision(5), kBmul:!!_kBmul, msE:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(4):'jam'), detEnd:_dbgDetEnd, detNow:_detRobust(3), runDet:_runDet, status:H.dbg().status.slice(0,160)};
  // Stir after the series (uses best shape; buffers must match N)
  const rr=window.__knotStir(); out.stir={running:rr.running, stir:rr.stir, dbg:rr.dbg, status:H.dbg().status.slice(0,120), N, buf:_fx.length};
  let bad=0; for(let i=0;i<N;i++){ const v=verts[i]; if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) bad++; } out.stir.nanVerts=bad;
  return out; })()
