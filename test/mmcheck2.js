// порог седла в единицах λ₂ кольца: k-кратные окружности при N=300 и N=600 должны распознаваться, окружность — нет
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function torus(k,a,M){ const pts=[]; for(let i=0;i<M;i++){ const t=i/M*2*Math.PI; pts.push([(1+a*Math.cos(t))*Math.cos(k*t), (1+a*Math.cos(t))*Math.sin(k*t), a*Math.sin(t)]); } return pts; }
  for(const [k,a,M] of [[1,0,300],[1,0,600],[2,0.05,300],[2,0.05,600],[3,0.08,600]]){
    H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
    window.__knotSetVerts(torus(k,a,M)); H.set({ms:1}); window.__knotProject(60);
    const r1=window.__knotMinMode(), r2=window.__knotMinMode(); SADDLE_REL_SAVE=SADDLE_REL;
    const lam2=lamRing2();
    out['k'+k+'_N'+M]={lam:+r1.lam.toExponential(3), lamRepeat:+r2.lam.toExponential(3), its:r1.its, lam2:+lam2.toExponential(3), ratio:+(r1.lam/lam2).toFixed(3), flagged:r1.lam< -SADDLE_REL*lam2}; }
  return out; })()
