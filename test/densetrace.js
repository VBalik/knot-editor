(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const i=+(process.env.I||83);
  let seed=(20260903+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const target=10+Math.round(90*i/99); let best=null;
  for(let att=0; att<70; att++){ let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K)); const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
    if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue; const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
    document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx); const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
    const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
  document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
  const nc=H.dbg().crossings.length; for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
  H.setSlider('bendCoef',9); H.setSlider('repCoef',3); const t0=Date.now(); if(!H.running()) H.play(); const startMs=Date.now()-t0;
  const feasIt=window.__knotTrace(); const rows=[]; let o=null, st=0; window.__trialLog=[];
  while(true){ window.__trialLog=[]; o=H.step(200); st+=200; const t=window.__knotTrace();
    const tl=window.__trialLog; const byStep={}; for(const e of tl){ const k=e.st+':'+e.tier; (byStep[k]=byStep[k]||[]).push(e); }
    let acc={0:0,1:0,2:0}, fail={0:0,1:0,2:0}; for(const k in byStep){ const es=byStep[k]; const last=es[es.length-1]; if(last.dE<0) acc[es[0].tier]++; else fail[es[0].tier]++; }
    rows.push({st, bE:o.bendEnergy, fRel:+t.fRel.toExponential(2), gminD:+(t.gmin/1.6).toFixed(3), inflate:+t.inflate.toFixed(3), moved:+t.moved.toFixed(4), lb:t.lb, stuck:t.stuck, acc, fail, maxCurv:o.maxCurv});
    if(!o.running || st>=600) break; }
  return {i, nc, N:H.dbg().N, startMs, unstick:feasIt.unstick, inflate0:feasIt.inflate, status:H.dbg().status.slice(0,50), rows:rows.slice(0,3)}; })()
