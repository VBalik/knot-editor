(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const OUT=process.env.OUT; 
  for(const key of ['trefoil','figure8','cinquefoil','septafoil']){
    H.clickPreset(key); const d=H.dbg(); const lift=H.verts().map(p=>p.map(x=>+x.toFixed(4)));
    if(!H.running()) H.play(); const feas=H.verts().map(p=>p.map(x=>+x.toFixed(4))); let o=null; for(let b=0;b<200;b++){ o=H.step(50); if(!o.running) break; } if(H.running()) H.play();
    fs.appendFileSync(OUT, JSON.stringify({i:key, nc:d.crossings.length, N:d.N, det2d:d.knotDet, runDet:H.dbg().runDet, L0:d.L0, lift, feas, final:H.verts().map(p=>p.map(x=>+x.toFixed(4))), det3dEditor:H.det3d()})+'\n'); }
  // тривиальный узел с самопересечениями (лиссажу)
  document.getElementById('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+230*Math.sin(2*t), y:300+170*Math.sin(3*t+0.3)}; }, 300);
  { const d=H.dbg(); const lift=H.verts().map(p=>p.map(x=>+x.toFixed(4))); if(!H.running()) H.play(); const feas=H.verts().map(p=>p.map(x=>+x.toFixed(4))); let o=null; for(let b=0;b<200;b++){ o=H.step(50); if(!o.running) break; } if(H.running()) H.play();
    fs.appendFileSync(OUT, JSON.stringify({i:'lissajous', nc:d.crossings.length, N:d.N, det2d:d.knotDet, runDet:H.dbg().runDet, L0:d.L0, lift, feas, final:H.verts().map(p=>p.map(x=>+x.toFixed(4))), det3dEditor:H.det3d()})+'\n'); }
  return 'ok'; })()
