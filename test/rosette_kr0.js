// розетка-ловушка без хвоста отталкивания (kr=0): есть ли отрицательная мода и раскрывается ли спуск
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const pts=JSON.parse(fs.readFileSync('fixtures/trap_coilloop.json','utf8'));
  for(const kr of [+(process.env.KR0||0), 2e4]){
    H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
    window.__knotSetVerts(pts); H.set({ms:1, kr}); window.__knotProject(60);
    const circE=4*Math.PI*Math.PI/H.dbg().N; const rec={ratio0:+(H.bE()/circE).toFixed(3)};
    for(const k of [60,150]){ const r=window.__knotMinMode(k); rec['mm'+k]={lam:r.lam, lamMax:r.lamMax}; }
    H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=40000) break; }
    const tr=window.__knotTrace(); Object.assign(rec,{steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,70), saddleN:tr.saddleN, lastSaddle:tr.saddle, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3)});
    out['kr'+kr]=rec; }
  return out; })()
