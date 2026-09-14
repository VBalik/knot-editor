// det-5 рисунок: осадка → «Плотно» на ходу → упаковка до реализованного потолка
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('fixtures/telemetry/knot-telemetry-20260727-130224-239.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  H.setSlider('bendCoef', 9); H.setSlider('repCoef', 3);
  if(!H.running()) H.play();
  let o=null;
  for(let b=0;b<100;b++){ o=H.step(120); if(!o.running) break; }
  const L1=H.log(), s1=(L1.series||[]).slice(-1)[0]||{};
  const ph1={settled:!(o&&o.running), steps:L1.stepsTotal, bE:+H.bE().toFixed(2), kR:s1.kR};
  { const tc=document.getElementById('tightChk'); tc.checked=true; tc.onchange&&tc.onchange(); }
  if(!H.running()) H.play();
  for(let b=0;b<200;b++){ o=H.step(120); if(!o.running) break; }
  if(H.running()) H.play();
  const L=H.log(), last=(L.series||[]).slice(-1)[0]||{};
  const d=H.dbg();
  const V=H.verts(), n=V.length; let mx=0;
  for(let i=0;i<n;i++){ const a=V[(i-1+n)%n], b2=V[i], c=V[(i+1)%n];
    const ux=b2[0]-a[0],uy=b2[1]-a[1],uz=b2[2]-a[2], vx=c[0]-b2[0],vy=c[1]-b2[1],vz=c[2]-b2[2];
    const cx2=uy*vz-uz*vy, cy2=uz*vx-ux*vz, cz2=ux*vy-uy*vx;
    const th=Math.atan2(Math.hypot(cx2,cy2,cz2), ux*vx+uy*vy+uz*vz);
    if(th>mx) mx=th; }
  const bendFrac=mx*d.tD/1.9;
  { const tc=document.getElementById('tightChk'); tc.checked=false; tc.onchange&&tc.onchange(); }
  return { ph1, tightFinal:{settled:!(o&&o.running), steps:L.stepsTotal,
    tD:last.tD, kR:last.kR, bendFrac:+bendFrac.toFixed(2), det3:H.det3d()} };
})()
