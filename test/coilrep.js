(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={};
  const coil=u=>{ const t=u*2*Math.PI; const r=60+130*Math.cos(3*t); return {x:400+r*Math.cos(t)*0.9, y:300+r*Math.sin(t)*0.9}; };
  for(const rep of [3,10,20]){
    if(H.running()) H.play();
    H.el('clear').onclick(); H.drawCurve(coil, 300);
    H.setSlider('bendCoef',9); H.setSlider('repCoef',rep);
    if(!H.running()) H.play();
    let o=null, steps=0;
    for(let b=0;b<1200;b++){ o=H.step(25); steps+=25; if(!o.running) break; }
    if(H.running()) H.play();
    const d=H.dbg();
    out['rep'+rep]={settled:!(o&&o.running), steps, bE:+H.bE().toFixed(3), circle:+(4*Math.PI*Math.PI/d.N).toFixed(3), rvar:o&&o.rvar, det:H.det3d(), status:d.status.slice(0,36)};
  }
  return out;
})()
