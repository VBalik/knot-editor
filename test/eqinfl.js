(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=7; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  H.clickPreset(process.env.PRESET||'trefoil'); H.play();
  let o; for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  const rec={settledSteps:stepCounter, status:document.getElementById('status').textContent.slice(0,60), fRel:_dbgDE, gmin:+(_dbgGmin/L0).toFixed(3), DL0:+(thickD()/L0).toFixed(3)};
  // искусственно: тот же покой, но D_eff чуть меньше номинала → надувание должно завершиться ратчетом
  running=true; settleCount=0; _inflate=Number(process.env.INF||0.99); _inflStall=0; _energyDirty=true; lbReset(); _stuck=0;
  let acc=0, rej=0, ratchetAt=null; const tr=[];
  for(let k=0;k<Number(process.env.STEPS||600) && running;k++){ const ip=_inflate; relaxStep(); if(_dbgTier<0) rej++; else acc++; if(ratchetAt===null && _inflate!==ip) ratchetAt=k; if(k<12||k%100===0) tr.push({k, tier:_dbgTier, inf:+_inflate.toFixed(3), stall:_inflStall, stuck:_stuck, fRel:+_dbgDE.toExponential(2), eta:+_eta.toExponential(2), E:_ePrev}); }
  Object.assign(rec,{acc,rej,ratchetAt,inflEnd:_inflate,running,tr});
  return rec; })()
