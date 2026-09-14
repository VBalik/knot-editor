// проверки исправлений 2.03 по ревью: Starts, пауза внутри серии, ползунок во время серии, заклинившая попытка
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // (a) поле Starts
  const el=document.getElementById('msN');
  el.value='25'; el.onchange(); out.starts25={value:el.value, MULTI_START};
  el.value=''; el.oninput(); out.startsEmptyInput={MULTI_START}; el.onchange(); out.startsEmptyChange={value:el.value, MULTI_START};
  el.value='3'; el.onchange(); out.starts3={value:el.value, MULTI_START};
  // (b) пауза внутри многостарта → продолжение серии
  H.clickPreset('trefoil'); H.play();
  let o=null, st=0; while(true){ o=H.step(50); st+=50; if(window.__knotTrace().msRound>=1 || !o.running || st>20000) break; }
  const trP=window.__knotTrace(); H.play();   // пауза
  out.pause={st, msRound:trP.msRound, msK:_msK, msEnergies:trP.msEnergies.slice(), status:H.dbg().status.slice(0,80), running:H.running()};
  H.play();                                   // возобновление
  out.resume={msK:_msK, msRound:_msRound, msEnergies:_msEnergies.slice(), liftKept:!!_msLift};
  while(true){ o=H.step(100); st+=100; if(!o.running || st>40000) break; }
  out.resumeFinal={status:H.dbg().status.slice(0,100), msEnergies:_msEnergies.slice(), wins:_msWins.length};
  // (c) ползунок во время серии после ≥1 попытки → серия заново
  H.clickPreset('figure8'); H.play(); st=0;
  while(true){ o=H.step(50); st+=50; if(window.__knotTrace().msRound>=1 || !o.running || st>20000) break; }
  out.sliderBefore={msRound:_msRound, msEnergies:_msEnergies.slice(), wins:_msWins.length};
  H.setSlider('bendCoef', 4);
  out.sliderAfter={msRound:_msRound, msEnergies:_msEnergies.slice(), wins:_msWins.length, running:H.running(), msK:_msK};
  while(true){ o=H.step(100); st+=100; if(!o.running || st>60000) break; }
  out.sliderFinal={status:H.dbg().status.slice(0,100), msEnergies:_msEnergies.slice(), wins:_msWins.length};
  // (d) заклинившие попытки: плотный узел при w=r=10, ms=2
  H.setSlider('bendCoef', 9); H.el('clear').onclick(); if(H.running()) H.play();
  H.setSlider('thick',10); H.setSlider('repCoef',10); el.value='2'; el.onchange();
  randomKnot(45); H.play(); st=0;
  while(true){ o=H.step(100); st+=100; if(!o.running || st>60000) break; }
  const tr=window.__knotTrace();
  out.jam={steps:st, settled:!o.running, status:H.dbg().status.slice(0,120), msEnergies:_msEnergies.slice(), wins:_msWins.map(w=>[w.k, isFinite(w.E)?+w.E.toPrecision(3):'inf']), inflate:+tr.inflate.toFixed(3), inflJammed:tr.inflJammed};
  return out; })()
