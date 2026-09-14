// проверка minMode на заведомых сёдлах: k-кратно покрытая окружность с малой модуляцией (k=2,3)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function torus(k,a,M){ const pts=[]; for(let i=0;i<M;i++){ const t=i/M*2*Math.PI; pts.push([(1+a*Math.cos(t))*Math.cos(k*t), (1+a*Math.cos(t))*Math.sin(k*t), a*Math.sin(t)]); } return pts; }
  for(const [k,a] of [[1,0],[2,0.05],[2,0.02],[3,0.05],[3,0.1]]){
    H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
    const pts = k===1 ? torus(1,0,300) : torus(k,a,300);
    const set=window.__knotSetVerts(pts); H.set({ms:1});
    const circE=4*Math.PI*Math.PI/H.dbg().N; const rec={N:set.N, ratio0:+(H.bE()/circE).toFixed(3)};
    // сила и мода в исходном состоянии (после проекции длин)
    window.__knotProject(60);
    rec.mm36=window.__knotMinMode(36); rec.mm80=window.__knotMinMode(80);
    const tr0=window.__knotTrace();
    H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=20000) break; }
    const tr=window.__knotTrace();
    Object.assign(rec,{steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,60), saddleN:tr.saddleN, lastSaddle:tr.saddle});
    out['k'+k+'_a'+a]=rec; }
  return out; })()
