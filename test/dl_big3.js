(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const K=Number(process.env.K||28);
  for(const seed of [3,4]){
    let s=seed; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; Math.random=rnd;
    if(H.running()) H.play();
    const pts=_rkFourier(rnd,K,0.3,900); raw=fitToCanvas(pts); closedCurve=false; drawing=false; finishCurve(true);
    for(const c of crossings) c.over = rnd()<0.5?'A':'B'; updateKnotType(); syncKnot3D();
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    const det0=_detRobust(3);
    H.play(); startFeasibility=oS;
    const rec={seed, nc:crossings.length, N, knotDet, det0, runDet:_runDet, feasIt:fr.it, feasErr:+(fr.err/L0).toExponential(1), errAfterStart:+errL().toExponential(1), gmin0:+(minSegGap()/L0).toExponential(1), inflate0:+_inflate.toExponential(2)};
    const S = seed===4 ? Number(process.env.STEPS||300) : 5;
    let acc=0, rej=0, ratchets=0; window.__trialLog=[]; let first=null;
    for(let k=0;k<S && running;k++){ window.__trialLog.length=0; const ip=_inflate; relaxStep(); if(_dbgTier<0) rej++; else acc++; if(_inflate!==ip) ratchets++;
      if(first===null && _dbgTier<0) first=window.__trialLog.map(t=>[t.tier,t.t,t.moveL0,t.dE,t.gmin,t.gmin0]).filter((x,i)=>i<3||i===7||i===8||i===15||i===23); }
    Object.assign(rec,{steps:S,acc,rej,ratchets,inflEnd:+_inflate.toExponential(2),stall:_inflStall,stuck:_stuck,running,errEnd:+errL().toExponential(1),firstRejTrials:first,status:document.getElementById('status').textContent.slice(0,70)});
    if(running) H.play(); out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
