(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80), MAX=+(process.env.MAX||3000);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  const gaps=()=>{ let all=1e9, foreign=1e9, cdAt=-1, cdAtF=-1, cd3=1e9; for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+1;j<N;j++){ const jp=(j+1)%N; const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue; const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<all){all=x; cdAt=cd;} if(cd===3&&x<cd3) cd3=x; if(cd*L0>2*x && x<foreign){foreign=x; cdAtF=cd;} } } return {all_L0:+(all/L0).toFixed(3), cdAt, cd3_L0:+(cd3/L0).toFixed(3), foreign_L0:+(foreign/L0).toFixed(3), cdAtF}; };
  out.sN_L0=+(sNominal()/L0).toFixed(3); out.needForRatchetTo1_sN_L0_max=+(2*0.95).toFixed(3);
  if(!H.running()) H.play(); out.inflate0=+_inflate.toFixed(4);
  const rows=[]; let o=null, st=0;
  while(true){ o=H.step(100); st+=100;
    if(st%500===0||!o.running){ const g=gaps(); const sv=_inflate; _inflate=1; const eg=energyGrad(false); _inflate=sv;
      rows.push({st, infl:+_inflate.toFixed(4), stall:_inflStall, jam:_inflJammed, gaps:g, gminEG_L0:+(_dbgGmin/L0).toFixed(3), sEff_L0:+(sExcl()/L0).toFixed(3), E_full:+eg.E.toFixed(4), E_full_finite:isFinite(eg.E), status:o.status.slice(0,70)}); }
    if(!o.running||st>=MAX) break; }
  out.rows=rows; out.finalStatus=H.dbg().status; out.running=H.running();
  if(H.running()) H.play(); return out; })()
