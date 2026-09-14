(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__msDebug=true; const fs=global.__require('fs');
  const raw=fs.readFileSync(process.env.TELEM,'utf8'); global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300)); window.__knotSet({ms:4, stretch:true}); H.setSlider('bendCoef',1); H.setSlider('thick',10); H.setSlider('repCoef',10); if(!H.running()) H.play();
  let o=null, st=0; while(true){ o=H.step(100); st+=100; const t=window.__knotTrace(); if(st%500===0) console.error('  st',st,'round',t.msRound,'infl',+t.inflate.toFixed(3),'bE/M',+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3)); if(!o.running || st>=20000) break; }
  return {rounds:window.__knotTrace().msEnergies}; })()
