// Independent check: does ' · stirred ×R' (and stir det warning) survive round 2 and the final of a K=2 series?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); H.el('msN').value='2'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); out.run1=runToEnd(40000); out.status1=H.dbg().status;
  _runDet=5; // force stir warning path
  const r=window.__knotStir(300); out.stirRet={stir:r.stir, running:r.running, dbg:r.dbg};
  out.round1={msK:_msK, round:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:runStatus()};
  let st=0; while(_msRound<1 && st<40000 && H.running()){ H.step(50); st+=50; }
  out.round2={round:_msRound, running:H.running(), runNote:_runNote, liftWarn:_liftWarn, status:runStatus(), stepsToRound2:st};
  out.run2=runToEnd(40000);
  out.final={status:H.dbg().status, runNote:_runNote, liftWarn:_liftWarn, hasStirred:/stirred/.test(H.dbg().status), hasStirWarn:/changed by stir/.test(H.dbg().status), E:_msEnergies.slice()};
  return out; })()
