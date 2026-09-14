(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const seed=Number(process.env.SEED||4), K=Number(process.env.K||28);
  let s=seed; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; Math.random=rnd;
  const pts=_rkFourier(rnd,K,0.3,900); raw=fitToCanvas(pts); closedCurve=false; drawing=false; finishCurve(true);
  for(const c of crossings) c.over = rnd()<0.5?'A':'B'; updateKnotType(); syncKnot3D();
  H.play();
  const rec={nc:crossings.length, N, errAfterStart:+errL().toExponential(1), gmin:+(minSegGap()/L0).toExponential(1), inflate0:_inflate};
  window.__trialLog=[]; const tr=[];
  for(let k=0;k<Number(process.env.STEPS||60) && running;k++){ window.__trialLog.length=0; relaxStep();
    if(k<3 || k%20===0) tr.push({k, tier:_dbgTier, stall:_inflStall, stuck:_stuck, infl:+_inflate.toExponential(2), E:_ePrev, ntrials:window.__trialLog.length, first:window.__trialLog.slice(0,2), last:window.__trialLog.slice(-1)}); }
  rec.tr=tr; rec.running=running; rec.status=document.getElementById('status').textContent.slice(0,80);
  return rec; })()
