(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={};
  for(const key of ['trefoil','cinquefoil']){
    if(H.running()) H.play();           // остановить предыдущий прогон
    H.clickPreset(key);
    H.play();
    const rows=[]; let o=null;
    for(let b=0;b<60;b++){ o=H.step(100); const t=window.__knotTrace();
      rows.push({st:(b+1)*100, bE:+H.bE().toFixed(4), E:+(t.E||0).toFixed(4), fRel:+t.fRel.toFixed(4), mv:+t.moved.toExponential(1), eta:+t.eta.toExponential(1), stuck:t.stuck, settle:t.settle});
      if(!o.running) break; }
    out[key]={running:H.running(), status:H.dbg().status.slice(0,40), rows:rows.filter((r,i)=>i%5===0||i===rows.length-1)};
    if(H.running()) H.play();
  }
  return out;
})()
