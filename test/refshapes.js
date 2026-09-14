(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  for(const key of ['trefoil','cinquefoil','figure8']){ H.clickPreset(key); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1); if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=8000) break; } if(H.running()) H.play();
    out[key]={N, L0, det:_detRobust(3), EoverM:+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3), steps:st, verts:H.verts().map(p=>p.map(x=>+x.toFixed(4)))}; }
  return out; })()
