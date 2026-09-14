// Stir 2.21 (только растаскивание): сдвиг частей, рост радиуса, сохранение det, серия после Stir — трилистник, восьмёрка, случайный 12 (ползунки 5/2/9) и 10/10/2
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  async function one(name, prep, sl){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    await prep(); H.set({ms:3}); H.play(); const r1=runToEnd(40000); const E1=_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam');
    const R0=knotRadius(); const t0=Date.now(); const rr=window.__knotStir(); const ms=Date.now()-t0; const tr=window.__knotTrace();
    const r2=rr.running? runToEnd(60000) : null;
    out[name]={r1, E1, R0:+R0.toFixed(2), stir:{running:rr.running, dbg:rr.dbg, ms}, r2, E2:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam'), status:H.dbg().status.slice(0,110)};
    console.error(name, JSON.stringify(out[name]).slice(0,400)); }
  await one('trefoil', async()=>H.clickPreset('trefoil'), [5,2,9]);
  await one('figure8', async()=>H.clickPreset('figure8'), [5,2,9]);
  await one('rand12', async()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }, [5,2,9]);
  await one('rand12_w10r10', async()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }, [10,10,2]);
  return out; })()
