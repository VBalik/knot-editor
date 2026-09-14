(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const seeds=(process.env.SEEDS||'1,2,3,4,5,6,7,8').split(',').map(Number); const target=Number(process.env.T||120);
  for(const seed of seeds){
    let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    randomKnot(target); const err0=errL();
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    H.play(); startFeasibility=oS;
    const rec={seed, nc:crossings.length, N, thick:+_thickScale.toFixed(3), err0:+err0.toFixed(3), feasIt:fr.it, feasErr:+(fr.err/L0).toExponential(1), errAfterStart:+errL().toExponential(1), inflate0:+_inflate.toFixed(4)};
    let acc=0, rej=0, maxRejRun=0, run=0; const S=Number(process.env.STEPS||300);
    for(let k=0;k<S && running;k++){ relaxStep(); if(_dbgTier<0){ rej++; run++; if(run>maxRejRun) maxRejRun=run; } else { acc++; run=0; } }
    Object.assign(rec,{acc,rej,maxRejRun,inflEnd:+_inflate.toFixed(3),running});
    if(running) H.play();
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
