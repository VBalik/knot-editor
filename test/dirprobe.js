(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), path=global.__require('path');
  const dir=path.join(process.cwd(),'..','telemetry');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort();
  const raw=fs.readFileSync(path.join(dir, files[files.length-1]),'utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  window.__knotSet({sob:+(process.env.SOB||80)});
  H.setSlider('bendCoef', 10); H.setSlider('repCoef', 3);
  if(!H.running()) H.play();
  H.step(+(process.env.PRE||1200));
  const bad=[], good=[]; let nProbe=0, nBad=0, nNoMem=0;
  for(let k=0;k<400;k++){
    H.step(1);
    const r=window.__knotDirProbe(0,[0.0005,0.002,0.008,0.03]);
    if(r.err){ nNoMem++; continue; }
    nProbe++;
    const worst=r.rows[0].dEproj>0;
    if(worst){ nBad++; if(bad.length<4) bad.push(r); } else if(good.length<2) good.push(r);
  }
  return {nProbe, nBad, nNoMem, bad, good};
})()
