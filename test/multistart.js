// многостарт: покой → встряхивание (сертифицированное) → покой, K раундов; лучший минимум и тип узла
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const IDS=process.env.IDS.split(',').map(Number); const K=+(process.env.K||6); const out=[];
  const settle=()=>{ if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=8000) break; } if(H.running()) H.play(); return st; };
  for(const i of IDS){ let seed=(20260903+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/99); let best=null;
    for(let att=0; att<70; att++){ let Kh=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; Kh=Math.max(4, Math.min(32, Kh)); const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,Kh,p); const off=RK.countCross(pts);
      if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue; const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
      document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx); const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
      const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
    document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
    const nc=H.dbg().crossings.length; for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
    H.setSlider('bendCoef',9); H.setSlider('thick',+(process.env.W||1)); H.setSlider('repCoef',+(process.env.R||1));
    const st0=settle(); const det0=window.__knotDebug().runDet; const milnor=16*Math.PI*Math.PI/N; const hist=[{round:0, steps:st0, E:+(H.bE()/milnor).toFixed(3), det:_detRobust(3)}];
    let bestE=H.bE(), bestV=H.verts().map(p=>p.slice());
    for(let k=1;k<=K;k++){ window.__knotSetVertsRaw(bestV); const kick=window.__knotKick(+(process.env.AMP||3), +(process.env.ROUNDS||25)); const st=settle(); const E=H.bE(); const det=_detRobust(3);
      hist.push({round:k, kicked:kick.applied, steps:st, E:+(E/milnor).toFixed(3), det, improved:E<bestE*0.999}); if(E<bestE*0.999 && det===det0){ bestE=E; bestV=H.verts().map(p=>p.slice()); } }
    out.push({i, nc, N, det:det0, det2d:knotDet, E0:hist[0].E, best:+(bestE/milnor).toFixed(3), hist}); }
  return out; })()
