(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const run=(prep,w,r,maxB)=>{ prep(); H.setSlider('thick',w); H.setSlider('repCoef',r); if(!H.running()) H.play(); let o=null,st=0; for(let b=0;b<(maxB||400);b++){ o=H.step(25); st+=25; if(!o.running) break; } if(H.running()) H.play();
    const d=H.dbg(); const t=window.__knotTrace(); const s=sNominal(), D=thickCoef*unitLen();
    return {settled:!(o&&o.running), steps:st, bE:+H.bE().toFixed(3), det3d:H.det3d(), minGap_s:+(minSegGap()/s).toFixed(3), s_L0:+(s/L0).toFixed(3), D_L0:+(D/L0).toFixed(3), rvar:o.rvar, inflate:+t.inflate.toFixed(3), status:d.status.slice(0,60)}; };
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2);
  // градиент: конечные разности на нескольких вершинах, после короткого спуска (чтобы были контакты)
  if(!H.running()) H.play(); H.step(60); if(H.running()) H.play();
  out.gradCheck=window.__knotGradCheck([3,40,77,120,160,200]);
  out.trefoil_w={}; for(const w of [1,2,3,5,7,10]) out.trefoil_w['w'+w]=run(()=>H.clickPreset('trefoil'), w, 2);
  out.trefoil_r={}; for(const r of [1,2,4,7,10]) out.trefoil_r['r'+r]=run(()=>H.clickPreset('trefoil'), 3, r);
  const unk=()=>{ document.getElementById('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; }, 240); };
  out.unknot={}; for(const [w,r] of [[1,1],[5,2],[10,10],[3,8]]) out.unknot['w'+w+'r'+r]=run(unk, w, r);
  out.figure8=run(()=>H.clickPreset('figure8'),5,2); out.cinq=run(()=>H.clickPreset('cinquefoil'),5,2); out.sept=run(()=>H.clickPreset('septafoil'),5,2);
  return out; })()
