(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const t of [10,30,60,100]){ randomKnot(t);
    const D=thickDNominal(); const g0=minSegGap();
    let t0=Date.now(); _dbgUnstick=0; const r=startFeasibility(300); const msF=Date.now()-t0; const g1=minSegGap();
    // how many rounds does a single unstickLift do now, and why does it stop?
    t0=Date.now(); const p=unstickLift(6); const msU=Date.now()-t0;
    syncKnot3D(); t0=Date.now(); H.play(); const msPlay=Date.now()-t0; const tr=window.__knotTrace(); if(H.running()) H.play();
    out.push({target:t, nc:crossings.length, N, gap0_D:+(g0/D).toFixed(4), feasIt:r.it, errL0:+(r.err/L0).toExponential(2), pushes:_dbgUnstick, gap1_D:+(g1/D).toFixed(4), gT_D:0.05, msFeas:msF, extraPushes:p, msUnstick6:msU, msStartPhysics:msPlay, inflate0:+tr.inflate.toFixed(3)}); }
  return out; })()
