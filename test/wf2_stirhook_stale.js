// Verify: partial __knotStir(k) returns dbg of previous completed stir; check what distinguishes in-progress state
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); out.run1=runToEnd(20000);
  // partial call before any stir ever completed
  const p0=window.__knotStir(10); out.partialNoPrev={stir:p0.stir, i:p0.i, dbg:p0.dbg, trace:window.__knotTrace().stir};
  const r1=window.__knotStir(300); out.firstDone={stir:r1.stir, i:r1.i, running:r1.running, dbgGrow:r1.dbg&&r1.dbg.grow, traceSame:(window.__knotTrace().stir===r1.dbg)};
  out.run2=runToEnd(20000);
  const r2=window.__knotStir(20); out.secondPartial={stir:r2.stir, i:r2.i, running:r2.running, dbgIsPrev:(r2.dbg===r1.dbg), dbgGrow:r2.dbg&&r2.dbg.grow, traceIsPrev:(window.__knotTrace().stir===r1.dbg), liveRejected:_stir&&_stir.rejected, liveMoved:_stir&&+( _stir.moved/L0).toFixed(3)};
  const r3=window.__knotStir(300); out.secondDone={stir:r3.stir, i:r3.i, dbgIsNew:(r3.dbg!==r1.dbg), dbgGrow:r3.dbg&&r3.dbg.grow};
  return out; })()
