// Verify: buildKnot3D during stir cancels _stir but leaves #play.disabled=true
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const P=()=>H.el('play'), S=()=>H.el('stir');
  const snap=()=>({playDisabled:P().disabled, stirDisabled:S().disabled, stir:!!_stir, running, status:H.dbg().status.slice(0,60)});
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='1'; H.el('msN').oninput();
  H.clickPreset('trefoil'); out.s0=snap();
  H.play(); out.run1=runToEnd(30000); out.s1=snap();
  const started=S().onclick(); out.stirStarted=started; out.s2=snap();
  window.__knotStir(10); out.s3=snap();
  H.clickPreset('figure8'); out.presetDuringStir=snap();
  // manual invocation of handler (a real disabled button would not fire this)
  H.play(); out.afterManualPlay=snap();
  out.run2=runToEnd(30000); out.afterRun2=snap();
  // recovery via Stir -> stirFinish
  S().onclick(); window.__knotStir(300); out.afterStirAgain=snap();
  // control: Clear path resets
  H.el('clear').onclick(); out.afterClear=snap();
  return out; })()
