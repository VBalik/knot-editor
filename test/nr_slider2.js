(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const run=(w,r,tag)=>{ H.clickPreset('trefoil'); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1);
    if(!H.running()) H.play(); H.step(150);
    const pre={E:_ePrev, gap_L0:+(minSegGap()/L0).toFixed(3)};
    H.setSlider('thick',w); H.setSlider('repCoef',r);
    const eg=energyGrad(false); const res={tag, pre, sN_L0:+(sNominal()/L0).toFixed(3), gap_sN:+(minSegGap()/sNominal()).toFixed(3), E_after:String(eg.E)};
    let o=null, st=0; while(true){ o=H.step(50); st+=50; if(!o.running||st>=3000) break; }
    const tr=window.__knotTrace(); Object.assign(res,{settled:!o.running, steps:st, status:H.dbg().status.slice(0,60), E:String(_ePrev), fRel:+tr.fRel.toExponential(2), gapEnd_sN:+(minSegGap()/sNominal()).toFixed(3), quietBy:tr.quietBy});
    if(H.running()) H.play(); return res; };
  out.a=run(3,2,'w3r2 mid-run');
  out.b=run(2,2,'w2r2 mid-run');
  // контроль: пауза → ползунок → physSettingsChanged запускает startPhysics с надуванием
  H.clickPreset('trefoil'); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1); if(!H.running()) H.play(); H.step(150); H.play();
  H.setSlider('thick',10); H.setSlider('repCoef',10);
  out.paused={running:H.running(), inflate:+_inflate.toFixed(3), E:String(_ePrev), status:H.dbg().status.slice(0,50)};
  let o=null, st=0; while(H.running()){ o=H.step(50); st+=50; if(!o.running||st>=3000) break; }
  out.pausedEnd={steps:st, status:H.dbg().status.slice(0,60), inflate:+_inflate.toFixed(3), gap_sN:+(minSegGap()/sNominal()).toFixed(3)};
  if(H.running()) H.play(); return out; })()
