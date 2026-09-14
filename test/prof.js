// профиль шага физики: время и число вызовов energyGrad / projectLengths / dirTangentProject / _closestSeg
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const T={}; const C={};
  function wrap(name){ const orig=globalThis[name]; if(typeof orig!=='function') return; T[name]=0; C[name]=0;
    globalThis[name]=function(...a){ const t0=performance.now(); const r=orig.apply(this,a); T[name]+=performance.now()-t0; C[name]++; return r; }; }
  for(const n of ['energyGrad','projectLengths','projectLengthsSafe','dirTangentProject','sobolevH2','lbfgsDir','_closestSeg','minSegGapRep','minSegGap']) wrap(n);
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); H.set({ms:1});
  out.N=N; out.det=knotDet;
  H.play();
  // прогрев надувания
  H.step(200); for(const k in T){ T[k]=0; C[k]=0; }
  const t0=performance.now(); const STEPS=300; H.step(STEPS); const wall=performance.now()-t0;
  out.msPerStep=+(wall/STEPS).toFixed(2);
  out.breakdown={}; for(const k in T) out.breakdown[k]={ms:+(T[k]/STEPS).toFixed(2), calls:+(C[k]/STEPS).toFixed(1)};
  out.inflate=+_inflate.toFixed(2); out.status=H.dbg().status.slice(0,60);
  if(H.running()) H.play();
  return out; })()
