(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=4242; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const out=[];
  for(const K of [3,5,7,9,11,13,16]){
    for(let rep=0;rep<2;rep++){
      document.getElementById('clear').onclick();
      const ax=[],ay=[],px=[],py=[];
      for(let k=1;k<=K;k++){ const dec=1/Math.pow(k,0.9); ax.push(dec*(0.3+rnd())); ay.push(dec*(0.3+rnd())); px.push(rnd()*6.283); py.push(rnd()*6.283); }
      // нормировка в окно ±260 px
      const pts=[]; const M=1200; let mx=0;
      for(let i=0;i<M;i++){ const a=i/M*2*Math.PI; let x=0,y=0; for(let k=1;k<=K;k++){ x+=ax[k-1]*Math.sin(k*a+px[k-1]); y+=ay[k-1]*Math.cos(k*a+py[k-1]); } pts.push([x,y]); mx=Math.max(mx,Math.abs(x),Math.abs(y)); }
      const sc=260/mx;
      const t0=performance.now();
      H.drawCurve(u=>{ const p=pts[Math.min(M-1,Math.floor(u*M))]; return {x:400+sc*p[0], y:300+sc*p[1]}; }, M);
      const tDraw=performance.now()-t0;
      const d=H.dbg(); const nc=d.crossings?d.crossings.length:-1;
      if(!H.running()) H.play();
      const t1=performance.now(); H.step(30); const ms=(performance.now()-t1)/30;
      if(H.running()) H.play();
      out.push({K, nc, N:d.N, msPerStep:+ms.toFixed(1), drawMs:Math.round(tDraw)});
    }
  }
  return out;
})()
