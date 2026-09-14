(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=7; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  H.clickPreset('trefoil'); H.play();
  let o; for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  _thickScale*=Number(process.env.MUL||3); H.play();
  const tr=[]; window.__trialLog=[];
  for(let k=0;k<400 && running;k++){ window.__trialLog.length=0; const ip=_inflate, st=_stuck, et=_eta; relaxStep();
    const rejd=_dbgTier<0; if(rejd || _inflate!==ip || k<3) tr.push({k, acc:!rejd, inf:+ip.toFixed(3), infAfter:+_inflate.toFixed(3), stall:_inflStall, stuck:st, eta:+et.toExponential(1), fRel:+_dbgDE.toExponential(2), gmin:+(_dbgGmin/L0).toFixed(3), D:+(thickD()/L0).toFixed(3), first:window.__trialLog.slice(0,2).map(t=>[t.tier,t.moveL0,t.dE,t.gmin]), last:window.__trialLog.slice(-1).map(t=>[t.tier,t.t,t.moveL0,t.dE,t.gmin])}); }
  return tr.slice(0,70); })()
