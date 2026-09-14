// Stir на плотных узлах (пятилистник, семилистник, случайный 25) при w=5/r=2 и w=10/r=10: разрыхление и серия
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(const [name, prep, w, r] of [['cinq_52', ()=>H.clickPreset('cinquefoil'),5,2], ['sept_52', ()=>H.clickPreset('septafoil'),5,2], ['cinq_1010', ()=>H.clickPreset('cinquefoil'),10,10], ['rand25_52', ()=>randomKnot(25),5,2]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',w); H.setSlider('repCoef',r); H.setSlider('bendCoef',9); prep(); H.set({ms:2});
    const rec={N:H.dbg().N, det2d:H.dbg().knotDet};
    H.play(); rec.run1=runToEnd(40000); rec.E1=_msEnergies.map(e=>+e.toPrecision(4)); rec.det1=H.det3d();
    const tr0=window.__knotTrace(); rec.gap1_s=+(tr0.gminRep/tr0.sEff).toFixed(3);
    const R0=knotRadius();
    const rr=window.__knotStir(700); rec.stir=rr.dbg; rec.afterStir={running:rr.running, status:H.dbg().status.slice(0,110), inflate:+window.__knotTrace().inflate.toFixed(3)};
    if(rr.running){ rec.run2=runToEnd(40000); rec.status2=H.dbg().status.slice(0,120); rec.E2=_msEnergies.map(e=>+e.toPrecision(4)); rec.det2=H.det3d(); }
    out[name]=rec; console.error(name, JSON.stringify(rec)); }
  return out; })()
