// (1) stir det warning (_liftWarn prefix from stirFinish) lost on round 2 of K=2; (2) Play stays disabled after
// preset-during-stir even through a later completed series (only Clear resets play.disabled)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const P=()=>H.el('play'), S=()=>H.el('stir');
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='2'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); runToEnd(40000);
  _runDet=5;   // force st.det != dEnd so stirFinish builds the '⚠ knot type changed by stir' prefix
  window.__knotStir(300);
  out.afterStir={liftWarn:_liftWarn, runNote:_runNote, status:H.dbg().status.slice(0,140), round:_msRound};
  { let st=0; while(_msRound<1 && st<40000 && H.running()){ H.step(50); st+=50; } }
  out.round2={liftWarn:_liftWarn, runNote:_runNote, status:H.dbg().status.slice(0,140), round:_msRound};
  runToEnd(40000); out.final={status:H.dbg().status, hasStirWarn:/changed by stir/.test(H.dbg().status), hasStirred:/stirred/.test(H.dbg().status)};
  // (2)
  S().onclick(); window.__knotStir(20); out.midStir={playDisabled:P().disabled, stir:!!_stir};
  H.clickPreset('figure8'); out.afterPreset={playDisabled:P().disabled, stir:!!_stir, stirDisabled:S().disabled, status:H.dbg().status.slice(0,60)};
  H.setSlider('bendCoef', 8); out.sliderStart={running, playDisabled:P().disabled};
  out.sliderDone=Object.assign(runToEnd(40000), {playDisabled:P().disabled, stirDisabled:S().disabled, status:H.dbg().status.slice(0,80)});
  S().onclick(); window.__knotStir(300); out.stirAgain={playDisabled:P().disabled, running};
  out.stirAgainDone=Object.assign(runToEnd(40000), {playDisabled:P().disabled});
  return out; })()
