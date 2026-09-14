(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  randomKnot(80);
  const wrap=(name)=>{ const orig=globalThis[name]; const st={calls:0, ms:0}; globalThis[name]=function(...a){ const t=performance.now(); const r=orig.apply(this,a); st.ms+=performance.now()-t; st.calls++; return r; }; return st; };
  const sG=wrap('minSegGap'), sU=wrap('unstickLift'), sP=wrap('projectLengths'), sE=wrap('energyGrad'), sD=wrap('_detRobust');
  // итерация, на которой startFeasibility фактически сошёлся: первая с err<1e-9 и без пушей
  let conv=null, itc=0; const oU=unstickLift; unstickLift=function(m){ const r=oU(m); itc++; if(conv===null && r===0){ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } if(e<1e-9*L0){ conv=itc; conv_gap=minSegGap(); } } return r; };
  let conv_gap=0;
  const t=performance.now(); H.play(); const total=performance.now()-t;
  const gT=0.05*thickDNominal();
  return {N, totalMs:+total.toFixed(0), minSegGap:{calls:sG.calls, ms:+sG.ms.toFixed(0)}, unstick:{calls:sU.calls, ms:+sU.ms.toFixed(0)}, proj:{calls:sP.calls, ms:+sP.ms.toFixed(0)}, eGrad:{calls:sE.calls, ms:+sE.ms.toFixed(0)}, det:{calls:sD.calls, ms:+sD.ms.toFixed(0)}, convergedAtUnstickCall:conv, gapMinusGT_L0:(conv_gap-gT)/L0}; })()
