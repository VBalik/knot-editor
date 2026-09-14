(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const t of [30,60]){ randomKnot(t); if(!H.running()) H.play();
    const rec={target:t, nc:crossings.length, steps:0, hiddenTrueGapSteps:0, worstRatioTrue:0, worstRatioSeen:0, maxTruncGap:0, samples:[]};
    for(let s=0;s<1500 && running;s++){ const trueG=minSegGap(); relaxStep(); rec.steps++;
      const seen=_dbgGmin, mv=_dbgMoved; if(seen>trueG*(1+1e-9)) rec.hiddenTrueGapSteps++;
      const rT=mv/trueG, rS=mv/seen; if(rT>rec.worstRatioTrue){ rec.worstRatioTrue=rT; rec.samples.push({s, mvL0:+(mv/L0).toFixed(3), trueGL0:+(trueG/L0).toFixed(3), seenGL0:+(seen/L0).toFixed(3), DL0:+(thickD()/L0).toFixed(3)}); }
      if(rS>rec.worstRatioSeen) rec.worstRatioSeen=rS; }
    rec.worstRatioTrue=+rec.worstRatioTrue.toFixed(3); rec.worstRatioSeen=+rec.worstRatioSeen.toFixed(3); rec.samples=rec.samples.slice(-3);
    rec.detEnd=_detRobust(5); rec.runDet=_runDet; if(H.running()) H.play(); out.push(rec); }
  return out; })()
