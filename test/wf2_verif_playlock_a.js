// verifier: does cancelling a stir via preset/randomKnot leave #play disabled? and does anything but Clear recover it?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const play=H.el('play');
  H.el('clear').onclick(); H.clickPreset('trefoil'); H.set({ms:1});
  out.hasDisabledPropAfterClear=('disabled' in play); out.playAfterClear=play.disabled;
  H.play(); out.run1=runToEnd(20000); out.status1=H.dbg().status.slice(0,60);
  out.stirBtnEnabledAfterRun=!H.el('stir').disabled;
  out.stirStarted=stirStart(); out.playDuringStir=play.disabled;
  for(let k=0;k<5 && _stir;k++) stirStep();
  out.stirI=_stir?_stir.i:null;
  // cancel via preset mid-stir
  H.clickPreset('figure8');
  out.afterPreset={stir:!!_stir, running, playDisabled:play.disabled, stirDisabled:H.el('stir').disabled, status:H.dbg().status.slice(0,60), N};
  // recovery probes (no Clear): slider -> physSettingsChanged -> startPhysics; run to end -> stopPhysics(msg)
  H.setSlider('bendCoef', +H.el('bendCoef').value*1.1+0.01);
  out.sliderStartsPhysics=running;
  if(running){ out.run2=runToEnd(20000); }
  out.afterSliderRun={running, playDisabled:play.disabled, stirEnabled:!H.el('stir').disabled, status:H.dbg().status.slice(0,60)};
  // Clear recovers?
  H.el('clear').onclick(); out.afterClear=play.disabled;
  // second scenario: randomKnot mid-stir
  H.clickPreset('trefoil'); H.play(); runToEnd(20000);
  stirStart(); for(let k=0;k<5 && _stir;k++) stirStep();
  randomKnot(8);
  out.afterRandom={stir:!!_stir, running, playDisabled:play.disabled, stirDisabled:H.el('stir').disabled, status:H.dbg().status.slice(0,60)};
  return out; })()
