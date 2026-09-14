// мягкая мода: после «покоя» продолжить спуск и измерить, сколько энергии ещё уходит и как далеко уезжает узел
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const IDS=process.env.IDS.split(',').map(Number); const out=[];
  for(const i of IDS){ let seed=(20260903+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/99); let best=null;
    for(let att=0; att<70; att++){ let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K)); const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
      if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue; const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
      document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx); const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
      const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
    document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
    const nc=H.dbg().crossings.length; for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
    H.setSlider('bendCoef',9); H.setSlider('thick',+(process.env.W||1)); H.setSlider('repCoef',+(process.env.R||1)); if(!H.running()) H.play();
    let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=10000) break; }
    const bE0=H.bE(), V0=H.verts().map(p=>p.slice()); const fRel0=window.__knotTrace().fRel;
    // возобновляем и продолжаем 3000 шагов; фиксируем E и сдвиг каждые 500
    H.play(); const rows=[]; let st2=0;
    while(st2<3000){ const o2=H.step(500); st2+=500; const V=H.verts(); let mv=0; for(let k=0;k<V.length;k++) mv=Math.max(mv, Math.hypot(V[k][0]-V0[k][0],V[k][1]-V0[k][1],V[k][2]-V0[k][2]));
      rows.push({st:st2, dbE:+((H.bE()-bE0)/bE0*100).toFixed(3), moveL0:+(mv/L0).toFixed(2), fRel:+window.__knotTrace().fRel.toExponential(2), running:o2.running}); if(!o2.running) break; }
    if(H.running()) H.play();
    out.push({i, nc, N, settledAt:st, bE0:+bE0.toFixed(4), fRel0:+fRel0.toExponential(2), ftol:+(0.02*4*Math.PI/N).toExponential(2), rows}); }
  return out; })()
