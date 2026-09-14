(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const seeds=(process.env.SEEDS||'21,22,23,24,25,26,27,28,29,30').split(',').map(Number); const target=Number(process.env.T||120);
  for(const seed of seeds){
    let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    randomKnot(target); const err0=errL(), gap0=minSegGap()/L0;
    let itc=0, conv=null; const oU=unstickLift; unstickLift=function(m){ const r=oU(m); itc++; if(conv===null && errL()<1e-9) conv=itc; return r; };
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    H.play(); unstickLift=oU; startFeasibility=oS;
    const rec={seed, nc:crossings.length, N, thick:+_thickScale.toFixed(3), err0:+err0.toFixed(3), gap0:+gap0.toFixed(4), convIt:conv, feasErr:+(fr.err/L0).toExponential(1), errAfterStart:+errL().toExponential(1)};
    let acc=0, rej=0; for(let k=0;k<40 && running;k++){ relaxStep(); if(_dbgTier<0) rej++; else acc++; }
    Object.assign(rec,{acc,rej,infl:+_inflate.toFixed(3)}); if(running) H.play();
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
