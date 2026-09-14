(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80), MAX=+(process.env.MAX||3000);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  // зазоры: все cd>2 / только cd>=4 / только «чужие» по арк-фильтру
  const gaps=()=>{ let all=1e9, cd4=1e9, foreign=1e9, cdAt=-1, cdAtF=-1; for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+1;j<N;j++){ const jp=(j+1)%N; const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue; const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<all){all=x; cdAt=cd;} if(cd>=4&&x<cd4) cd4=x; if(cd*L0>2*x && x<foreign){foreign=x; cdAtF=cd;} } } return {all:+(all/L0).toFixed(3), cdAt, cd4:+(cd4/L0).toFixed(3), foreign:+(foreign/L0).toFixed(3), cdAtF}; };
  out.det2d=knotDet; out.detLift=_detRobust(3);
  if(!H.running()) H.play();
  out.detAfterStart=_detRobust(3); out.sN_L0=+(sNominal()/L0).toFixed(3); out.gaps0=gaps(); out.inflate0=_inflate;
  const rows=[]; let o=null, st=0, lastE=null, ratchets=[], rises=[];
  let prevInfl=_inflate, prevDet=out.detAfterStart;
  while(true){ o=H.step(50); st+=50; const dn=_detRobust(3); const g=gaps();
    if(dn!==prevDet){ rows.push({st, event:'DET CHANGE', from:prevDet, to:dn, infl:+_inflate.toFixed(3), gaps:g}); prevDet=dn; }
    if(st%500===0||!o.running) rows.push({st, infl:+_inflate.toFixed(4), stall:_inflStall, jam:_inflJammed, gaps:g, sEff_L0:+(sExcl()/L0).toFixed(3), E:+_ePrev.toFixed(4), fRel:+window.__knotTrace().fRel.toExponential(2)});
    if(!o.running||st>=MAX) break; }
  out.rows=rows; out.status=H.dbg().status;
  // серия: подъёмы E и совпадение с ратчетом (в серии нет поля inflate → используем tD)
  const s=H.log().series||[]; let pe=null, pt=null; for(const r of s){ if(r.E==null){pe=null; continue;} if(pe!=null && r.E>pe*1.001+1e-9) rises.push({st:r.st, dE:+((r.E-pe)/pe).toExponential(2), tD:r.tD, tDprev:pt}); pe=r.E; pt=r.tD; }
  out.rises=rises;
  // энергия при полном ядре на застрявшем состоянии
  const inflSave=_inflate; _inflate=1; const eg=energyGrad(false); _inflate=inflSave;
  out.E_at_full={E:eg.E, gmin_L0:+(eg.gmin/L0).toFixed(3), finite:isFinite(eg.E)};
  out.gapsEnd=gaps();
  if(H.running()) H.play(); return out; })()
