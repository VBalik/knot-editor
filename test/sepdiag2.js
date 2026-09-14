(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const t of [1,2,3,5,8,12,20,35,50,75,100]) for(let k=0;k<3;k++){
    const t0=Date.now(); randomKnot(t); const ms=Date.now()-t0;
    let md=_minCrossDist(); out.push({t, nc:crossings.length, det:knotDet, md:+md.toFixed(1), ms, N:H.dbg().N, st:H.dbg().status.replace(/ · press.*/,'').slice(15,120)}); }
  return out; })()
