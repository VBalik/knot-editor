// Произвольные рисованные узлы со случайными проходами: инвариант + гладкость
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=+(process.env.SEED||777001);
  const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const NWANT=+(process.env.NW||12);
  const shape=()=>{ const V=H.verts(), n=V.length;
    let mx=0,e=0,acc=0;
    for(let i=0;i<n;i++){
      const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
      const cx2=uy*vz-uz*vy, cy2=uz*vx-ux*vz, cz2=ux*vy-uy*vx;
      const th=Math.atan2(Math.hypot(cx2,cy2,cz2), ux*vx+uy*vy+uz*vz);
      e+=th*th; if(th>mx) mx=th; if(th>0.5) acc++;
    }
    return {bE:+e.toFixed(2), maxAng:+(mx*180/Math.PI).toFixed(1), accordion:acc}; };
  const out=[]; let tries=0;
  while(out.length<NWANT && tries<120){
    tries++;
    document.getElementById('clear').onclick();
    const q=2+Math.floor(rnd()*3), p=0.9+rnd()*1.3;
    const f1=rnd()*6.283, f2=rnd()*6.283, f3=rnd()*6.283;
    const w3=0.1+0.4*rnd(), q3=3+Math.floor(rnd()*4);
    const rot=rnd()*6.283, cs=Math.cos(rot), sn=Math.sin(rot);
    H.drawCurve((t)=>{
      const a=t*2*Math.PI;
      const x0=Math.sin(a)+p*Math.sin(q*a+f1)+w3*Math.sin(q3*a+f3);
      const y0=Math.cos(a)-p*Math.cos(q*a+f2)+w3*Math.cos(q3*a+f3*0.7);
      return { x: 400+85*(cs*x0-sn*y0), y: 300+85*(sn*x0+cs*y0) };
    }, 260);
    let d=H.dbg();
    if(!d.crossings || d.crossings.length<2 || !H.verts().length) continue;
    const nc=d.crossings.length; if(nc>12) continue;
    for(let b=0;b<nc;b++){
      const want = rnd()<0.5 ? 'A':'B';
      const cs2=H.dbg().crossings;
      if(cs2[b].over!==want) H.pointer('pointerdown', cs2[b].x, cs2[b].y);
    }
    const det2d=H.dbg().knotDet, unk=H.dbg().isUnknot;
    if(!H.running()) H.play();
    if(!H.running()) continue;
    let o=null;
    for(let b=0;b<100;b++){ o=H.step(150); if(!o.running) break; }
    if(H.running()) H.play();
    const s=shape(), L=H.log();
    let mvLate=0;
    for(const r of (L.series||[])){ if(r.st>100 && (r.tD||0)<2.0 && r.maxMove>mvLate) mvLate=r.maxMove; }
    const d3=H.det3d(), runDetFin=H.dbg().runDet;
    out.push({ crossings:nc, det2d, unknot:unk,
      settled:!(o&&o.running), steps:L.stepsTotal,
      bE:s.bE, maxAng:s.maxAng, accordion:s.accordion,
      det3:d3, mvLateL0:+mvLate.toFixed(2),
      ok: (!(o&&o.running)) && s.accordion===0 && s.maxAng<30 &&
          d3===runDetFin && mvLate<1.5 });
  }
  return { tag:window.__buildTag, runs:out.length,
    okCount:out.filter(r=>r.ok).length,
    bad:out.filter(r=>!r.ok) };
})()
