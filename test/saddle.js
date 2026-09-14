(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const cases={
    limacon: (u)=>{ const t=u*2*Math.PI; const r=60+110*Math.cos(t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; },       // внутренняя петля, 1 пересечение
    eight:   (u)=>{ const t=u*2*Math.PI; return {x:400+220*Math.sin(t), y:300+120*Math.sin(t)*Math.cos(t)}; },                // восьмёрка, 1 пересечение
    curl:    (u)=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t)+40*Math.cos(3*t), y:300+150*Math.sin(t)+70*Math.sin(3*t)}; }, // петля с завитком
    doubleLobe:(u)=>{ const t=u*2*Math.PI; const s=Math.sin(t); return {x:400+230*Math.sin(t)+(t<Math.PI? 0 : 60*Math.sin(2*t)), y:300+110*Math.sin(2*t)}; },
  };
  for(const [name,fn] of Object.entries(cases)){
    document.getElementById('clear').onclick(); H.drawCurve(fn, 320);
    const d=H.dbg(); H.setSlider('bendCoef',9); H.setSlider('thick',+(process.env.W||3)); H.setSlider('repCoef',+(process.env.R||2));
    if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=8000) break; } if(H.running()) H.play();
    out[name]={nc:d.crossings.length, det:d.knotDet, N, steps:st, bE_over_circle:+(H.bE()/(4*Math.PI*Math.PI/N)).toFixed(3), rvar:o.rvar, status:H.dbg().status.slice(0,50)}; }
  return out; })()
