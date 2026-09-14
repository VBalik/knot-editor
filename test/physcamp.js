// ФИЗИЧНОСТЬ-КАМПАНИЯ: запутанные каракули в стиле пользователя ×
// ~10 случайных расстановок проходов на каждую. Оценка каждого прогона:
//   A settled — осадка в бюджете (не вечная болтанка)
//   B smooth  — нет рывков: ход вершины после разворачивания <1.5·L0 вне продувки
//   C mono    — вне продувок энергия не растёт (потолок +2%)
//   D final   — тривиальная реализация → окружность (bE≤1.6×круга, kR<2.5);
//               узловая → гладкая форма (maxAng<30°, kR≤12) без «восьмёрки»
//   E topo    — det трёх проекций финала == runDet (факт сохранён)
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs');
  let seed=+(process.env.SEED||280701);
  const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const ND=+(process.env.ND||5), NM=+(process.env.NM||10);
  const MAXB=+(process.env.MAXB||170);   // ×150 шагов = бюджет 25.5k

  // каракуля в стиле юзера: широкая лиссажу-помесь с локальными волнами
  const draw=()=>{
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
  };
  const det3=()=>H.det3d();
  const shape=()=>{ const V=H.verts(), n=V.length;
    let mx=0,cx=0,cy=0,cz=0,sr=0,sr2=0;
    for(const v of V){cx+=v[0];cy+=v[1];cz+=v[2];} cx/=n;cy/=n;cz/=n;
    for(let i=0;i<n;i++){
      const v=V[i], r=Math.hypot(v[0]-cx,v[1]-cy,v[2]-cz); sr+=r; sr2+=r*r;
      const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
      const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
      const c1=uy*vz-uz*vy, c2=uz*vx-ux*vz, c3=ux*vy-uy*vx;
      const th=Math.atan2(Math.hypot(c1,c2,c3), ux*vx+uy*vy+uz*vz);
      if(th>mx) mx=th;
    }
    const mr=sr/n, rv=100*Math.sqrt(Math.max(0,sr2/n-mr*mr))/mr;
    return {maxAng:+(mx*180/Math.PI).toFixed(1), kR:+(mx*n/(2*Math.PI)).toFixed(1),
            rvar:+rv.toFixed(1)}; };

  const out=[]; let runId=0;
  for(let dI=0; dI<ND; dI++){
    draw();
    let d0=H.dbg();
    if(!d0.crossings || d0.crossings.length<6 || d0.crossings.length>18){ dI--; continue; }
    const nc=d0.crossings.length;
    for(let mI=0; mI<NM; mI++){
      runId++;
      // случайная расстановка проходов
      for(let b=0;b<nc;b++){
        const want=rnd()<0.5?'A':'B';
        const cs2=H.dbg().crossings;
        if(cs2[b] && cs2[b].over!==want) H.pointer('pointerdown', cs2[b].x, cs2[b].y);
      }
      const dd=H.dbg();
      H.setSlider('bendCoef', 1+Math.floor(rnd()*10));
      H.setSlider('repCoef', 1+Math.floor(rnd()*10));
      if(!H.running()) H.play();
      if(!H.running()){ out.push({runId, err:'PLAY FAILED'}); continue; }
      const dR=H.dbg();
      let o=null, b2=0;
      for(;b2<MAXB;b2++){ o=H.step(150); if(!o.running) break; }
      if(H.running()) H.play();     // стоп: бюджет исчерпан
      const L=H.log(), s=L.series||[];
      // метрики гладкости и монотонности
      let mvLate=0, eViol=0, pe=null, blow=false;
      for(const r of s){
        if(r.bp) blow=true;                 // продувка/морф — не судим гладкость
        if(r.st>500 && !r.bp && r.tD<=2.2 && r.maxMove>mvLate) mvLate=r.maxMove;
        if(r.E==null){ pe=null; continue; }
        if(pe!=null && r.E>pe*1.02+1e-6) eViol++;
        pe=r.E;
      }
      const sh=shape(), n=H.dbg().N;
      const circ=4*Math.PI*Math.PI/n;
      const settled=!(o&&o.running);
      const runUnk=dR.runUnknot, runDet=dR.runDet;
      const bE=+H.bE().toFixed(3);
      const d3=det3();
      const okA=settled;
      const okB=mvLate<1.5;
      const okC=eViol===0;
      const okD=runUnk? (bE<1.6*circ && sh.kR<2.5)
                      : (sh.maxAng<30 && sh.kR<=12);
      const okE=runUnk? d3===1 : d3===runDet;
      const ok=okA&&okB&&okC&&okD&&okE;
      const rec={runId, drawing:dI, nc, det2d:dd.knotDet, runDet, runUnk,
        bend:H.dbg().N&&document.getElementById('bendCoef').value,
        rep:document.getElementById('repCoef').value,
        settled, steps:L.stepsTotal, bE, kR:sh.kR, maxAng:sh.maxAng,
        rvar:sh.rvar, mvLate:+mvLate.toFixed(2), eViol, d3,
        ok, why: ok? '' : [okA?'':'A-болтанка',okB?'':'B-рывок',okC?'':'C-немонотон',
                          okD?'':'D-форма',okE?'':'E-топология'].filter(x=>x).join(',')};
      out.push(rec);
      if(runId===+(process.env.DUMPRUN||-1))
        fs.writeFileSync('/tmp/knot_phys_full_'+runId+'.json',
          JSON.stringify({rec, series:s}, null, 1));
      if(!ok) fs.writeFileSync('/tmp/knot_phys_fail_'+runId+'.json',
        JSON.stringify({rec, series:s.slice(-60), verts:H.verts()}, null, 1));
    }
  }
  const okN=out.filter(r=>r.ok).length;
  return { tag:window.__buildTag, runs:out.length, okN,
    fails: out.filter(r=>!r.ok), all: out };
})()
