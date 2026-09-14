// прогон пользователя (telemetry 16:59, 20 пересечений, w=r=10, bend=2): анализ конечного состояния
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const fin=JSON.parse(fs.readFileSync('fixtures/user_20cross_final.json','utf8'));
  H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
  H.setSlider('thick',10); H.setSlider('repCoef',10); H.setSlider('bendCoef',2);
  out.set=window.__knotSetVerts(fin); H.set({ms:1}); window.__knotProject(60);
  const circE=4*Math.PI*Math.PI/H.dbg().N; out.ratio0=+(H.bE()/circE).toFixed(3); out.circE=+circE.toFixed(4);
  const tr0=window.__knotTrace(); out.gminRep_s0=+(tr0.gminRep/tr0.sEff).toFixed(3); out.sEff_L0=tr0.sEff;
  out.mmTail={60:window.__knotMinMode(60), 150:window.__knotMinMode(150)};
  H.set({kr:0}); out.mmNoTail={60:window.__knotMinMode(60), 150:window.__knotMinMode(150)}; H.set({kr:2e4});
  H.play(); let o=null, st=0; const log=[]; while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace(); if(st%2000===0) log.push({st, ratio:+(H.bE()/circE).toFixed(3), fRel:+tr.fRel.toExponential(2), quietBy:tr.quietBy}); if(!o.running || st>=30000) break; }
  const tr=window.__knotTrace(); out.run={steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,80), quietBy:tr.quietBy, fRel:tr.fRel, saddleN:tr.saddleN, lastSaddle:tr.saddle, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), log};
  return out; })()
