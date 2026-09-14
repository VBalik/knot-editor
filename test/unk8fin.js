// Восьмёрка-каракуля (27 пересечений, трив.): полный путь до идеального круга
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('/Users/balik/My Drive/Programming/Claude/Knots/telemetry/knot-telemetry-20260726-220425-677.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  if(!H.running()) H.play();
  let o=null, b=0;
  for(;b<340;b++){ o=H.step(150); if(!o.running) break; }
  if(H.running()) H.play();
  const L=H.log(), last=(L.series||[]).slice(-1)[0]||{};
  const V=H.verts(), n=V.length; let cx=0,cy=0,cz=0;
  for(const v of V){cx+=v[0];cy+=v[1];cz+=v[2];} cx/=n;cy/=n;cz/=n;
  let sr=0,sr2=0;
  for(const v of V){ const r=Math.hypot(v[0]-cx,v[1]-cy,v[2]-cz); sr+=r; sr2+=r*r; }
  const mr=sr/n, rv=100*Math.sqrt(Math.max(0,sr2/n-mr*mr))/mr;
  return { settled:!(o&&o.running), steps:L.stepsTotal, bE:+H.bE().toFixed(3),
    target:+(1.5*4*Math.PI*Math.PI/n).toFixed(3), kR:last.kR,
    rvarPct:+rv.toFixed(1), det:H.det3d() };
})()
