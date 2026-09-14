(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={};
  for(const key of ['cinquefoil']){
    if(H.running()) H.play();
    H.clickPreset(key); if(!H.running()) H.play();
    let o=null; for(let b=0;b<400;b++){ o=H.step(25); if(!o.running) break; }
    if(H.running()) H.play();
    const L=H.log(); const ser=L.series; const viol=[];
    let prev=null;
    for(let i=0;i<ser.length;i++){ const r=ser[i]; if(r.E==null){prev=null; continue;}
      if(prev && r.E>prev.E*1.001+1e-9) viol.push({st:r.st, from:prev.E, to:r.E, bE_from:prev.bendEnergy, bE_to:r.bendEnergy, gap:r.minSegL0, cap:r.cap});
      prev=r; }
    out[key]={steps:L.stepsTotal, viol:viol.slice(0,8), nViol:viol.length, collide:window.__knotTrace().collide, first:ser.slice(0,3).map(r=>({st:r.st,E:r.E,bE:r.bendEnergy}))};
  }
  return out;
})()
