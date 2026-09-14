(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80), MAX=+(process.env.MAX||1500);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET);
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  if(!H.running()) H.play();
  const rec={inflate0:_inflate}; let o=null, steps=0;
  while(true){ o=H.step(100); steps+=100; const tr=window.__knotTrace();
    if(rec.inflSteps===undefined && tr.inflate>=1) rec.inflSteps=steps;
    if(!o.running||steps>=MAX) break; }
  const s=H.log().series||[]; const inflEnd=(rec.inflSteps||0)+100;
  let eViol=0, pe=null, pt=null, rises=[], risesNoTD=0;
  for(const r of s){ if(r.st<=inflEnd){pe=null;pt=r.tD;continue;} if(r.E==null){pe=null;continue;}
    if(pe!=null && r.E>pe*1.001+1e-9){ eViol++; rises.push({st:r.st, dE:+((r.E-pe)/pe).toExponential(2), tD:r.tD, tDprev:pt}); if(r.tD===pt) risesNoTD++; }
    pe=r.E; pt=r.tD; }
  rec.inflEnd=inflEnd; rec.inflateEnd=_inflate; rec.jam=_inflJammed; rec.seriesLen=s.length; rec.eViol=eViol; rec.risesWithoutTDchange=risesNoTD; rec.rises=rises;
  if(H.running()) H.play(); return rec; })()
