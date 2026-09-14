(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const scen=(w0,r0,w1,r1,steps)=>{
    H.clickPreset('trefoil'); H.setSlider('thick',w0); H.setSlider('repCoef',r0);
    if(!H.running()) H.play(); H.step(100);
    const pre={E:_ePrev, gap_L0:+(minSegGap()/L0).toFixed(3), sN_L0:+(sNominal()/L0).toFixed(3), inflate:_inflate};
    H.setSlider('thick',w1); H.setSlider('repCoef',r1);
    const eg=energyGrad(false);
    const after={E_now:String(eg.E), sN_L0:+(sNominal()/L0).toFixed(3), gap_sN:+(minSegGap()/sNominal()).toFixed(3), inflate:_inflate, running:H.running()};
    let o=null, firstFinite=null; const rows=[];
    for(let k=0;k<steps/25;k++){ o=H.step(25); const tr=window.__knotTrace();
      if(firstFinite===null && isFinite(_ePrev)) firstFinite=stepCounter;
      if(k%8===0||!o.running) rows.push({st:stepCounter, E:String(_ePrev), fRel:+tr.fRel.toExponential(2), stuck:_stuck, settle:settleCount, mv:+tr.moved.toExponential(1), gap_sN:+(minSegGap()/sNominal()).toFixed(3), inflate:+_inflate.toFixed(3), running:o.running, status:o.status.slice(0,60)});
      if(!o.running) break; }
    const res={pre, after, firstFinite, rows, final:{status:H.dbg().status, E:String(_ePrev), running:H.running(), steps:stepCounter}};
    if(H.running()) H.play(); return res; };
  out.w1r1_to_w10r10_1000=scen(1,1,10,10,1000);
  out.w1r1_to_w5r5_1000=scen(1,1,5,5,1000);
  out.w1r1_to_w3r3_1000=scen(1,1,3,3,1000);
  return out; })()
