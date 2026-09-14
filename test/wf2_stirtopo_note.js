// wf2 review: does the ' · stirred ×R' note and the stir det-warning survive multistart round 2 (startPhysics resets _runNote/_liftWarn)?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); H.clickPreset('trefoil'); H.set({ms:3});
  if(!running) H.play(); out.run1=runToEnd(20000); out.status1=H.dbg().status;
  const r=window.__knotStir(300); out.stirDbg=r.dbg;
  out.afterStir={running, msK:_msK, msRound:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status};
  // simulate a det-change warning from stir to see whether it survives round transitions
  _liftWarn='⚠ knot type changed by stir (det 3 → 1) · '+_liftWarn; out.injectedWarn=_liftWarn;
  let guard=0; while(running && _msRound<1 && guard++<400) H.step(100);
  out.round2={running, msRound:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status};
  out.run2=runToEnd(40000); out.final={status:H.dbg().status, runNote:_runNote, liftWarn:_liftWarn, E:_msEnergies.slice()};
  return out; })()
