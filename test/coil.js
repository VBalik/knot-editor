// три коаксиальных витка (торическая кривая (3,1), тривиальный узел): седло эластики —
// проверка второго порядка должна найти отрицательную моду и раскрыть витки в окружность
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
  const d0=H.dbg(); out.diag={N:d0.N, det:d0.knotDet};
  const pts=[]; const M=600, R=1, a=0.3;
  for(let i=0;i<M;i++){ const t=i/M*2*Math.PI; pts.push([(R+a*Math.cos(t))*Math.cos(3*t), (R+a*Math.cos(t))*Math.sin(3*t), a*Math.sin(t)]); }
  out.set=window.__knotSetVerts(pts);
  H.set({ms:1});
  const circE=4*Math.PI*Math.PI/H.dbg().N; out.circE=+circE.toFixed(4);
  const t0=Date.now(); out.mmCoil=window.__knotMinMode(36); out.mmMs=Date.now()-t0; out.bECoil=+H.bE().toFixed(4); out.ratioCoil=+(H.bE()/circE).toFixed(3);
  H.play(); let o=null, st=0; const log=[]; let lastN=0;
  while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace();
    if(tr.saddleN!==lastN){ log.push({st, saddle:tr.saddle, bE:+H.bE().toFixed(4), ratio:+(H.bE()/circE).toFixed(3)}); lastN=tr.saddleN; }
    if(!o.running || st>=30000) break; }
  const tr=window.__knotTrace();
  out.run={steps:st, settled:!o.running, status:H.dbg().status, bE:+H.bE().toFixed(4), ratio:+(H.bE()/circE).toFixed(3), saddleN:tr.saddleN, lastSaddle:tr.saddle, quietBy:tr.quietBy, log};
  out.mmFinal=window.__knotMinMode(36);
  return out; })()
