// проба: сколько шагов/секунд занимает одна попытка на 20/60/100 пересечениях при 5/2/9 и садится ли узел
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  for(const nc of [20,60,100]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
    seeded(500+nc, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
    const d=H.dbg(); H.set({ms:1}); const t0=Date.now(); H.play();
    let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=60000) break; }
    const tr=window.__knotTrace();
    out.push({nc:d.crossings.length, det:d.knotDet, N:d.N, steps:st, sec:+((Date.now()-t0)/1000).toFixed(1), settled:!o.running, inflate:tr.inflate, E:tr.msEnergies, status:H.dbg().status.slice(0,120)});
    console.error(JSON.stringify(out[out.length-1])); }
  return out; })()
