(async ()=>{ const H=global.__H; window.__noAutoSave=true; H.clickPreset('trefoil'); H.setSlider('thick',3); H.setSlider('repCoef',2); if(!H.running()) H.play();
  for(let b=0;b<60;b++){ const t=window.__knotTrace(); console.error('pre', b*10, 'round', t.msRound, 'infl', t.inflate, 'heapMB', process.memoryUsage().heapUsed>>20, 'settle', settleCount, 'status', H.dbg().status.slice(0,30)); const o=H.step(10); if(!o.running){ console.error('stopped at', b*10); break; } }
  return 'done'; })()
