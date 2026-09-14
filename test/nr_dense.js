(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80), MAX=+(process.env.MAX||6000);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET);
  const d0=H.dbg(); const out={N:d0.N, nc:d0.crossings?d0.crossings.length:null, det2d:d0.knotDet, isUnknot:d0.isUnknot, status0:d0.status.slice(0,80)};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  const sN=sNominal(); out.sN_L0=+(sN/L0).toFixed(4); out.D_L0=+(thickDNominal()/L0).toFixed(4); out.u_L0=+(unitLen()/L0).toFixed(5);
  const t0=Date.now(); if(!H.running()) H.play(); out.playMs=Date.now()-t0;
  const tr0=window.__knotTrace(); out.inflate0=tr0.inflate; out.unstick=tr0.unstick; out.gap0_sN=+(minSegGap()/sN).toFixed(4); out.gap0_L0=+(minSegGap()/L0).toFixed(4);
  out.E0=energyGrad(false).E; out.gmin0_L0=+(energyGrad(false).gmin/L0).toFixed(4);
  const rows=[]; let o=null, steps=0, badNum=[];
  const isBad=(v)=>typeof v==='number' && !isFinite(v);
  while(true){ o=H.step(100); steps+=100;
    const tr=window.__knotTrace();
    const row={st:steps, infl:+_inflate.toFixed(4), stall:_inflStall, jam:_inflJammed, E:_ePrev, fRel:+tr.fRel.toExponential(2), gminS:+(_dbgGmin/sExcl()).toFixed(3), gapS:+(minSegGap()/sExcl()).toFixed(3), tier:tr.tier, stuck:_stuck, settle:settleCount, mv:+tr.moved.toExponential(1), st_:o.status.slice(0,50)};
    for(const k in row) if(isBad(row[k])) badNum.push({st:steps,k,v:String(row[k])});
    if(rows.length<12 || steps%500===0 || !o.running) rows.push(row);
    if(!o.running || steps>=MAX) break; }
  out.rows=rows; out.settled=!o.running; out.steps=steps; out.wallS=+((Date.now()-t0)/1000).toFixed(1); out.badNum=badNum.slice(0,10);
  const L=H.log(); const s=L.series||[]; let eViol=0, eInf=0, eNull=0, pe=null, nanCnt=0;
  for(const r of s){ for(const k in r) if(typeof r[k]==='number' && !isFinite(r[k])) nanCnt++;
    if(r.E==null){eNull++; pe=null; continue;} if(!isFinite(r.E)) eInf++;
    if(pe!=null && r.E>pe*1.001+1e-9) eViol++; pe=r.E; }
  out.series={n:s.length, eViol, eInf, eNull, nanCnt, lastE:s.length?s[s.length-1].E:null};
  out.final={status:H.dbg().status, inflate:_inflate, jam:_inflJammed, gap_sN:+(minSegGap()/sN).toFixed(4), gap_sEff:+(minSegGap()/sExcl()).toFixed(4), E:_ePrev, det3d:H.det3d(), runDet:_runDet};
  if(H.running()) H.play();
  return out; })()
