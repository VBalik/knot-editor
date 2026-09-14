// (1) __knotStir(k) mid-stir returns dbg of the PREVIOUS stir; (2) slider moved during stir logs into finalized old runLog
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); runToEnd(40000);
  const r1=window.__knotStir(300); out.firstStir={stir:r1.stir, grow:r1.dbg&&r1.dbg.grow};
  runToEnd(40000);
  const oldLog=runLog; const evBefore=(oldLog.events||[]).length; out.oldLogFinal=!!oldLog.final;
  const r2=window.__knotStir(20); out.secondStirPartial={stir:r2.stir, i:r2.i, dbgIsPrevious:(r2.dbg===r1.dbg), dbgGrow:r2.dbg&&r2.dbg.grow};
  H.setSlider('bendCoef', 7); out.duringStir={stir:!!_stir, running, bendCoef, oldLogEventsAdded:(oldLog.events||[]).length-evBefore, sameLogObject:(runLog===oldLog)};
  const r3=window.__knotStir(300); out.secondStirDone={stir:r3.stir, running:r3.running, dbgGrow:r3.dbg.grow, dbgIsNew:(r3.dbg!==r1.dbg)};
  out.newLog={isNew:(runLog!==oldLog), events:(runLog.events||[]).length, kB:runLog.meta.kB, bendCoef:runLog.meta.bendCoef};
  return out; })()
