// Clean repro: finished run -> stir -> Stiff. slider mid-stir -> where does the event go? plus baseline (no stir) for contrast
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); const rb=runToEnd(40000);
  const logB=runLog; const evB=(logB.events||[]).length;
  out.finished={settled:rb.settled, status:H.dbg().status.slice(0,80), stepsTotal:logB.stepsTotal, stepCounter, final:!!logB.final, stopReason:logB.stopReason, persisted:!!logB._persisted, pillDone:!!(H.el('statusPill').classList&&H.el('statusPill').classList.contains&&H.el('statusPill').classList.contains('done'))};
  const r=window.__knotStir(10); out.stirStarted={stir:!!_stir, i:r.i, running};
  H.setSlider('bendCoef', 7);
  out.duringStir={stir:!!_stir, running, bendCoef, oldEventsAdded:(logB.events||[]).length-evB, lastOldEvent:(logB.events||[]).slice(-1)[0]||null, sameLogObject:(runLog===logB)};
  window.__knotStir(300);
  out.afterStir={stir:!!_stir, running, newLogIsNew:(runLog!==logB), newEvents:(runLog.events||[]).slice(), newMetaBend:runLog.meta.bendCoef, newMetaKB:runLog.meta.kB, msK:_msK, runNote:_runNote};
  // baseline for contrast: fresh diagram, finished run, slider with NO stir
  H.el('clear').onclick(); H.setSlider('bendCoef', 9);
  H.clickPreset('trefoil'); H.play(); const ra=runToEnd(40000);
  const logA=runLog; const evA=(logA.events||[]).length;
  H.setSlider('bendCoef', 7);
  out.baselineNoStir={settled:ra.settled, oldFinal:!!logA.final, oldEventsAdded:(logA.events||[]).length-evA, newLogIsNew:(runLog!==logA), newEvents:(runLog.events||[]).slice(), newMetaBend:runLog.meta.bendCoef, running};
  return out; })()
