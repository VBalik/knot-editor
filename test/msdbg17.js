(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__msDebug=true; const fs=global.__require('fs'), vm=global.__require('vm'); vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const i=+(process.env.I||17);
  let seed=(20260903+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const target=10+Math.round(90*i/99); let best=null;
  for(let att=0; att<70; att++){ let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K)); const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
    if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue; const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
    document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx); const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
    const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
  document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
  const nc=H.dbg().crossings.length; for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
  window.__knotSet({ms:+(process.env.K||3)}); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1); if(!H.running()) H.play();
  let o=null, st=0; while(true){ o=H.step(100); st+=100; if(st%1000===0){ const t=window.__knotTrace(); console.error('  st',st,'round',t.msRound,'infl',+t.inflate.toFixed(3),'bE/M',+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3),'fRel',+t.fRel.toExponential(1)); } if(!o.running || st>=30000) break; }
  return {steps:st, EoverM:+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3), rounds:window.__knotTrace().msEnergies, status:H.dbg().status.slice(0,120)}; })()
