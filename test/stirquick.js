// быстрый Stir после серии (трилистник, ms=3): сколько шагов занимает разрыхление и приходит ли серия после него к прежним минимумам
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.clickPreset('trefoil'); H.set({ms:3});
  H.play(); const r1=runToEnd(40000); const E1=_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam');
  const t0=Date.now(); const rr=window.__knotStir(3000); const stirMs=Date.now()-t0;
  const tr=window.__knotTrace(); const r2=rr.running? runToEnd(60000) : null;
  return {r1, E1, stir:{running:rr.running, dbg:rr.dbg, stirMs, trace:tr.stir}, r2, E2:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(3):'jam'), status:H.dbg().status.slice(0,120), ann:window.__knotTrace().ann}; })()
