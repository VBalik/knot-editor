(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=+(process.env.SEED||280701);
  const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const out={smooth:+(process.env.SMOOTH||12), mom:+(process.env.MOM||0.85)}; window.__knotSet({smooth:out.smooth, momentum:out.mom});
  for(let k=0;k<2;k++){
    if(H.running()) H.play();
    document.getElementById('clear').onclick();
    const rot=rnd()*6.283, cs=Math.cos(rot), sn=Math.sin(rot);
    const q=2+Math.floor(rnd()*3), p=1.0+rnd()*1.2;
    const f1=rnd()*6.283, f2=rnd()*6.283, f3=rnd()*6.283;
    const w3=0.15+0.45*rnd(), q3=3+Math.floor(rnd()*4);
    const w4=0.1+0.25*rnd(), q4=5+Math.floor(rnd()*3);
    H.drawCurve((t)=>{ const a=t*2*Math.PI;
      const x0=Math.sin(a)+p*Math.sin(q*a+f1)+w3*Math.sin(q3*a+f3)+w4*Math.sin(q4*a+f1*0.6);
      const y0=Math.cos(a)-p*Math.cos(q*a+f2)+w3*Math.cos(q3*a+f3*0.7)+w4*Math.cos(q4*a+f2*1.3);
      return {x:400+95*(cs*x0-sn*y0), y:300+95*(sn*x0+cs*y0)}; }, 300);
    const d0=H.dbg();
    H.play();
    const rows=[]; let o=null;
    for(let b=0;b<24;b++){ o=H.step(250); const t=window.__knotTrace();
      rows.push({st:(b+1)*250, bE:+H.bE().toFixed(3), E:+(t.E||0).toFixed(4), fRel:+t.fRel.toFixed(4), mv:+t.moved.toFixed(3), eta:+t.eta.toExponential(1), stuck:t.stuck, settle:t.settle, gmin:+t.gmin.toFixed(2)});
      if(!o.running) break; }
    if(H.running()) H.play();
    out['scribble'+k]={crossings:d0.crossings.length, det:d0.knotDet, runDet:H.dbg().runDet, unknot:H.dbg().runUnknot, N:d0.N, circle:+(4*Math.PI*Math.PI/d0.N).toFixed(3), status:H.dbg().status.slice(0,40), rows:rows.filter((r,i)=>i%3===2||i===rows.length-1)};
  }
  return out;
})()
