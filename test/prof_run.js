// профиль: rand30 при 3/1/9, одна попытка, 3000 шагов (для node --cpu-prof)
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  H.setSlider('thick',3); H.setSlider('repCoef',1); H.setSlider('bendCoef',9);
  seeded(4343, ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); });
  const t0=Date.now(); H.set({ms:1}); H.play(); let o=null, st=0; while(st<3000){ o=H.step(100); st+=100; if(!o.running) break; }
  return {N, steps:st, ms:Date.now()-t0, msPerStep:+((Date.now()-t0)/st).toFixed(2), running:o.running}; })()
