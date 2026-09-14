(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=7; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  H.clickPreset(process.env.PRESET||'trefoil'); H.play();
  let o; for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  const rec={N, settledSteps:stepCounter, fRel:_dbgDE, gmin:+(_dbgGmin/L0).toFixed(3), DL0:+(thickD()/L0).toFixed(3), ftolI:0.02*4*Math.PI/N};
  // та же геометрия и та же D_eff, но номинал вдвое больше: _inflate=0.5 → want=1.3·gmin/Dn
  _thickScale*=2; running=true; settleCount=0; _inflate=0.5; _inflStall=0; _energyDirty=true; lbReset(); _stuck=0; _eta=0;
  rec.want=1.3*_dbgGmin/thickDNominal();
  let acc=0, rej=0, ratchetAt=null; const tr=[];
  for(let k=0;k<Number(process.env.STEPS||1000) && running;k++){ const ip=_inflate; relaxStep(); if(_dbgTier<0) rej++; else acc++; if(ratchetAt===null && _inflate!==ip) ratchetAt=k; if(k%200===0) tr.push({k, tier:_dbgTier, inf:+_inflate.toFixed(3), stall:_inflStall, stuck:_stuck, fRel:+_dbgDE.toExponential(2), eta:+_eta.toExponential(2), E:_ePrev, status:document.getElementById('status').textContent.slice(0,40)}); }
  Object.assign(rec,{acc,rej,ratchetAt,inflEnd:_inflate,running,tr});
  return rec; })()
