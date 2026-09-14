// КАМПАНИЯ «100 случайных узлов, 10–100 пересечений» (2026-09-03).
// Кривая — случайный ряд Фурье (K гармоник, спад 1/k^p), число пересечений
// подбирается под цель; над/под — случайно 50/50; ползунки 9/3; бюджет
// MAXSTEPS шагов или MAXMS мс. Запуск: WORKER=i WORKERS=n node harness.js randknots.js
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8'));
  const RK=global.__RK;
  const W=+(process.env.WORKER||0), NW=+(process.env.WORKERS||1);
  const OUT=process.env.OUT||('rk_w'+W+'.jsonl'), OUTV=OUT.replace('.jsonl','.verts.jsonl');
  const TOTAL=+(process.env.TOTAL||100), MAXSTEPS=+(process.env.MAXSTEPS||10000), MAXMS=+(process.env.MAXMS||240000);
  const baseSeed=+(process.env.SEED||20260903);
  const shape=()=>{ const V=H.verts(), n=V.length; let mx=0,sum=0,cx=0,cy=0,cz=0,sr=0,sr2=0;
    for(const v of V){cx+=v[0];cy+=v[1];cz+=v[2];} cx/=n;cy/=n;cz/=n;
    for(let i=0;i<n;i++){ const v=V[i], r=Math.hypot(v[0]-cx,v[1]-cy,v[2]-cz); sr+=r; sr2+=r*r;
      const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
      const c1=uy*vz-uz*vy, c2=uz*vx-ux*vz, c3=ux*vy-uy*vx;
      const th=Math.atan2(Math.hypot(c1,c2,c3), ux*vx+uy*vy+uz*vz); sum+=th; if(th>mx) mx=th; }
    const mr=sr/n, rv=100*Math.sqrt(Math.max(0,sr2/n-mr*mr))/mr, mean=sum/n;
    return {maxAng:+(mx*180/Math.PI).toFixed(2), meanAng:+(mean*180/Math.PI).toFixed(2), ratio:+(mx/mean).toFixed(2),
            kR:+(mx*n/(2*Math.PI)).toFixed(2), rvar:+rv.toFixed(1)}; };
  const results=[];
  for(let i=0;i<TOTAL;i++){ if(i%NW!==W) continue;
    let seed=(baseSeed+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/(TOTAL-1));
    const rec={i, target};
    try{
      let best=null;
      for(let att=0; att<70; att++){
        let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K));
        const p=0.25+0.15*rnd();
        const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
        if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue;
        const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
        document.getElementById('clear').onclick();
        RK.drawPts(H, pts, st.idx);
        const d=H.dbg(); const nc=d.crossings?d.crossings.length:0;
        if(!d.N || nc<1) continue;
        const err=Math.abs(nc-target);
        if(!best || err<best.err) best={err, nc, K, p, att, clearance:st.clearance, pts, start:st.idx};
        if(err<=Math.max(2, 0.1*target)) break;
      }
      if(!best) throw new Error('генерация не удалась');
      document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
      let d=H.dbg(); const nc=d.crossings.length;
      let flips=0;
      for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings;
        if(cs[b] && cs[b].over!==want){ H.pointer('pointerdown', cs[b].x, cs[b].y); flips++; } }
      d=H.dbg();
      Object.assign(rec,{nc, N:d.N, det2d:d.knotDet, isUnknot:d.isUnknot, K:best.K, p:+best.p.toFixed(2), genAttempts:best.att+1, clearance:+best.clearance.toFixed(0), flips});
      H.setSlider('bendCoef',9); H.setSlider('thick', +(process.env.W||1)); H.setSlider('repCoef', +(process.env.R||1));
      rec.w=+(process.env.W||1); rec.r=+(process.env.R||1); rec.sL0=+(sNominal()/L0).toFixed(4); rec.DL0=+(thickCoef*unitLen()/L0).toFixed(4);
      if(!H.running()) H.play();
      if(!H.running()) throw new Error('PLAY FAILED');
      const dR=H.dbg(); rec.runDet=dR.runDet; rec.runUnknot=dR.runUnknot; rec.liftOK=(dR.runDet===d.knotDet); rec.tD=1.6*(dR.tD/1.6/(window.__knotTrace().inflate||1)); rec.inflate0=window.__knotTrace().inflate;
      const feasVerts=H.verts().map(p=>p.map(x=>+x.toFixed(3)));   // состояние после фазы допустимости (этот же прогон)
      rec.gapFeasD=(typeof minSegGap==='function')? +(minSegGap()/(1.6*d.L0)).toFixed(3) : null;
      const t0=Date.now(); let o=null, steps=0, minGap=1e9, fRelLast=null; const sAbs=sNominal();
      while(true){ o=H.step(100); steps+=100; if(o.minSegL0<minGap) minGap=o.minSegL0;
        const tr=window.__knotTrace(); if(tr.fRel>0) fRelLast=tr.fRel; rec.collide=tr.collide; if(tr.quietBy) rec.quietBy=tr.quietBy;
        if(rec.inflSteps===undefined && tr.inflate>=1) rec.inflSteps=steps;
        if(!o.running) break; if(steps>=MAXSTEPS || Date.now()-t0>MAXMS) break; }
      const settled=!o.running, wall=Date.now()-t0;
      if(H.running()) H.play();
      const L=H.log(), s=L.series||[];
      let eViol=0, pe=null, eRiseMax=0, mvLate=0;
      const inflEnd=(rec.inflSteps||0)+100;
      for(const r of s){ if(r.minSegL0!=null && r.minSegL0<minGap) minGap=r.minSegL0;
        if(r.st>500 && r.maxMove>mvLate) mvLate=r.maxMove;
        if(r.st<=inflEnd){ pe=null; continue; }               // фаза надувания: E растёт ступенями по построению
        if(r.E==null){ pe=null; continue; }
        if(pe!=null && r.E>pe*1.001+1e-9){ eViol++; eRiseMax=Math.max(eRiseMax,(r.E-pe)/pe); } pe=r.E; }
      const sh=shape(), n=H.dbg().N, bE=H.bE(), d3=H.det3d();
      const realSteps=(L.stepsTotal!=null? L.stepsTotal : steps);
      Object.assign(rec,{settled, status:H.dbg().status.slice(0,44), steps:realSteps, wallS:+(wall/1000).toFixed(1), msPerStep:+(wall/Math.max(1,realSteps)).toFixed(1),
        bE:+bE.toFixed(3), bECircle:+(4*Math.PI*Math.PI/n).toFixed(3), bE2Circle:+(16*Math.PI*Math.PI/n).toFixed(3), ...sh, det3d:d3,
        topoOK: rec.runUnknot? d3===1 : d3===rec.runDet, minGapL0:+minGap.toFixed(3), minGapD:+(minGap/rec.tD).toFixed(2),
        eViol, eRiseMax:+eRiseMax.toExponential(1), mvLate:+mvLate.toFixed(2), fRel:fRelLast, minGapS:+(minGap*L0/sAbs).toFixed(3), gapEndS:+(minSegGap()/sAbs).toFixed(3), inflateEnd:+window.__knotTrace().inflate.toFixed(3), jammed:/не помещается/.test(H.dbg().status), lenErr:+(Math.max(...verts.map((v,k)=>Math.abs(v.distanceTo(verts[(k+1)%N])-L0)))/L0).toExponential(1)});
      if(settled){ const V0=H.verts().map(p=>p.slice()); H.play(); const o2=H.step(200); if(H.running()) H.play();
        const V=H.verts(); let mv=0; for(let k=0;k<V.length;k++){ mv=Math.max(mv, Math.hypot(V[k][0]-V0[k][0],V[k][1]-V0[k][1],V[k][2]-V0[k][2])); }
        rec.driftL0=+(mv/H.dbg().L0).toFixed(3); rec.driftBE=+H.bE().toFixed(3); rec.stoppedAgain=!o2.running; }
      fs.appendFileSync(OUTV, JSON.stringify({i, L0:H.dbg().L0, feas:feasVerts, verts:H.verts().map(p=>p.map(x=>+x.toFixed(3)))})+'\n');
    }catch(e){ rec.err=String(e&&e.message||e); }
    fs.appendFileSync(OUT, JSON.stringify(rec)+'\n');
    results.push(rec);
  }
  return {worker:W, n:results.length};
})()
