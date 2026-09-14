// проба посадки крупных узлов при разных ползунках (1 попытка): thick/rep из env SL="1,1;2,1;3,1"
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const SL=(process.env.SL||'1,1').split(';').map(x=>x.split(',').map(Number)); const NCS=(process.env.NCS||'60,100').split(',').map(Number);
  for(const [w,r] of SL) for(const nc of NCS){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',w); H.setSlider('repCoef',r); H.setSlider('bendCoef',9);
    seeded(500+nc, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
    const d=H.dbg(); H.set({ms:1}); const t0=Date.now(); H.play();
    let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=80000) break; }
    const tr=window.__knotTrace();
    out.push({w,r,nc:d.crossings.length, det:d.knotDet, N:d.N, steps:st, sec:+((Date.now()-t0)/1000).toFixed(1), settled:!o.running, inflate:+tr.inflate.toFixed(3), status:H.dbg().status.slice(0,90)});
    console.error(JSON.stringify(out[out.length-1])); }
  return out; })()
