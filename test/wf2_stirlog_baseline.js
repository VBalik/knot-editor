// Baseline vs stir: where does a 'bend' slider event land? (a) after a finished run w/o stir -> restart -> new log; (b) during stir -> ?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  // (a) baseline: finished run, slider moved with no stir
  H.clickPreset('trefoil'); H.play(); const ra=runToEnd(40000);
  const logA=runLog; const evA=(logA.events||[]).length;
  H.setSlider('bendCoef', 7);
  out.baseline={settled:ra.settled, oldFinal:!!logA.final, oldEventsAdded:(logA.events||[]).length-evA, newLogIsNew:(runLog!==logA), newEvents:(runLog.events||[]).slice(), newMetaBend:runLog.meta.bendCoef, running};
  stopPhysics('');   // stop the restarted run
  H.setSlider('bendCoef', 9);
  // (b) stir path: fresh run to completion, then slider during stir
  H.clickPreset('trefoil'); H.play(); const rb=runToEnd(40000);
  const logB=runLog; const evB=(logB.events||[]).length; const persistedB=!!logB._persisted;
  const r=window.__knotStir(10);
  H.setSlider('bendCoef', 7);
  out.duringStir={settledBefore:rb.settled, stir:!!_stir, running, oldFinal:!!logB.final, oldEventsAdded:(logB.events||[]).length-evB, lastOldEvent:(logB.events||[]).slice(-1)[0]||null, sameLogObject:(runLog===logB), stepsTotal:logB.stepsTotal};
  const r3=window.__knotStir(300);
  out.afterStir={stir:!!_stir, running, newLogIsNew:(runLog!==logB), newEvents:(runLog.events||[]).slice(), newMetaBend:runLog.meta.bendCoef, kB:runLog.meta.kB, runNote:_runNote};
  return out; })()
