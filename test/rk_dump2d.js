// выгрузка 2D-диаграммы (сглаженная кривая + пересечения с проходами) для выбранных узлов
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK;
  const IDS=process.env.IDS.split(',').map(Number), OUT=process.env.OUT; const TOTAL=100, baseSeed=20260903;
  for(const i of IDS){
    let seed=(baseSeed+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/(TOTAL-1)); let best=null;
    for(let att=0; att<70; att++){
      let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K));
      const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
      if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue;
      const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
      document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx);
      const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
      const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
    document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
    const nc=H.dbg().crossings.length;
    for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
    const d=H.dbg();
    const sm=(typeof smooth!=='undefined')? smooth.map(p=>[+p.x.toFixed(3), +p.y.toFixed(3)]) : null;
    const crFull=(typeof crossings!=='undefined')? crossings.map(c=>Object.assign({}, c)) : null;
    fs.appendFileSync(OUT, JSON.stringify({i, nc, N:d.N, det2d:d.knotDet, smooth:sm, crossings:crFull, lift:H.verts().map(p=>p.map(x=>+x.toFixed(4)))})+'\n');
  }
  return 'ok';
})()
