// «Ёж» 14:07: наследование толщины упаковки + тривиальная расстановка
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('fixtures/telemetry/knot-telemetry-20260727-140702-959.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  H.setSlider('bendCoef', 10); H.setSlider('repCoef', 1);
  { const tc=document.getElementById('tightChk'); tc.checked=true; tc.onchange&&tc.onchange(); }
  if(!H.running()) H.play();
  let o=null;
  for(let b=0;b<30;b++){ o=H.step(120); if(!o.running) break; }
  const midTD=H.dbg().tD;
  if(H.running()) H.play();
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  if(!H.running()) H.play();
  const d0=H.dbg();
  let ok=true;
  for(let b=0;b<80;b++){
    o=H.step(150);
    const L=H.log(), last=(L.series||[]).slice(-1)[0]||{};
    if(last.maxMove>50){ ok=false; break; }
    if(!o.running) break;
  }
  if(H.running()) H.play();
  const L=H.log(), last=(L.series||[]).slice(-1)[0]||{};
  { const tc=document.getElementById('tightChk'); tc.checked=false; tc.onchange&&tc.onchange(); }
  return { midTD, runUnknot:d0.runUnknot, noExplosion:ok,
    settled:!(o&&o.running), steps:L.stepsTotal,
    bE:last.bendEnergy, kR:last.kR, tD:last.tD };
})()
