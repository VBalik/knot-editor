// Зонд к претензии «gmin→0». Рисунок через штатный ввод (drawCurve): стадион,
// дно — пологая дуга радиуса Rn (центр C), выемка сверху с носиком — концентричная
// дуга радиуса Rn−g (тот же центр). 0 пересечений → z≡0, зазор лифта ≈ g·worldScale.
// Бисекция по g до зазора лифта ≈ target·L0, затем старт физики и шаги.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const STEPS=+(process.env.STEPS||300);
  const targets=(process.env.TARGETS||'1e-2,5e-7,1e-7,1e-9').split(',').map(Number);
  const draw=(g)=>{
    const pts=[]; const push=(x,y)=>pts.push({x,y});
    const yT=80, yB=520, xL=150, xR=650, cy=300, R=220, xw=60, cxn=400, rc=20, Rn=1000;
    const Cy=yB-Rn;                                    // центр концентрических дуг (над дном)
    const line=(x0,y0,x1,y1,n)=>{ for(let k=1;k<=n;k++) push(x0+(x1-x0)*k/n, y0+(y1-y0)*k/n); };
    const arc=(cx,cy0,r,a0,a1,n)=>{ for(let k=1;k<=n;k++){ const a=a0+(a1-a0)*k/n; push(cx+r*Math.cos(a), cy0+r*Math.sin(a)); } };
    const yArc=(x,r)=>Cy+Math.sqrt(r*r-(x-cxn)*(x-cxn));
    push(cxn+xw, yT);
    line(cxn+xw,yT, xR,yT, 100);
    arc(xR,cy,R, -Math.PI/2, Math.PI/2, 300);
    { const n=220; for(let k=1;k<=n;k++){ const x=xR+(xL-xR)*k/n; push(x, yArc(x,Rn)); } }   // дно — дуга радиуса Rn
    arc(xL,cy,R, Math.PI/2, 3*Math.PI/2, 300);
    line(xL,yT, cxn-xw,yT, 100);
    const rn=Rn-g, xa=cxn-xw+rc, xb=cxn+xw-rc;         // носик — концентричная дуга радиуса Rn−g
    const yJa=yArc(xa,rn), yJb=yArc(xb,rn);
    line(cxn-xw,yT, cxn-xw,yJa-rc, 200);
    arc(xa,yJa-rc,rc, Math.PI, Math.PI/2, 20);
    { const n=40; for(let k=1;k<=n;k++){ const x=xa+(xb-xa)*k/n; push(x, yArc(x,rn)); } }
    arc(xb,yJb-rc,rc, Math.PI/2, 0, 20);
    line(cxn+xw,yJb-rc, cxn+xw,yT+20, 200);
    const M=pts.length;
    H.el('clear').onclick();
    H.drawCurve((u)=>pts[Math.min(M-1,Math.floor(u*M))], M-1);
    const d=H.dbg();
    return {nc:d.crossings.length, N:d.N, L0:d.L0, worldScale, gapL0:(verts.length? minSegGap()/L0 : null)};
  };
  const out=[]; { const o1=startFeasibility; startFeasibility=function(m){ const r=o1(m); global.__sfIt=r.it; global.__sfErr=r.err; return r; }; const o2=minSegGap; global.__msg=0; minSegGap=function(){ global.__msg++; return o2(); }; }
  for(const T of targets){
    // бисекция: hi — зазор>T (без пересечений), lo — зазор≤T или пересечения
    let lo=-1, hi=3, r=null, bestG=null;
    for(let it=0;it<70;it++){ const g=(lo+hi)/2; r=draw(g);
      if(r.nc>0 || r.gapL0===null || r.gapL0<=T){ lo=g; continue; }
      hi=g; bestG=g; if(r.gapL0<1.5*T) break; }
    r=draw(bestG);
    const rec={target:T, gpx:+bestG.toExponential(4), nc:r.nc, N:r.N, L0:r.L0, liftGapL0:+r.gapL0.toExponential(3)};
    const t0=Date.now(); if(!H.running()) H.play(); rec.startMs=Date.now()-t0; rec.sfIt=global.__sfIt; rec.sfErrL0=+(global.__sfErr/L0).toExponential(2); rec.minSegGapCalls=global.__msg; global.__msg=0;
    const tr0=window.__knotTrace();
    rec.start={unstick:tr0.unstick, inflate:+tr0.inflate.toExponential(3), gapAfterStart:+(minSegGap()/L0).toExponential(3), status:H.dbg().status.slice(0,60)};
    const V0=H.verts(); const rows=[];
    for(let b=0;b<STEPS/50;b++){ const o=H.step(50); const t=window.__knotTrace();
      const V=H.verts(); let mv=0; for(let i=0;i<V.length;i++) mv=Math.max(mv, Math.hypot(V[i][0]-V0[i][0],V[i][1]-V0[i][1],V[i][2]-V0[i][2]));
      rows.push({st:(b+1)*50, gmin:+t.gmin.toExponential(2), infl:+t.inflate.toExponential(2), moved:+t.moved.toExponential(2), drift:+(mv/L0).toExponential(2), stuck:t.stuck, E:+t.E.toFixed(4), tier:t.tier, status:o.status.slice(0,40)});
      if(!o.running) break; }
    rec.rows=rows; if(H.running()) H.play(); out.push(rec);
  }
  return out;
})()
