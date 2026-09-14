// генератор случайных замкнутых кривых с контролем числа пересечений (общий модуль)
(function(){
  function fourier(rnd, K, p){
    const ax=[],ay=[],px=[],py=[];
    for(let k=1;k<=K;k++){ const dec=1/Math.pow(k,p); ax.push(dec*(0.4+rnd())); ay.push(dec*(0.4+rnd())); px.push(rnd()*6.283); py.push(rnd()*6.283); }
    const M=1600, pts=[]; let mx=0;
    for(let i=0;i<M;i++){ const a=i/M*2*Math.PI; let x=0,y=0;
      for(let k=1;k<=K;k++){ x+=ax[k-1]*Math.sin(k*a+px[k-1]); y+=ay[k-1]*Math.cos(k*a+py[k-1]); }
      pts.push([x,y]); mx=Math.max(mx,Math.abs(x),Math.abs(y)); }
    const sc=250/mx; for(const q of pts){ q[0]=400+sc*q[0]; q[1]=300+sc*q[1]; }
    return pts;
  }
  function segInter(a,b,c,d){ const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
    const o1=o(a,b,c),o2=o(a,b,d),o3=o(c,d,a),o4=o(c,d,b); return (o1*o2<0)&&(o3*o4<0); }
  function countCross(pts){ const M=pts.length; let c=0;
    for(let i=0;i<M;i++){ const a=pts[i], b=pts[(i+1)%M];
      for(let j=i+2;j<M;j++){ if(i===0 && j===M-1) continue; if(segInter(a,b,pts[j],pts[(j+1)%M])) c++; } }
    return c; }
  function bestStart(pts, sep){ const M=pts.length; let best=-1, bi=0;
    for(let i=0;i<M;i+=4){ let mn=1e9; const a=pts[i];
      for(let j=0;j<M;j+=2){ const dj=Math.min(Math.abs(i-j), M-Math.abs(i-j)); if(dj<sep) continue;
        const d=Math.hypot(pts[j][0]-a[0], pts[j][1]-a[1]); if(d<mn) mn=d; }
      if(mn>best){ best=mn; bi=i; } }
    return {idx:bi, clearance:best}; }
  function drawPts(H, pts, start){ const M=pts.length;
    H.drawCurve(u=>{ const q=pts[(start+Math.min(M-1,Math.floor(u*M)))%M]; return {x:q[0], y:q[1]}; }, M); }
  global.__RK={fourier, countCross, bestStart, drawPts};
})()
