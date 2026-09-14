(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=777001;
  const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const shape=()=>{ const V=H.verts(), n=V.length; let mx=0,e=0;
    for(let i=0;i<n;i++){ const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
      const cx2=uy*vz-uz*vy, cy2=uz*vx-ux*vz, cz2=ux*vy-uy*vx;
      const th=Math.atan2(Math.hypot(cx2,cy2,cz2), ux*vx+uy*vy+uz*vz); e+=th*th; if(th>mx) mx=th; }
    return {bE:+e.toFixed(2), maxAng:+(mx*180/Math.PI).toFixed(1)}; };
  let accepted=0, tries=0, out=null;
  while(tries<120){
    tries++;
    document.getElementById('clear').onclick();
    const q=2+Math.floor(rnd()*3), p=0.9+rnd()*1.3;
    const f1=rnd()*6.283, f2=rnd()*6.283, f3=rnd()*6.283;
    const w3=0.1+0.4*rnd(), q3=3+Math.floor(rnd()*4);
    const rot=rnd()*6.283, cs=Math.cos(rot), sn=Math.sin(rot);
    H.drawCurve((t)=>{ const a=t*2*Math.PI;
      const x0=Math.sin(a)+p*Math.sin(q*a+f1)+w3*Math.sin(q3*a+f3);
      const y0=Math.cos(a)-p*Math.cos(q*a+f2)+w3*Math.cos(q3*a+f3*0.7);
      return { x: 400+85*(cs*x0-sn*y0), y: 300+85*(sn*x0+cs*y0) }; }, 260);
    let d=H.dbg();
    if(!d.crossings || d.crossings.length<2 || !H.verts().length) continue;
    const nc=d.crossings.length; if(nc>12) continue;
    for(let b=0;b<nc;b++){ const want = rnd()<0.5 ? 'A':'B'; const cs2=H.dbg().crossings;
      if(cs2[b].over!==want) H.pointer('pointerdown', cs2[b].x, cs2[b].y); }
    accepted++;
    if(accepted<4){ // прогнать как в selfknots, чтобы сохранить последовательность rnd? rnd не зависит от физики
      continue; }
    // 4-й случай: диагностика старта
    const s0=shape(); const d0=H.dbg();
    out={ crossings:nc, det2d:d0.knotDet, N:d0.N, L0:d0.L0, liftBE:s0.bE, liftMaxAng:s0.maxAng, gminLift_L0:null };
    // зазор на старте
    const V=H.verts(); let gm=1e9;
    for(let i=0;i<V.length;i++){ for(let j=i+3;j<V.length;j++){ const cd=Math.min(j-i,V.length-(j-i)); if(cd<=2) continue;
      const dx=V[i][0]-V[j][0], dy=V[i][1]-V[j][1], dz=V[i][2]-V[j][2]; const dd=Math.sqrt(dx*dx+dy*dy+dz*dz); if(dd<gm) gm=dd; } }
    out.gminLift_L0=+(gm/d0.L0).toFixed(3);
    H.play();
    window.__trialLog=[];
    H.step(3);
    out.trials=window.__trialLog.slice(0,20); window.__trialLog=null;
    const t=window.__knotTrace(); out.trace={fRel:t.fRel, gmin:t.gmin, D:t.D, stuck:t.stuck, eta:t.eta};
    out.afterBE=shape();
    if(H.running()) H.play();
    break;
  }
  return out;
})()
