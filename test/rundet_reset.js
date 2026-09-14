(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const st=()=>document.getElementById('status').textContent;
  const out={tag:window.__buildTag};
  H.clickPreset('trefoil');
  H.play(); out.afterStart={runDet:H.dbg().runDet, running:H.running(), status:st()};
  H.step(50);
  H.play(); out.afterPause={runDet:H.dbg().runDet, running:H.running(), status:st()};
  // имитация смены типа до паузы: подменяем геометрию на окружность (тривиальный узел)
  const n=H.verts().length, circ=[];
  for(let i=0;i<n;i++){ const a=2*Math.PI*i/n; circ.push([3*Math.cos(a),3*Math.sin(a),0]); }
  window.__knotSetVerts(circ);
  out.detAfterReplace=H.det3d();
  // контроль: если бы сравнение шло с det лифта (=3) — смена типа должна быть замечена
  H.play(); out.afterResume={runDet:H.dbg().runDet, knotDet:H.dbg().knotDet, running:H.running(), status:st()};
  let o=null; for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  out.final={running:H.running(), status:st(), detEnd:window.__knotTrace().detEnd,
    warned: st().includes('knot type changed')};
  // тот же сценарий БЕЗ паузы: подмена на ходу — предупреждение появляется?
  H.clickPreset('trefoil'); H.play(); H.step(50);
  window.__knotSetVerts(circ);
  for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  out.noPauseControl={running:H.running(), status:st(), warned: st().includes('knot type changed')};
  return out;
})()
