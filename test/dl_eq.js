(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=7; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  H.clickPreset(process.env.PRESET||'trefoil'); H.play();
  let o; for(let b=0;b<200;b++){ o=H.step(100); if(!o.running) break; }
  const rec={N, settledSteps:stepCounter, fRel:_dbgDE, gmin:+(_dbgGmin/L0).toFixed(3), DL0:+(thickD()/L0).toFixed(3)};
  // естественный путь: толщина увеличена через конфиг-хук, затем повторный старт физики (startPhysics сам выбирает _inflate)
  _thickScale*=Number(process.env.MUL||3); H.play();
  rec.inflate0=_inflate; rec.Deff=+(thickD()/L0).toFixed(3);
  let acc=0, rej=0, ratchets=0, maxRejRun=0, run=0;
  for(let k=0;k<Number(process.env.STEPS||3000) && running;k++){ const ip=_inflate; relaxStep(); if(_dbgTier<0){rej++; run++; if(run>maxRejRun) maxRejRun=run;} else {acc++; run=0;} if(_inflate!==ip) ratchets++; }
  Object.assign(rec,{acc,rej,maxRejRun,ratchets,inflEnd:_inflate,running,steps:stepCounter,status:document.getElementById('status').textContent.slice(0,60)});
  return rec; })()
