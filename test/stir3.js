// повторный Stir: после серии за Stir — ещё раз Stir (ошибка «strands are inside the hard core»?)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function state(tag){ const g=energyGrad(false); return {tag, Efinite:isFinite(g.E), inflate:+_inflate.toFixed(3), gapRep_s:+(minSegGapRep()/sExcl()).toFixed(3), gapRep_sN:+(minSegGapRep()/sNominal()).toFixed(3), N, L0:+L0.toFixed(4), playStir:_playStir, status:H.dbg().status.slice(0,70)}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',10); H.setSlider('repCoef',10); H.setSlider('bendCoef',2);
  randomKnot(12); H.set({ms:2}); H.play(); runToEnd(60000); out.s1=state('after tries');
  for(let k=1;k<=3;k++){
    H.play();   // режим Stir
    out['click'+k]={stir:!!_stir, status:H.dbg().status.slice(0,70)};
    if(_stir){ let c=0; while(_stir && c<800){ stirStep(); c++; } }
    const st=window.__knotTrace().stir; out['stir'+k]={inflMax:st&&st.inflMax, moved:st&&st.moved_L0, det:st&&[st.det0,st.det1], tooTight:st&&st.tooTight, running:H.running()};
    if(H.running()) runToEnd(60000);
    out['s'+(k+1)]=state('after stir '+k);
  }
  return out; })()
