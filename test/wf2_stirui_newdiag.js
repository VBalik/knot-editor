// UI state machine: new diagram / crossing flip / randomKnot during stir -> _stir cancelled, but Play.disabled?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const P=()=>H.el('play'), S=()=>H.el('stir');
  const snap=(tag)=>({tag, playDisabled:P().disabled, stirDisabled:S().disabled, stir:!!_stir, running, status:H.dbg().status.slice(0,70)});
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  // mock stores property writes?
  P().disabled=true; out.mockStoresDisabled=(P().disabled===true); P().disabled=false;
  // (1) preset during stir
  H.clickPreset('trefoil'); out.afterPreset=snap('afterPreset');
  H.play(); out.run1=runToEnd(30000); out.afterRun=snap('afterRun');
  S().onclick(); out.afterStirClick=snap('afterStirClick');
  window.__knotStir(20); out.midStir=snap('midStir');
  H.clickPreset('figure8'); out.presetDuringStir=snap('presetDuringStir');
  // Play handler would work if invoked, but the real button is disabled in DOM:
  out.playHandlerBoundWhileDisabled = typeof P().onclick==='function';
  // (2) crossing flip during stir
  H.el('clear').onclick(); out.afterClear=snap('afterClear');
  H.clickPreset('trefoil'); H.play(); out.run2=runToEnd(30000); out.afterRun2=snap('afterRun2');
  S().onclick(); window.__knotStir(20); out.midStir2=snap('midStir2');
  const c=crossings[0]; tryToggleCrossing({x:c.x, y:c.y}); out.flipDuringStir=snap('flipDuringStir');
  // (3) randomKnot during stir
  H.el('clear').onclick(); H.clickPreset('trefoil'); H.play(); out.run3=runToEnd(30000);
  S().onclick(); window.__knotStir(20); out.midStir3=snap('midStir3');
  randomKnot(4); out.randomDuringStir=snap('randomDuringStir');
  // (4) slider during this stuck state: physSettingsChanged -> startPhysics (workaround path)
  H.setSlider('bendCoef', 8); out.afterSliderStuck=snap('afterSliderStuck');
  return out; })()
