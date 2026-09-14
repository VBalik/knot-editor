(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  randomKnot(80);
  const B=Number(process.env.BUDGET||20); const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(B); return fr; };
  H.play();
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const rec={budget:B, feas:{err:fr.err/L0, it:fr.it}, errAfterStart:errL(), gapStart:minSegGap()/L0, inflate0:_inflate};
  let acc=0, rej=0; window.__trialLog=[]; let first=null;
  for(let k=0;k<Number(process.env.STEPS||60) && running;k++){ window.__trialLog.length=0; relaxStep(); if(_dbgTier<0) rej++; else acc++; if(first===null) first=window.__trialLog.slice(0,4).map(t=>({tier:t.tier,t:t.t,move:t.moveL0,dE:t.dE,gmin:t.gmin,gmin0:t.gmin0})); }
  Object.assign(rec,{acc,rej,inflEnd:_inflate,stuck:_stuck,inflStall:_inflStall,firstTrials:first, errEnd:errL()});
  return rec; })()
