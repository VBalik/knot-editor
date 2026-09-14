(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  H.el('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; }, 240);
  const out={N:H.dbg().N};
  out.tier0=window.__knotTrial(0);
  out.tier1=window.__knotTrial(1);
  return out;
})()
