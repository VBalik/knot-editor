(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const oS=startFeasibility; let fr=null; startFeasibility=function(m){ const t=performance.now(); fr=oS(m); fr.ms=performance.now()-t; return fr; };
  const run=(label)=>{ const t=performance.now(); H.play(); const ms=performance.now()-t; if(running) H.play();
    const gT=0.05*thickDNominal(); out.push({label, N, nc:crossings.length, feasIt:fr.it, feasMs:+fr.ms.toFixed(0), startMs:+ms.toFixed(0), gapMinusGT_L0:+((minSegGap()-gT)/L0).toExponential(2)}); };
  for(const k of ['trefoil','figure8','cinquefoil','septafoil']){ H.clickPreset(k); run('preset:'+k); }
  for(const [seed,target] of [[1,8],[1,30],[2,30],[1,60]]){ let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; randomKnot(target); run('rand seed'+seed+' t'+target); }
  return out; })()
