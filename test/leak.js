(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  if(H.running()) H.play();
  H.clickPreset('cinquefoil'); window.__dbgLeak=[]; if(!H.running()) H.play();
  H.step(60); if(H.running()) H.play();
  const L=window.__dbgLeak; window.__dbgLeak=null;
  const rows=L.filter(r=>r.afterProj>r.prevAcc+1e-9).slice(0,6).map(r=>({st:r.st, prevAcc:+r.prevAcc.toFixed(5), beforeProj:+r.beforeProj.toFixed(5), afterProj:+r.afterProj.toFixed(5)}));
  return {nLeaks:L.filter(r=>r.afterProj>r.prevAcc+1e-9).length, of:L.length, sample:rows};
})()
