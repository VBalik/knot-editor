(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  H.el('clear').onclick(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); H.set({ms:1}); H.play(); H.step(200);
  const t0=performance.now(); H.step(600); const ms=(performance.now()-t0)/600;
  if(H.running()) H.play(); return {N, msPerStep:+ms.toFixed(2)}; })()
