(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  for(const seed of [11,12,13,14,15,16]){ for(const target of [80,120]){
    let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    randomKnot(target); const err0=errL(), gap0=minSegGap()/L0;
    let itc=0, conv=null; const oU=unstickLift; unstickLift=function(m){ const r=oU(m); itc++; if(conv===null && r===0 && errL()<1e-9) conv=itc; return r; };
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    const t=Date.now(); H.play(); const ms=Date.now()-t; if(running) H.play();
    unstickLift=oU; startFeasibility=oS;
    out.push({seed, target, nc:crossings.length, N, err0:+err0.toFixed(3), gap0:+gap0.toFixed(5), gT:+(0.05*thickDNominal()/L0).toFixed(4), convIt:conv, feasIt:fr.it, feasErr:+(fr.err/L0).toExponential(1), startMs:ms, inflate0:+_inflate.toFixed(4)}); } }
  return out; })()
