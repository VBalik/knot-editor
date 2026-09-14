(()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const run=(w,r,maxB)=>{ H.setSlider('thick',w); H.setSlider('repCoef',r); if(!H.running()) H.play(); const infl0=window.__knotTrace().inflate; let o=null,st=0; for(let b=0;b<(maxB||200);b++){ o=H.step(25); st+=25; if(!o.running) break; } const t=window.__knotTrace(); const d=H.dbg();
    return {N, s_L0:+(sNominal()/L0).toFixed(3), inflate0:+infl0.toFixed(3), inflateEnd:+t.inflate.toFixed(3), steps:st, settled:!(o&&o.running), minGap_L0:+(minSegGap()/L0).toFixed(3), minGap_s:+(minSegGap()/sNominal()).toFixed(3), status:d.status.slice(0,90)}; };
  H.clickPreset('trefoil');
  out.trefoil_w10r10=run(10,10,300);
  // restart from settled state by nudging r
  if(!H.running()){ out.trefoil_restart_r9=run(10,9,300); }
  // big unknot: circle radius 270 -> N?
  document.getElementById('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+270*Math.cos(t), y:300+270*Math.sin(t)}; }, 300);
  out.circle_w10r10=run(10,10,300);
  if(!H.running()) out.circle_restart_r9=run(10,9,300);
  // own-strand cd=3 gap vs foreign gap on trefoil at start
  H.clickPreset('trefoil');
  { let own=Infinity, foreign=Infinity; for(let i=0;i<N;i++){ for(let j=i+1;j<N;j++){ const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue; const d=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]).dist; const wArg=(cd*L0/(2*Math.max(d,1e-12))-1)/0.15; if(wArg>0){ if(d<foreign) foreign=d; } else { if(d<own) own=d; } } }
    out.trefoil_gaps={N, ownExcluded_min_L0:+(own/L0).toFixed(3), foreignIncluded_min_L0:+(foreign/L0).toFixed(3), minSegGap_L0:+(minSegGap()/L0).toFixed(3), s_w10r10_L0:+(20*unitLen()/L0).toFixed(3), thresh_1p3s:+(1.3*20*unitLen()/L0).toFixed(3)}; }
  return out; })()
