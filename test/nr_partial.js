(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80); const rows=[];
  for(const SEED of (process.env.SEEDS||'1,2,3,4,5,6,7,8').split(',').map(Number)){
    let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
    randomKnot(TARGET); H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
    _inflate=1;
    const chk=(tag)=>{ const eg=energyGrad(false), tg=minSegGap(); const cap=Math.min(0.25*L0,0.45*eg.gmin); return {tag, Einf:!isFinite(eg.E), gminPartial:+(eg.gmin/L0).toFixed(3), trueGap:+(tg/L0).toFixed(3), cap:+(cap/L0).toFixed(3), capOverSafe:+(cap/(0.45*tg)).toFixed(1)}; };
    const r={SEED, N, sN_L0:+(sNominal()/L0).toFixed(2), lift:chk('lift')};
    const d0=_detRobust(5); startFeasibility(300); r.feas=chk('feas'); r.detLift=d0; r.detFeas=_detRobust(5);
    rows.push(r); }
  return rows; })()
