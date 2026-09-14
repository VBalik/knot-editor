(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  randomKnot(10); H.set({ms:1}); H.play(); runToEnd(60000);
  H.setSlider('thick',10); H.setSlider('repCoef',10);
  H.play(); const log=[]; for(let c=0;c<12 && _stir;c++){ stirStep(); log.push({i:_stir&&_stir.i, inflate:+_inflate.toFixed(3), gapRep_sEff:+(minSegGapRep()/sExcl()).toFixed(3), rejA:_stir&&_stir.rejA, rej:_stir&&_stir.lastRej}); }
  out.log=log; return out; })()
