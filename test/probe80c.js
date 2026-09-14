(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const target=Number(process.env.TARGET||80), MAXST=Number(process.env.MAXST||6000), MAXMS=Number(process.env.MAXMS||420000);
  randomKnot(target);
  const rec={seed:process.env.SEED, target, nc:crossings.length, N, DnomL0:+(thickDNominal()/L0).toFixed(3)};
  const t0=Date.now(); H.play(); rec.startMs=Date.now()-t0; rec.inflate0=+_inflate.toFixed(5); rec.runDet=_runDet;
  const Dn=thickDNominal();
  const ratchets=[]; let rej=0, rejInfl=0, acc=[0,0,0], accInfl=[0,0,0], consRej=0, maxConsRej=0, maxConsRejInfl=0, stepsInfl=null, stallMax=0, stepMsMax=0;
  const trace=[]; const t1=Date.now(); let st=0;
  while(running && st<MAXST && Date.now()-t1<MAXMS){
    const infPrev=_inflate, stallPrev=_inflStall, lbPrev=_lbS.length;
    const ts=Date.now(); relaxStep(); const ms=Date.now()-ts; if(ms>stepMsMax) stepMsMax=ms; st++;
    const tier=_dbgTier;
    if(tier<0){ rej++; consRej++; if(consRej>maxConsRej) maxConsRej=consRej; if(infPrev<1){ rejInfl++; if(consRej>maxConsRejInfl) maxConsRejInfl=consRej; } }
    else { consRej=0; acc[tier]++; if(infPrev<1) accInfl[tier]++; }
    if(_inflStall>stallMax) stallMax=_inflStall;
    if(_inflate!==infPrev){ const want=1.3*_gminAcc/Dn; const reason= want>=infPrev*1.1 ? 'want' : (stallPrev>=49 ? 'stall50' : 'fbal');
      ratchets.push({st, from:+infPrev.toFixed(4), to:+_inflate.toFixed(4), reason, stall:stallPrev, lbBefore:lbPrev, gmin:+(_gminAcc/L0).toFixed(4), fRel:+_dbgDE.toExponential(2)}); }
    if(stepsInfl===null && _inflate>=1) stepsInfl=st;
    if(st%50===0 || st<40) trace.push({st, tier, inf:+_inflate.toFixed(4), stall:_inflStall, lb:_lbS.length, stuck:_stuck, g:+(_dbgGmin/L0).toFixed(4), D:+(thickD()/L0).toFixed(3), fRel:+_dbgDE.toExponential(2), E:+_ePrev.toFixed(4), mv:+(_dbgMoved/L0).toExponential(2), eta:+_eta.toExponential(2), settle:settleCount});
  }
  rec.steps=st; rec.runMs=Date.now()-t1; rec.msPerStep=+(rec.runMs/st).toFixed(1); rec.stepMsMax=stepMsMax;
  rec.settled=!running; rec.status=document.getElementById('status').textContent.slice(0,120);
  rec.stepsInfl=stepsInfl; rec.ratchets=ratchets.length; rec.ratchetReasons=ratchets.reduce((a,r)=>{a[r.reason]=(a[r.reason]||0)+1; return a;},{});
  rec.rej=rej; rec.rejInfl=rejInfl; rec.acc=acc; rec.accInfl=accInfl; rec.maxConsRej=maxConsRej; rec.maxConsRejInfl=maxConsRejInfl; rec.stallMax=stallMax;
  rec.bE=+H.bE().toFixed(3); rec.detEnd=_dbgDetEnd; rec.gminEnd=+(_dbgGmin/L0).toFixed(4); rec.fRelEnd=_dbgDE; rec.E=_ePrev;
  if(running){ H.play(); }
  rec.ratchetList=ratchets; rec.trace=trace;
  return rec; })()
