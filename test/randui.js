(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const target of [8, 30, 60]){
    const t0=Date.now(); randomKnot(target); const genMs=Date.now()-t0;
    const d=H.dbg(); const rec={target, nc:d.crossings.length, det2d:d.knotDet, N:d.N, genMs, status0:d.status.slice(0,60)};
    if(!H.running()) H.play(); const dR=H.dbg(); rec.runDet=dR.runDet; rec.inflate0=+window.__knotTrace().inflate.toFixed(3);
    let o=null, st=0; while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace(); if(rec.inflSteps===undefined && tr.inflate>=1) rec.inflSteps=st; if(!o.running || st>=40000) break; }
    if(H.running()) H.play();
    Object.assign(rec,{steps:st, settled:!o.running, status:H.dbg().status.slice(0,80), bE:+H.bE().toFixed(3), maxCurv:o.maxCurv, minSegL0:o.minSegL0, detEnd:window.__knotTrace().detEnd});
    out.push(rec); }
  return out; })()
