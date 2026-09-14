// «Плотно» на пресете 3₁ с самого старта: идеал tD≈7, инвариант 3 на всём пути
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  H.clickPreset('trefoil'); if(H.running()) H.play();
  { const tc=document.getElementById('tightChk'); tc.checked=true; tc.onchange&&tc.onchange(); }
  if(!H.running()) H.play();
  if(!H.running()) return {err:'PLAY FAILED'};
  let o=null, badSamples=[];
  for(let b=0;b<200;b++){
    o=H.step(30);
    const dd=H.det3d();
    if(dd!==3) badSamples.push({st:H.log().stepsTotal, det:dd});
    if(!o.running) break;
  }
  if(H.running()) H.play();
  const L=H.log(), last=L.series[L.series.length-1]||{};
  { const tc=document.getElementById('tightChk'); tc.checked=false; tc.onchange&&tc.onchange(); }
  return { tag:window.__buildTag, settled:!(o&&o.running), steps:L.stepsTotal,
    tD:last.tD, det:H.det3d(), bE:+H.bE().toFixed(2),
    badSamples: badSamples.length? badSamples.slice(0,5) : 'нет' };
})()
