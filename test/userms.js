(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
  const raw=fs.readFileSync(process.env.TELEM,'utf8'); global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  const out=[]; const REP=+(process.env.REP||3);
  for(let rep=0; rep<REP; rep++){ document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300));
    H.setSlider('bendCoef',+(process.env.B||1)); H.setSlider('thick',+(process.env.W||10)); H.setSlider('repCoef',+(process.env.R||10)); const t0=Date.now();
    if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=40000) break; } if(H.running()) H.play();
    const M=16*Math.PI*Math.PI/N; const t=window.__knotTrace();
    out.push({steps:st, wallS:+((Date.now()-t0)/1000).toFixed(1), EoverM:+(H.bE()/M).toFixed(3), rvar:o.rvar, det:_detRobust(3), rounds:t.msEnergies, status:H.dbg().status.slice(0,120)}); }
  return out; })()
