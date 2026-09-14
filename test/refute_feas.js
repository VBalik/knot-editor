(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e; };
  const seeds=(process.env.SEEDS||'1,2,3,4,5').split(',').map(Number); const target=Number(process.env.TARGET||80);
  for(const seed of seeds){
    let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    randomKnot(target);
    let itc=0, conv=null, tailMs=0, idle=0, gapAtConv=null, deltaAtConv=null;
    const oU=unstickLift, oG=minSegGap;
    unstickLift=function(m){ const t=performance.now(); const r=oU(m); const dt=performance.now()-t; itc++;
      if(conv!==null){ tailMs+=dt; if(r===0) idle++; }
      if(conv===null && r===0 && errL()<1e-9*L0){ conv=itc; gapAtConv=oG();
        // что вычислил бы unstickLift для самой тесной пары: delta=min(0.55*(gT-d),0.45*gO) — без gO оценка сверху
        deltaAtConv=0.55*(0.05*thickDNominal()-gapAtConv); }
      return r; };
    minSegGap=function(){ const t=performance.now(); const r=oG(); if(conv!==null) tailMs+=performance.now()-t; return r; };
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ const t=performance.now(); fr=oS(m); fr.ms=performance.now()-t; return fr; };
    const t=performance.now(); H.play(); const startMs=performance.now()-t; if(running) H.play();
    unstickLift=oU; minSegGap=oG; startFeasibility=oS;
    const gT=0.05*thickDNominal();
    out.push({seed, target, nc:crossings.length, N, feasIt:fr.it, feasMs:+fr.ms.toFixed(0), startMs:+startMs.toFixed(0), convUnstickCall:conv, idleUnstickCalls:idle, tailMs:+tailMs.toFixed(0),
      gapMinusGT_L0: gapAtConv===null?null:+((gapAtConv-gT)/L0).toExponential(3), deltaUpper_L0: deltaAtConv===null?null:+(deltaAtConv/L0).toExponential(3), breakThresh_L0:1e-7,
      exitCondHolds: gapAtConv===null?null:(gapAtConv>=gT)});
  }
  return out; })()
