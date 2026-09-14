// 2.36: заведомо тесный узел — толщина утоньшается до посадки и затем растёт обратно, пока помещается; итог при ядре 1
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  for(const [seed,nc] of [[41001,60],[41002,100]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',10); H.setSlider('bendCoef',9); H.setSlider('repCoef',10);
    seeded(seed, ()=>randomKnot(nc));
    const rec={seed, nc:crossings.length, det:knotDet, N, L_s:Math.round(3000/(thickCoef+repCoef))};
    H.set({ms:1}); const t0=Date.now(); H.play();
    const tr=[]; let st=0, o=null, lastT=-1;
    while(true){ o=H.step(200); st+=200; const t=+_thickFit.toFixed(3); if(t!==lastT){ tr.push({st, thick:t, tries:_thickTries, done:_thickDone}); lastT=t; } if(!o.running || st>=150000) break; }
    rec.steps=st; rec.sec=Math.round((Date.now()-t0)/1000); rec.settled=!o.running; rec.thickEnd=+_thickFit.toFixed(3); rec.tries=_thickTries; rec.done=_thickDone; rec.inflEnd=+_inflate.toFixed(3); rec.trace=tr; rec.status=H.dbg().status.slice(0,150);
    out.push(rec); console.error(JSON.stringify(rec).slice(0,600)); }
  return out; })()
