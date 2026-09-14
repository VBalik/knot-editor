// Рисунок пользователя (det 5, N=568): красный завиток обязан раскрыться.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('fixtures/telemetry/knot-telemetry-20260727-090932-307.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  H.setSlider('bendCoef', 10); H.setSlider('repCoef', +(process.env.REP||10));
  const d0=H.dbg();
  if(!H.running()) H.play();
  if(!H.running()) return {err:'PLAY FAILED', st:d0.status};
  const tr=[]; let o=null;
  for(let b=0;b<160;b++){
    o=H.step(120);
    if(b%8===0){ const L=H.log(), last=L.series[L.series.length-1]||{};
      tr.push({s:(b+1)*120, bE:+H.bE().toFixed(2), kR:last.kR, E:last.E}); }
    if(!o.running) break;
  }
  if(H.running()) H.play();
  const L=H.log(), last=(L.series||[]).slice(-1)[0]||{};
  return { tag:window.__buildTag, nc:d0.crossings.length, det2d:d0.knotDet,
    settled:!(o&&o.running), steps:L.stepsTotal, bE:+H.bE().toFixed(2),
    kRfin:last.kR, det3:H.det3d(), tr:tr.slice(-3) };
})()
