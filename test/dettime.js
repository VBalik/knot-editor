(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||5)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const out=[];
  for(const target of [40,80,120]){ randomKnot(target); const t=Date.now(); const d=_detRobust(5); const ms=Date.now()-t;
    // число пересечений в 3 проекциях
    out.push({target, nc:crossings.length, N, det:d, ms, msPer:+(ms/5).toFixed(0)}); }
  return out; })()
