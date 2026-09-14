(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const seeds=(process.env.SEEDS||'1,2,3').split(',').map(Number); const K=Number(process.env.K||40);
  for(const seed of seeds){
    let s=seed; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; Math.random=rnd;
    if(H.running()) H.play();
    const pts=_rkFourier(rnd,K,0.3,900); raw=fitToCanvas(pts); closedCurve=false; drawing=false; finishCurve(true);
    for(const c of crossings) c.over = rnd()<0.5?'A':'B'; updateKnotType(); syncKnot3D();
    const err0=errL(), gap0=minSegGap()/L0;
    let itc=0, conv=null; const oU=unstickLift; unstickLift=function(m){ const r=oU(m); itc++; if(conv===null && errL()<1e-9) conv=itc; return r; };
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    const t0=Date.now(); H.play(); const ms=Date.now()-t0; startFeasibility=oS; unstickLift=oU;
    const rec={seed, K, nc:crossings.length, N, thick:+_thickScale.toFixed(3), err0:+err0.toFixed(3), gap0:+gap0.toExponential(1), convIt:conv, feasIt:fr.it, feasErr:+(fr.err/L0).toExponential(1), errAfterStart:+errL().toExponential(1), inflate0:+_inflate.toExponential(2), startMs:ms};
    let acc=0, rej=0, maxRun=0, run=0; const S=Number(process.env.STEPS||100);
    for(let k=0;k<S && running;k++){ relaxStep(); if(_dbgTier<0){rej++; run++; if(run>maxRun) maxRun=run;} else {acc++; run=0;} }
    Object.assign(rec,{acc,rej,maxRun,infl:+_inflate.toFixed(3),stall:_inflStall,status:document.getElementById('status').textContent.slice(0,50)}); if(running) H.play();
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
