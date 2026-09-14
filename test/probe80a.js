(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  // детерминированный ГСЧ
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const target=Number(process.env.TARGET||80);
  const t0=Date.now(); randomKnot(target); const genMs=Date.now()-t0;
  const d=H.dbg(); const rec={target, seed:process.env.SEED, nc:d.crossings.length, det2d:d.knotDet, N:d.N, genMs};
  rec.gapLift=+(minSegGap()/L0).toFixed(6); rec.DnomL0=+(thickDNominal()/L0).toFixed(3);
  // обёртки-счётчики
  const wrap=(name, extra)=>{ const orig=globalThis[name]; const st={calls:0, ms:0, ret:[]}; globalThis[name]=function(...a){ const t=Date.now(); const r=orig.apply(this,a); st.ms+=Date.now()-t; st.calls++; if(extra) st.ret.push(extra(r,a)); return r; }; return st; };
  const sF=wrap('startFeasibility', r=>r), sU=wrap('unstickLift', r=>r), sP=wrap('projectLengths'), sD=wrap('_detRobust', r=>r), sE=wrap('energyGrad'), sS=wrap('projectLengthsSafe', r=>r);
  const t1=Date.now(); H.play(); rec.startMs=Date.now()-t1;
  rec.feas=sF.ret[0]; rec.unstickCalls=sU.calls; rec.unstickPushes=sU.ret.reduce((a,b)=>a+b,0); rec.unstickMs=sU.ms; rec.projCalls=sP.calls; rec.detMs=sD.ms; rec.detRet=sD.ret; rec.eGradCalls=sE.calls; rec.eGradMs=sE.ms; rec.safeErr=sS.ret;
  rec.gapStart=+(_dbgGmin>0? 0 : minSegGap()/L0).toFixed(6); rec.gapStartL0=+(minSegGap()/L0).toFixed(6);
  rec.inflate0=+_inflate.toFixed(5); rec.runDet=_runDet;
  return rec; })()
