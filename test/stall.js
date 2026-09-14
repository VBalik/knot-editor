(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  H.el('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; }, 240);
  H.play();
  const rows=[];
  for(let b=0;b<12;b++){ const o=H.step(5); const t=window.__knotTrace(); rows.push({st:(b+1)*5, bE:+H.bE().toFixed(3), mv:+t.moved.toFixed(4), stuck:t.stuck, eta:+t.eta.toExponential(1)}); if(!o.running) break; }
  window.__trialLog=[];
  H.step(2);
  const log=window.__trialLog; window.__trialLog=null;
  if(H.running()) H.play();
  return {rows, trials:log.slice(0,40)};
})()
