// частота заклиниваний в серии после Stir: трилистник, ms=3, с профилем жёсткости и без
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(const mode of ['profile']){
    if(mode==='uniform') window.__ann={stiff:0,rep:0}; else delete window.__ann;   // 2.19: профили через window.__ann
    const runs=[];
    for(let rep=0; rep<4; rep++){
      H.el('clear').onclick(); if(H.running()) H.play(); H.clickPreset('trefoil'); H.set({ms:3});
      H.play(); runToEnd(40000); const E1=_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam');
      const rr=window.__knotStir();   // полный бюджет разрыхления (стадия A трилистника ≈ 700 шагов) const r2=rr.running? runToEnd(60000) : null;
      runs.push({E1, grow:rr.dbg&&rr.dbg.grow, E2:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam'), steps2:r2&&r2.steps, status:H.dbg().status.slice(0,80)}); }
    out[mode]=runs; }
  delete window.__ann;
  return out; })()
