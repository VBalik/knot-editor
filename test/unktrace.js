(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={};
  function trace(name, fn, npts){
    H.el('clear').onclick(); H.drawCurve(fn, npts||240);
    if(!H.running()) H.play();
    const rows=[]; let o=null;
    for(let b=0;b<120;b++){ o=H.step(10); const t=window.__knotTrace();
      if(b%6===0||!o.running) rows.push({st:(b+1)*10, bE:+H.bE().toFixed(3), E:+(t.E||0).toFixed(3), fRel:+t.fRel.toFixed(4), mv:+t.moved.toFixed(4), eta:+t.eta.toExponential(1), stuck:t.stuck, settle:t.settle, run:o.running});
      if(!o.running) break; }
    if(H.running()) H.play();
    out[name]={circle:+(4*Math.PI*Math.PI/H.dbg().N).toFixed(3), status:H.dbg().status.slice(0,40), rows};
  }
  trace('rosette3', u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; });
  trace('writheCoil', u=>{ const t=u*2*Math.PI; const r=60+130*Math.cos(3*t); return {x:400+r*Math.cos(t)*0.9, y:300+r*Math.sin(t)*0.9}; }, 300);
  return out;
})()
