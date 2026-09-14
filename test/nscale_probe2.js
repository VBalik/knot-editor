(async ()=>{
  let _seed=12345; Math.random=()=>{ _seed=(_seed*1103515245+12345)&0x7fffffff; return _seed/0x7fffffff; };
  const H=global.__H; window.__noAutoSave=true;
  const runTo=(maxB)=>{ if(!H.running()) H.play(); let o=null,st=0; for(let b=0;b<(maxB||600);b++){ o=H.step(25); st+=25; if(!o.running) break; } const wr=H.running(); if(wr) H.play(); return {settled:!wr, steps:st, status:H.dbg().status.slice(0,80)}; };
  const fg=()=>{ const n=N, S=sNominal(), DC=4*S; let gminF=Infinity, nHalo=0; for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n; const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue; const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; const wArg=(cd*L0/(2*Math.max(x,1e-12))-1)/0.15; if(wArg<=0) continue; if(x<gminF) gminF=x; if(x-S<DC) nHalo++; } } return {gapF_s:+(gminF/S).toFixed(3), gapF_world:+gminF.toFixed(4), nHalo}; };
  const split=()=>{ _inflate=1; const g=energyGrad(false); const Eb=kBend()*H.bE(); return Object.assign({N, s_world:+sNominal().toFixed(4), Ebend:+Eb.toExponential(3), Erep:+(g.E-Eb).toExponential(3), ratio:+((g.E-Eb)/Eb).toExponential(3), inflate:_inflate}, fg()); };
  const dbl=()=>{ const V=H.verts(), n=V.length, arr=[]; for(let i=0;i<n;i++){ const a=V[i], b=V[(i+1)%n]; arr.push(a); arr.push([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); } window.__knotSetVerts(arr); };
  const out={};
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); out.r225=runTo(800); out.m225=split();
  dbl(); out.r450=runTo(1200); out.m450=split();
  dbl(); out.r900=runTo(1600); out.m900=split();
  // kR x10 при N=225
  const k0=KR_CONST; KR_CONST=k0*10; H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); out.r225_kR10=runTo(800); out.m225_kR10=split(); KR_CONST=k0;
  // kR /8 при N=450 (компенсация N^3) — должно вернуть зазор к N=225
  KR_CONST=k0/8; H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); runTo(800); dbl(); out.r450_kRdiv8=runTo(1200); out.m450_kRdiv8=split(); KR_CONST=k0;
  return out; })()
