(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const [w,r,target] of [[5,5,90],[10,10,60],[5,5,40],[3,3,90]]){
    randomKnot(target); const nc=H.dbg().crossings.length; H.setSlider('bendCoef',9); H.setSlider('thick',w); H.setSlider('repCoef',r); if(!H.running()) H.play();
    let o=null, st=0; const t0=Date.now(); while(true){ o=H.step(200); st+=200; if(!o.running || st>=5000) break; } if(H.running()) H.play();
    const t=window.__knotTrace(); const s=sNominal();
    out.push({w,r,nc,N,steps:st,settled:!o.running,inflate:+t.inflate.toFixed(3),gap_s:+(minSegGap()/s).toFixed(3),sL0:+(s/L0).toFixed(2),wallS:+((Date.now()-t0)/1000).toFixed(1),status:H.dbg().status.slice(0,90)}); }
  return out; })()
