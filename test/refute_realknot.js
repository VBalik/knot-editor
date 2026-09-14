(()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const gaps=()=>{ let own=Infinity, foreign=Infinity;
    for(let i=0;i<N;i++){ for(let j=i+1;j<N;j++){ const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue;
      const d=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]).dist;
      const wArg=(cd*L0/(2*Math.max(d,1e-12))-1)/0.15;
      if(wArg>0){ if(d<foreign) foreign=d; } else { if(d<own) own=d; } } }
    return {ownExcl_L0:+(own/L0).toFixed(3), foreign_L0:+(foreign/L0).toFixed(3), minSegGap_L0:+(minSegGap()/L0).toFixed(3), sN_L0:+(sNominal()/L0).toFixed(3), sEff_L0:+(sExcl()/L0).toFixed(3)}; };
  const run=(label,maxB)=>{ if(!H.running()) H.play(); const start=gaps(); const infl0=window.__knotTrace().inflate; let o=null,st=0;
    for(let b=0;b<(maxB||200);b++){ o=H.step(25); st+=25; if(!o.running) break; }
    const t=window.__knotTrace(), d=H.dbg(); const end=gaps();
    out[label]={N, crossings:crossings.length, inflate0:+infl0.toFixed(3), inflateEnd:+t.inflate.toFixed(3), steps:st, settled:!(o&&o.running), start, end, foreignEnd_over_sN:+(end.foreign_L0/end.sN_L0).toFixed(2), status:d.status}; if(H.running()) H.play(); };
  H.setSlider('thick',5); H.setSlider('repCoef',5);
  // (2,q)-торический узел, q=27: r = R + a·cos(q t), φ = 2t → ≈27 пересечений → chooseN=600
  const q=27; document.getElementById('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; const r=170+70*Math.cos(q*t); return {x:400+r*Math.cos(2*t), y:300+r*Math.sin(2*t)}; }, 1200);
  out.drawn={N, crossings:crossings.length};
  run('torus2_27_w5r5',600);
  return out; })()
