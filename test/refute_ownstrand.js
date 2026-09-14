(()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // разделяем пары: «свои» (арк-фильтр wArg<=0, энергия игнорирует) и «чужие» (wArg>0)
  const gaps=()=>{ let own=Infinity, foreign=Infinity, ownCd=-1;
    for(let i=0;i<N;i++){ for(let j=i+1;j<N;j++){ const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue;
      const d=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]).dist;
      const wArg=(cd*L0/(2*Math.max(d,1e-12))-1)/0.15;
      if(wArg>0){ if(d<foreign) foreign=d; } else { if(d<own){ own=d; ownCd=cd; } } } }
    return {ownExcl_L0:+(own/L0).toFixed(3), ownCd, foreign_L0:+(foreign/L0).toFixed(3), minSegGap_L0:+(minSegGap()/L0).toFixed(3), egGmin_L0:+(energyGrad(false).gmin/L0).toFixed(3), sN_L0:+(sNominal()/L0).toFixed(3), sEff_L0:+(sExcl()/L0).toFixed(3), thresh13sN_L0:+(1.3*sNominal()/L0).toFixed(3)}; };
  const run=(label,maxB)=>{ if(!H.running()) H.play(); const start=gaps(); const infl0=window.__knotTrace().inflate; let o=null,st=0;
    for(let b=0;b<(maxB||200);b++){ o=H.step(25); st+=25; if(!o.running) break; }
    const t=window.__knotTrace(), d=H.dbg(); const end=gaps();
    out[label]={N, crossings:crossings.length, inflate0:+infl0.toFixed(3), inflateEnd:+t.inflate.toFixed(3), steps:st, settled:!(o&&o.running), start, end, foreignEnd_over_sN:+(end.foreign_L0/end.sN_L0).toFixed(2), status:d.status}; if(H.running()) H.play(); };
  // 1) окружность N=600, ползунки выставлены ДО первого запуска (physEverRun=false → рестарта нет)
  H.setSlider('thick',5); H.setSlider('repCoef',5);
  H.clickPreset('trefoil');
  const circle=(n,R)=>{ const a=[]; for(let i=0;i<n;i++){ const th=i/n*2*Math.PI; a.push([R*Math.cos(th),R*Math.sin(th),0]); } return a; };
  window.__knotSetVerts(circle(600, 600*0.125/(2*Math.PI)));
  run('circle600_w5r5',400);
  return out; })()
