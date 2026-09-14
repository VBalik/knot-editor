(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // равновесие трефойла при w=r=1, пауза, затем ПРОТЯЖКА ползунка Толщ. 1→10 (9 событий oninput, как в браузере)
  H.clickPreset('trefoil'); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1);
  if(!H.running()) H.play(); let o=null; for(let k=0;k<40;k++){ o=H.step(25); if(!o.running) break; }
  out.settled={status:H.dbg().status.slice(0,40), running:H.running(), gap_L0:+(minSegGap()/L0).toFixed(3)};
  const ev=[]; for(let w=2; w<=10; w++){ H.setSlider('thick', w); ev.push({w, running:H.running(), inflate:+_inflate.toFixed(3), sEff_gap:+(sExcl()/minSegGap()).toFixed(3), E:String(energyGrad(false).E)}); }
  out.dragEvents=ev;
  let st=0; while(true){ o=H.step(100); st+=100; if(!o.running||st>=3000) break; }
  out.after={steps:st, running:H.running(), status:H.dbg().status.slice(0,50), E:String(_ePrev), inflate:+_inflate.toFixed(3), fRel:+window.__knotTrace().fRel.toExponential(2)};
  // выход: пауза + play заново → startPhysics пересчитывает надувание
  if(H.running()) H.play(); H.play(); out.replay={inflate:+_inflate.toFixed(3), E0:String(energyGrad(false).E)};
  st=0; while(true){ o=H.step(100); st+=100; if(!o.running||st>=4000) break; }
  out.replayEnd={steps:st, status:H.dbg().status.slice(0,50), inflate:+_inflate.toFixed(3)};
  if(H.running()) H.play(); return out; })()
