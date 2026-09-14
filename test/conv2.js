(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  if(H.running()) H.play();
  H.clickPreset('cinquefoil'); H.play();
  const rows=[]; let o=null, prevE=null;
  for(let b=0;b<60;b++){ o=H.step(100); const t=window.__knotTrace();
    rows.push({st:(b+1)*100, E:+(t.E||0).toFixed(4), dE:prevE==null?0:+(t.E-prevE).toExponential(1), fRel:+t.fRel.toFixed(3), gmin:+t.gmin.toFixed(2), D:+t.D.toFixed(2), collide:t.collide, mv:+t.moved.toExponential(1)});
    prevE=t.E; if(!o.running) break; }
  if(H.running()) H.play();
  return {status:H.dbg().status.slice(0,40), rows:rows.filter((r,i)=>i%3===0)};
})()
