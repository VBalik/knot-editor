// причины отказов стадии A на случайных узлах
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(let k=0;k<5;k++){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
    randomKnot(12); if(isUnknot){ k--; continue; } H.set({ms:1}); H.play(); runToEnd(60000);
    const rec={det:knotDet, gap0_s:+(minSegGapRep()/sNominal()).toFixed(2), E1:H.dbg().status.slice(5,20)};
    H.play(); let c=0; const rejs={}; while(_stir && _stir.stage==='A' && c<400){ stirStep(); c++; if(_stir && _stir.lastRej){ const r=_stir.lastRej; const key=r.Einf?'Einf':r.gapDown?'gapDown':r.gminLow?'gminLow':r.mvT?'mvT':'?'; rejs[key]=(rejs[key]||0)+1; _stir.lastRej=null; } }
    rec.stageA={steps:c, inflate:+_inflate.toFixed(2), target:_stir&&+_stir.inflTarget.toFixed(2), rejA:_stir&&_stir.rejA, rejs, stage:_stir&&_stir.stage, gap_s:+(minSegGapRep()/sNominal()).toFixed(2)};
    while(_stir){ stirStep(); } const st=window.__knotTrace().stir; rec.done={inflMax:st&&st.inflMax, det:st&&[st.det0,st.det1], tooTight:st&&st.tooTight};
    if(H.running()) H.play();
    out.push(rec); }
  return out; })()
