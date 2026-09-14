(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={tag:window.__buildTag};
  H.clickPreset('trefoil');
  out.trefoilLift=window.__knotGradCheck();
  H.play(); H.step(60); if(H.running()) H.play();
  out.trefoilAfter60=window.__knotGradCheck();
  H.clickPreset('figure8');
  out.fig8Lift=window.__knotGradCheck();
  return out;
})()
