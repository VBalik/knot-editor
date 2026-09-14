// состояние пользователя (det 11, w=r=10, bend=2): адаптивный Ланцош, выход из седла и продолжение спуска
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const fin=JSON.parse(fs.readFileSync('fixtures/user_20cross_final.json','utf8'));
  H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
  H.setSlider('thick',10); H.setSlider('repCoef',10); H.setSlider('bendCoef',2);
  out.set=window.__knotSetVerts(fin); H.set({ms:1}); window.__knotProject(60);
  const circE=4*Math.PI*Math.PI/H.dbg().N; out.ratio0=+(H.bE()/circE).toFixed(3);
  let t0=Date.now(); out.mm=window.__knotMinMode(); out.mmMs=Date.now()-t0;
  t0=Date.now(); out.escape=window.__knotSaddle(); out.escMs=Date.now()-t0; out.ratioAfter=+(H.bE()/circE).toFixed(3);
  H.play(); let o=null, st=0; const log=[]; let lastN=0;
  while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace();
    if(tr.saddleN!==lastN){ log.push({st, saddle:tr.saddle, ratio:+(H.bE()/circE).toFixed(3)}); lastN=tr.saddleN; }
    if(!o.running || st>=+(process.env.BUDGET||40000)) break; }
  const tr=window.__knotTrace(); out.run={steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), E:H.dbg().status.slice(0,90), quietBy:tr.quietBy, fRel:tr.fRel, saddleN:tr.saddleN, lastSaddle:tr.saddle, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), log};
  fs.writeFileSync('fixtures/user_20cross_after.json', JSON.stringify(H.verts().map(p=>p.map(x=>+x.toFixed(5)))));
  return out; })()
