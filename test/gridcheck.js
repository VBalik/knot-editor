// эквивалентность сеточного и полного перебора пар: E, gmin, gminRep, силы
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const [name,prep,w,r] of [['trefoil',()=>H.clickPreset('trefoil'),5,2],['rand20',()=>randomKnot(20),5,2],['rand40_1010',()=>randomKnot(40),10,10],['rand60_11',()=>randomKnot(60),1,1]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',w); H.setSlider('repCoef',r); prep(); H.set({ms:1});
    H.play(); H.step(150);   // состояние в середине спуска (с надуванием)
    const rec={name, N, inflate:+_inflate.toFixed(2)}; let maxRel=0, maxF=0;
    for(let k=0;k<3;k++){
      if(k>0) H.step(50);
      _pairBrute=true; const a=energyGrad(true); const fa=[Array.from(_fx),Array.from(_fy),Array.from(_fz)];
      _pairBrute=false; const b=energyGrad(true);
      const rel=(x,y)=>Math.abs(x-y)/Math.max(1e-300,Math.abs(x),Math.abs(y));
      if(isFinite(a.E)||isFinite(b.E)) maxRel=Math.max(maxRel, isFinite(a.E)&&isFinite(b.E)? rel(a.E,b.E) : 1);
      maxRel=Math.max(maxRel, rel(a.gmin,b.gmin), rel(a.gminRep,b.gminRep));
      let fm=0; for(let i=0;i<N;i++) fm=Math.max(fm, Math.abs(_fx[i]), Math.abs(_fy[i]), Math.abs(_fz[i]));
      for(let i=0;i<N;i++) maxF=Math.max(maxF, Math.abs(fa[0][i]-_fx[i])/fm, Math.abs(fa[1][i]-_fy[i])/fm, Math.abs(fa[2][i]-_fz[i])/fm);
    }
    rec.maxRelEG=+maxRel.toExponential(2); rec.maxRelF=+maxF.toExponential(2);
    if(H.running()) H.play(); out.push(rec); }
  return out; })()
