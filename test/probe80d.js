(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||2)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const target=Number(process.env.TARGET||80), MAXST=Number(process.env.MAXST||20000), MAXMS=Number(process.env.MAXMS||400000);
  randomKnot(target);
  const rec={seed:process.env.SEED, target, nc:crossings.length, N, DnomL0:+(thickDNominal()/L0).toFixed(3)};
  H.play(); rec.runDet=_runDet;
  const t1=Date.now(); let st=0; const win=[]; let W={acc:0, rej:0, t0:0, tsum:0, mv:0, dE:0, capHit:0, tier:[0,0,0], evals:0};
  window.__trialLog=[];
  while(running && st<MAXST && Date.now()-t1<MAXMS){
    const Eb=_ePrev; window.__trialLog.length=0; relaxStep(); st++;
    const L=window.__trialLog; W.evals+=L.length;
    if(_dbgTier<0) W.rej++; else { W.acc++; W.tier[_dbgTier]++; const last=L[L.length-1]; if(last){ if(last.t===0) W.t0++; W.tsum+=last.t; W.mv+=last.moveL0; } W.dE+=(Eb-_ePrev);
      // кап: сдвиг попытки ≈ capDisp? (_dbgAttempt vs 0.35*gmin)
      if(_dbgAttempt>=0.999*Math.max(Math.min(0.35*_dbgGmin,0.5*L0),1e-6*L0)) W.capHit++; }
    if(st%1000===0){ win.push({st, E:+_ePrev.toFixed(4), fRel:+_dbgDE.toExponential(2), g:+(_dbgGmin/L0).toFixed(3), acc:W.acc, rej:W.rej, tier:W.tier, t0frac:+(W.t0/Math.max(W.acc,1)).toFixed(2), tMean:+(W.tsum/Math.max(W.acc,1)).toFixed(2), mvMean:+(W.mv/Math.max(W.acc,1)).toFixed(4), dEsum:+W.dE.toExponential(2), capHit:W.capHit, evalsPerStep:+(W.evals/1000).toFixed(2), ms:Date.now()-t1}); W={acc:0, rej:0, t0:0, tsum:0, mv:0, dE:0, capHit:0, tier:[0,0,0], evals:0}; }
  }
  rec.steps=st; rec.runMs=Date.now()-t1; rec.settled=!running; rec.status=document.getElementById('status').textContent.slice(0,100); rec.bE=+H.bE().toFixed(3); rec.detEnd=_dbgDetEnd; rec.E=_ePrev; rec.fRel=_dbgDE; rec.settle=settleCount;
  if(running) H.play();
  rec.win=win; return rec; })()
