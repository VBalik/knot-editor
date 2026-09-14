(async ()=>{
  const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
  global.__require('vm').runInThisContext(fs.readFileSync('rk_gen.js','utf8'));
  const RK=global.__RK;
  let seed=777; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const out=[];
  for(const [K,p] of [[8,0.3],[12,0.3],[16,0.3],[20,0.3],[24,0.3],[12,0.6],[20,0.6],[28,0.5]]){
    const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts); const st=RK.bestStart(pts, 60);
    document.getElementById('clear').onclick();
    RK.drawPts(H, pts, st.idx);
    const d=H.dbg(); const nc=d.crossings?d.crossings.length:-1;
    let ms=null; if(d.N>0){ if(!H.running()) H.play(); const t1=performance.now(); H.step(20); ms=+((performance.now()-t1)/20).toFixed(1); if(H.running()) H.play(); }
    out.push({K,p,offline:off, editor:nc, clearance:+st.clearance.toFixed(1), N:d.N, det:d.runDet===undefined?d.det:d.runDet, ms});
  }
  return out;
})()
