// Рисунок пользователя из последней телеметрии → новое ядро; следим за
// распределением кривизны (max угол, max/mean) — «локальные напряжения»
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), path=global.__require('path');
  const dir=path.join(process.cwd(),'..','telemetry');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort();
  const raw=fs.readFileSync(path.join(dir, process.env.TELEM||files[files.length-1]),'utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  const smooth=+(process.env.SMOOTH||40), mom=+(process.env.MOM||0.85);
  const sob=+(process.env.SOB||20); window.__knotSet({smooth, momentum:mom, sob});
  window.__trialLog=null; H.setSlider('bendCoef', 10); H.setSlider('repCoef', 3);
  if(!H.running()) H.play();
  const stats=()=>{ const V=H.verts(), n=V.length; const th=[]; let e=0;
    for(let i=0;i<n;i++){ const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
      const cx=uy*vz-uz*vy, cy=uz*vx-ux*vz, cz=ux*vy-uy*vx;
      const t=Math.atan2(Math.hypot(cx,cy,cz), ux*vx+uy*vy+uz*vz); th.push(t); e+=t*t; }
    th.sort((a,b)=>b-a); const mean=th.reduce((a,b)=>a+b,0)/n;
    return {maxDeg:+(th[0]*57.3).toFixed(1), top5:th.slice(0,5).map(x=>+(x*57.3).toFixed(1)), meanDeg:+(mean*57.3).toFixed(2), ratio:+(th[0]/mean).toFixed(2), bE:+e.toFixed(3), n}; };
  const out={smooth, mom, sob, N:H.dbg().N, det:H.dbg().runDet, rows:[]};
  out.rows.push({st:0, ...stats()});
  let o=null;
  for(let b=0;b<32;b++){ o=H.step(250); if((b+1)%4===0 || !o.running) { const t=window.__knotTrace(); out.rows.push({st:(b+1)*250, ...stats(), fRel:+t.fRel.toFixed(4), moved:+t.moved.toFixed(3), eta:+t.eta.toExponential(2), stuck:t.stuck, gminD:+(t.gmin/t.D).toFixed(2), tier:t.tier, lb:t.lb}); } if(!o.running) break; }
  out.status=H.dbg().status.slice(0,44); out.settled=!(o&&o.running);
  if(H.running()) H.play();
  return out;
})()
