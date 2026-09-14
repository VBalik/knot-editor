// wf2 verify: is _dbgStir.gminMin_s normalized by the post-startPhysics sExcl() (i.e. divided by the new _inflate)?
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const cases=[['cinquefoil', ()=>H.clickPreset('cinquefoil'), 5, 2], ['rand30', ()=>randomKnot(30), 5, 2], ['thick10:rand20', ()=>randomKnot(20), 10, 10]];
  for(const [name, prep, th, rp] of cases){
    H.el('clear').onclick(); prep(); H.setSlider('thick',th); H.setSlider('repCoef',rp); H.set({ms:1});
    const rec={N:N};
    if(!running) H.play(); rec.run1=runToEnd(30000); rec.inflateEndOfRun=+_inflate.toFixed(4);
    if(!stirStart()){ rec.stirStart=false; out[name]=rec; continue; }
    const s0=sExcl(), sN=sNominal(); rec.sExcl_at_stir_over_sNominal=+(s0/sN).toFixed(4);
    while(_stir && _stir.i<STIR_STEPS-1) stirStep();
    const gminMinRaw=_stir.gminMin; rec.gminMin_over_s_stirTime=+(gminMinRaw/s0).toFixed(4);
    stirStep(); // -> stirFinish -> startPhysics
    const t=window.__knotTrace();
    rec.reported_gminMin_s=t.stir.gminMin_s; rec.inflateAfterFinish=+t.inflate.toFixed(4);
    rec.predicted_if_bug=+(gminMinRaw/(sN*_inflate)).toFixed(3);
    rec.ratio_reported_over_true=+(t.stir.gminMin_s/(gminMinRaw/s0)).toFixed(3);
    rec.bugVisible = Math.abs(t.stir.gminMin_s - rec.predicted_if_bug)<2e-3 && Math.abs(t.stir.gminMin_s - rec.gminMin_over_s_stirTime)>5e-3;
    out[name]=rec; }
  return out; })()
