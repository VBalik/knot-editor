// выгрузка состояний кампании randknots: лифт (после расстановки проходов) и
// состояние сразу после startPhysics (шум + фаза допустимости), до первого шага
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8'));
  const RK=global.__RK;
  const W=+(process.env.WORKER||0), NW=+(process.env.WORKERS||1), OUT=process.env.OUT;
  const TOTAL=+(process.env.TOTAL||100), baseSeed=+(process.env.SEED||20260903);
  let n=0;
  for(let i=0;i<TOTAL;i++){ if(i%NW!==W) continue;
    let seed=(baseSeed+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/(TOTAL-1)); const rec={i, target};
    try{
      let best=null;
      for(let att=0; att<70; att++){
        let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K));
        const p=0.25+0.15*rnd();
        const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
        if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue;
        const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
        document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx);
        const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
        const err=Math.abs(nc-target);
        if(!best || err<best.err) best={err, nc, K, p, att, clearance:st.clearance, pts, start:st.idx};
        if(err<=Math.max(2, 0.1*target)) break;
      }
      document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
      let d=H.dbg(); const nc=d.crossings.length;
      for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
      d=H.dbg(); rec.nc=nc; rec.N=d.N; rec.det2d=d.knotDet; rec.L0=d.L0;
      rec.crossings=d.crossings;
      rec.lift=H.verts().map(p=>p.map(x=>+x.toFixed(3)));
      H.setSlider('bendCoef',9); H.setSlider('repCoef',3);
      if(!H.running()) H.play();
      const dR=H.dbg(); rec.runDet=dR.runDet; rec.runUnknot=dR.runUnknot;
      rec.feas=H.verts().map(p=>p.map(x=>+x.toFixed(3)));
      if(typeof minSegGap==='function'){ rec.gapFeasD=+(minSegGap()/(1.6*d.L0)).toFixed(3); } rec.unstick=window.__knotTrace().unstick; rec.inflate0=window.__knotTrace().inflate;
      if(H.running()) H.play();
    }catch(e){ rec.err=String(e&&e.message||e); }
    fs.appendFileSync(OUT, JSON.stringify(rec)+'\n'); n++;
  }
  return {worker:W, n};
})()
