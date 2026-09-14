(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N, det2d:knotDet};
  const detDist=(k)=>{ const m={}; for(let t=0;t<k;t++){ const v=_detRobust(1); m[v]=(m[v]||0)+1; } return m; };
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  out.lift={gap_L0:+(minSegGap()/L0).toFixed(4), det:detDist(21)};
  if(!H.running()) H.play();
  out.afterStart={gap_L0:+(minSegGap()/L0).toFixed(4), det:detDist(21), runDet:_runDet, inflate:+_inflate.toFixed(4)};
  H.step(300); out.after300={gap_L0:+(minSegGap()/L0).toFixed(4), det:detDist(21)};
  H.step(700); out.after1000={gap_L0:+(minSegGap()/L0).toFixed(4), det:detDist(21)};
  if(H.running()) H.play(); return out; })()
