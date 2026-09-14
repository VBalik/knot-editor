(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), vm=global.__require('vm'); vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const out={};
  const mk=(fn,M)=>{ const pts=[]; for(let i=0;i<M;i++){ const p=fn(i/M); pts.push([p.x,p.y]); } return pts; };
  const cases={
    eight:      mk(u=>{ const t=u*2*Math.PI; return {x:400+220*Math.sin(t), y:300+120*Math.sin(t)*Math.cos(t)}; }, 600),
    eightDouble:mk(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.sin(t)-90*Math.sin(2*t), y:300+130*Math.sin(2*t)+60*Math.cos(3*t)}; }, 700),
    curl:       mk(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t)+40*Math.cos(3*t), y:300+150*Math.sin(t)+70*Math.sin(3*t)}; }, 600),
    lasso:      mk(u=>{ const t=u*2*Math.PI; return {x:400+60*Math.cos(t)+40*Math.cos(2*t), y:300+230*Math.sin(t)+120*Math.sin(2*t)}; }, 600),
  };
  for(const [name,pts] of Object.entries(cases)){
    const st=RK.bestStart(pts,60); document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx);
    const d=H.dbg(); H.setSlider('bendCoef',9); H.setSlider('thick',+(process.env.W||3)); H.setSlider('repCoef',+(process.env.R||2));
    if(!H.running()) H.play(); let o=null, s=0; while(true){ o=H.step(100); s+=100; if(!o.running || s>=8000) break; } if(H.running()) H.play();
    out[name]={nc:d.crossings.length, det:d.knotDet, N, steps:s, bE_over_circle:+(H.bE()/(4*Math.PI*Math.PI/N)).toFixed(3), rvar:o.rvar, fRel:+window.__knotTrace().fRel.toExponential(1), status:H.dbg().status.slice(0,50)}; }
  return out; })()
