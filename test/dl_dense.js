(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const seeds=(process.env.SEEDS||'1,2,3,4').split(',').map(Number); const Q=Number(process.env.Q||9), W=Number(process.env.W||0.6);
  for(const seed of seeds){
    let s=seed; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; Math.random=rnd;
    if(H.running()) H.play(); document.getElementById('clear').onclick();
    const p=1.0+rnd(), f1=rnd()*6.283, f2=rnd()*6.283, f3=rnd()*6.283, q3=Q+Math.floor(rnd()*3), q4=Q+4+Math.floor(rnd()*3);
    H.drawCurve((t)=>{ const a=t*2*Math.PI;
      const x0=Math.sin(a)+p*Math.sin(3*a+f1)+W*Math.sin(q3*a+f3)+0.4*Math.sin(q4*a+f1*0.6);
      const y0=Math.cos(a)-p*Math.cos(3*a+f2)+W*Math.cos(q3*a+f3*0.7)+0.4*Math.cos(q4*a+f2*1.3);
      return {x:400+90*x0, y:300+90*y0}; }, Number(process.env.PTS||600));
    const err0=errL(), gap0=minSegGap()/L0;
    const oS=startFeasibility; let fr=null; startFeasibility=function(m){ fr=oS(m); return fr; };
    const t0=Date.now(); H.play(); const ms=Date.now()-t0; startFeasibility=oS;
    const rec={seed, nc:crossings.length, N, thick:+_thickScale.toFixed(3), err0:+err0.toFixed(3), gap0:+gap0.toExponential(1), feasIt:fr.it, feasErr:+(fr.err/L0).toExponential(1), errAfterStart:+errL().toExponential(1), inflate0:+_inflate.toExponential(2), startMs:ms};
    let acc=0, rej=0, maxRun=0, run=0; const S=Number(process.env.STEPS||100);
    for(let k=0;k<S && running;k++){ relaxStep(); if(_dbgTier<0){rej++; run++; if(run>maxRun) maxRun=run;} else {acc++; run=0;} }
    Object.assign(rec,{acc,rej,maxRun,infl:+_inflate.toFixed(3),stall:_inflStall,status:document.getElementById('status').textContent.slice(0,50)}); if(running) H.play();
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
