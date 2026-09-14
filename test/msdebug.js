(async ()=>{ const H=global.__H; window.__noAutoSave=true; H.clickPreset('trefoil'); H.setSlider('thick',3); H.setSlider('repCoef',2); if(!H.running()) H.play(); const rows=[];
  for(let b=0;b<40;b++){ const o=H.step(50); const t=window.__knotTrace(); rows.push([b*50, t.msRound, t.inflate, H.dbg().status.slice(0,40), (typeof runLog!=='undefined' && runLog&&runLog.series)? runLog.series.length : -1, process.memoryUsage().heapUsed>>20]); if(!o.running) break; }
  return rows; })()
