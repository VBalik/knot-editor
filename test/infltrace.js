(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let seed=777; // детерминированный случайный узел ~85 пересечений
  Math.random=(()=>{ let s=seed; return ()=>{ s=(Math.imul(s,1103515245)+12345)&0x7fffffff; return s/0x7fffffff; }; })();
  randomKnot(+(process.env.NC||85)); const nc=H.dbg().crossings.length; H.setSlider('bendCoef',9); H.setSlider('thick',+(process.env.W||5)); H.setSlider('repCoef',+(process.env.R||5));
  if(!H.running()) H.play(); const rows=[]; let st=0, o=null; window.__trialLog=[];
  while(true){ window.__trialLog=[]; o=H.step(200); st+=200; const t=window.__knotTrace(); const tl=window.__trialLog; const by={}; for(const e of tl){ const k=e.st+':'+e.tier; (by[k]=by[k]||[]).push(e); } let acc=0,rej=0; for(const k in by){ const es=by[k]; if(es[es.length-1].dE<0) acc++; else rej++; }
    rows.push({st, infl:+t.inflate.toFixed(4), stall:t.inflStall, jam:t.inflJammed, gminRep_L0:+t.gminRep.toFixed(3), sEff_L0:+t.sEff.toFixed(3), ratio:+(t.gminRep/t.sEff).toFixed(3), fRel:+t.fRel.toExponential(1), acc, rej, tier:t.tier, status:H.dbg().status.slice(0,30)});
    if(!o.running || st>=3000) break; }
  if(H.running()) H.play(); return {nc, N, sL0:+(sNominal()/L0).toFixed(3), rows}; })()
