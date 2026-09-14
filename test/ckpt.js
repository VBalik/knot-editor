// чекпойнт истинной энергии: как часто восстанавливается и что даёт (одна попытка на случайных узлах, с/без чекпойнта)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const origEnd=stiffPhaseEnd;
  for(let k=0;k<4;k++){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
    let t=0; do{ randomKnot(14); }while(isUnknot && t++<30); const rawPts=raw.map(p=>({x:p.x,y:p.y})); const overs=crossings.map(c=>c.over);
    const rec={det:knotDet, N};
    // с чекпойнтом
    H.set({ms:1}); H.play(); runToEnd(60000); rec.withCk={E:+_ePrev.toPrecision(4), ck:window.__knotTrace().ck, status:H.dbg().status.slice(0,30)};
    // та же диаграмма без чекпойнта (отключаем восстановление)
    raw=rawPts.map(p=>({x:p.x,y:p.y})); closedCurve=false; drawing=false; finishCurve(true); crossings.forEach((c,i)=>c.over=overs[i]); updateKnotType(); syncKnot3D();
    stiffPhaseEnd=function(){ _ckVerts=null; origEnd(); };
    H.set({ms:1}); H.play(); runToEnd(60000); rec.noCk={E:+_ePrev.toPrecision(4), status:H.dbg().status.slice(0,30)};
    stiffPhaseEnd=origEnd; out.push(rec); }
  return out; })()
