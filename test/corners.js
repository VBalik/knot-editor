// 2.35: случайные диаграммы без прямых углов — наибольший излом между соседними рёбрами кривой, число пересечений, расстояние между
// пересечениями, тип узла лифта = тип диаграммы; и что толщина в лифте/3D не пострадала
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const maxTurn=(pts)=>{ let mx=0; const n=pts.length; for(let i=0;i<n;i++){ const a=pts[(i-1+n)%n], b=pts[i], c=pts[(i+1)%n]; const ux=b.x-a.x, uy=b.y-a.y, vx=c.x-b.x, vy=c.y-b.y; const lu=Math.hypot(ux,uy), lv=Math.hypot(vx,vy); if(lu<1e-9||lv<1e-9) continue; const ang=Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(lu*lv)))); if(ang>mx) mx=ang; } return +(mx*180/Math.PI).toFixed(1); };
  for(const [seed,nc] of [[31001,8],[31002,14],[31003,20],[31004,30],[31005,50]]){
    H.el('clear').onclick(); seeded(seed, ()=>randomKnot(nc));
    const rec={seed, want:nc, got:crossings.length, det:knotDet, unknot:isUnknot, N, maxTurnRaw:maxTurn(raw), maxTurnSmooth:maxTurn(smooth), minCross:+(_minCrossDist()).toFixed(1), SEP:+(1.5*CROSS_R).toFixed(1), liftDet:_detRobust(3), status:H.dbg().status.slice(0,90)};
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
