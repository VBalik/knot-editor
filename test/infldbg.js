(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.set({ms:1}); H.play(); let o; let st=0; while(st<60000){ o=H.step(200); st+=200; if(!o.running) break; }
  window.__stirMode('inflate'); window.__stirInfl(10); const rr=window.__knotStir();
  const tr=[]; tr.push({st:stepCounter, infl:_inflate, capK:_inflCapK, t0:_inflCapT0, start:_inflStart, run:running});
  for(const k of [1,5,20,50,100,200]){ H.step(k); tr.push({st:stepCounter, infl:+_inflate.toFixed(4), capK:_inflCapK, stall:_inflStall, run:running, round:_msRound}); }
  return tr; })()
