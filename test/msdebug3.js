(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
  const raw=fs.readFileSync(process.env.TELEM,'utf8'); global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300));
  H.setSlider('bendCoef',1); H.setSlider('thick',10); H.setSlider('repCoef',10); console.error('N',N,'starting'); if(!H.running()) H.play(); console.error('started, heap', process.memoryUsage().heapUsed>>20);
  for(let b=0;b<400;b++){ const t=window.__knotTrace(); console.error('pre', b*25, 'round', t.msRound, 'infl', +t.inflate.toFixed(3), 'heapMB', process.memoryUsage().heapUsed>>20, 'settle', settleCount, 'st', stepCounter, H.dbg().status.slice(0,28)); const o=H.step(25); if(!o.running){ console.error('stopped at', b*25, H.dbg().status.slice(0,100)); break; } }
  return 'done'; })()
