// Verifier: does ' · stirred ×R' survive multistart round 2? Control: ms=1 (no round switch) keeps it. No injected warnings.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(50); st+=50; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(const ms of [3,1]){
    const rec={};
    H.el('clear').onclick(); H.clickPreset('trefoil'); H.set({ms});
    if(!running) H.play(); rec.run1=runToEnd(20000); rec.status1=H.dbg().status;
    const r=window.__knotStir(300); rec.stirDbg=r.dbg;
    rec.afterStir={running, msK:_msK, msRound:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status};
    // step until round index changes or run ends; capture the first status after the change
    const r0=_msRound; let guard=0; while(running && _msRound===r0 && guard++<800) H.step(50);
    rec.afterRoundSwitch={running, msRound:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status};
    rec.run2=runToEnd(60000); rec.final={status:H.dbg().status, runNote:_runNote, liftWarn:_liftWarn, E:_msEnergies.slice()};
    rec.finalHasStirred=/stirred/.test(H.dbg().status);
    out['ms'+ms]=rec; }
  return out; })()
