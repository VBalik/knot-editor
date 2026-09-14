// Свип веса выравнивания кривизны на рисунке юзера 31.07 (det 5, rep 1)
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  const raw=fs.readFileSync('/Users/balik/My Drive/Programming/Claude/Knots/telemetry/knot-telemetry-20260731-153505-210.json','utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  const EQ=+(process.env.EQ||0);
  H.set({eq:EQ});
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  H.setSlider('bendCoef', 10); H.setSlider('repCoef', +(process.env.REP||1));
  if(!H.running()) H.play();
  let o=null;
  for(let b=0;b<160;b++){ o=H.step(150); if(!o.running) break; }
  if(H.running()) H.play();
  const L=H.log();
  // равномерность: max/mean кривизны (сглаженной)
  const V=H.verts(), n=V.length;
  const th=new Array(n);
  for(let i=0;i<n;i++){ const a=V[(i-1+n)%n], b2=V[i], c=V[(i+1)%n];
    const ux=b2[0]-a[0],uy=b2[1]-a[1],uz=b2[2]-a[2], vx=c[0]-b2[0],vy=c[1]-b2[1],vz=c[2]-b2[2];
    const c1=uy*vz-uz*vy, c2=uz*vx-ux*vz, c3=ux*vy-uy*vx;
    th[i]=Math.atan2(Math.hypot(c1,c2,c3), ux*vx+uy*vy+uz*vz); }
  for(let p=0;p<2;p++){ const t2=th.slice();
    for(let i=0;i<n;i++){ th[i]=0.25*t2[(i-1+n)%n]+0.5*t2[i]+0.25*t2[(i+1)%n]; } }
  let mx=0, mean=0; for(const t of th){ if(t>mx) mx=t; mean+=t; } mean/=n;
  return { EQ, settled:!(o&&o.running), steps:L.stepsTotal,
    bE:+H.bE().toFixed(2), kRmax:+(mx*n/(2*Math.PI)).toFixed(1),
    ratio:+(mx/mean).toFixed(2), det3:H.det3d() };
})()
