// Stir после смены ползунков (ядро шире зазоров): должен сдуть ядро и раскрыть заново
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.clickPreset("cinquefoil"); H.set({ms:2}); H.play(); runToEnd(60000); out.s1={E:isFinite(energyGrad(false).E), gap_sN:+(minSegGapRep()/sNominal()).toFixed(2), status:H.dbg().status.slice(0,60)};
  H.setSlider('thick',10); H.setSlider('repCoef',10);   // ядро в 2.9 раза шире
  out.s2={E:isFinite(energyGrad(false).E), gap_sN:+(minSegGapRep()/sNominal()).toFixed(2), running:H.running(), playStir:_playStir};
  H.play(); out.click={stir:!!_stir, inflate:+_inflate.toFixed(3), status:H.dbg().status.slice(0,70)};
  let c=0; while(_stir && c<800){ stirStep(); c++; }
  const st=window.__knotTrace().stir; out.stir={inflMax:st&&st.inflMax, moved:st&&st.moved_L0, det:st&&[st.det0,st.det1], running:H.running()};
  if(H.running()) runToEnd(60000); out.s3={status:H.dbg().status.slice(0,80), E:isFinite(energyGrad(false).E), gap_sN:+(minSegGapRep()/sNominal()).toFixed(2)};
  return out; })()
