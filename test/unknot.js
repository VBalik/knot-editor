// 4.11: ГИПОТЕЗА ПРОЕКТА — тривиальный узел из жёсткой струны всегда распрямляется в окружность.
// Здесь строятся ЗАВЕДОМО тривиальные, но сильно запутанные узлы, и проверяется, распутает ли их программа.
//
// Тривиальность обеспечена построением, а не проверкой. Берём произвольную плоскую замкнутую кривую с
// нужным числом самопересечений и назначаем проходы НИСХОДЯЩЕ: на каждом пересечении сверху идёт та прядь,
// которую обход кривой встречает первой. Нисходящая диаграмма всегда тривиальна (классический факт);
// сверено со стендом: det = 1 и isUnknot на диаграммах до 150 пересечений, тогда как случайные проходы
// на тех же кривых дают определители до 10^16.
//
// Успех = настоящая окружность: разброс радиусов < UK_RAD и толщина вдоль наименьшей главной оси < UK_FLAT.
// Параметры: UK_N (узлов), UK_C (пересечений), UK_SEED0, UK_STIR (попыток Stir), UK_BUD (шагов на попытку),
//            UK_THICK/UK_REP/UK_BEND (ползунки), UK_VERBOSE=1 (ход прогона)
(async ()=>{ if(process.env.HK_ANN) window.__ann=JSON.parse(process.env.HK_ANN);   // лаборатория отжига (annApply в index.html)
 const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; window.__noAutoThick=true;
  const NK=+(process.env.UK_N||3), CT=+(process.env.UK_C||40), SEED0=+(process.env.UK_SEED0||1);
  const NSTIR=+(process.env.UK_STIR||10), BUD=+(process.env.UK_BUD||30000), VERB=process.env.UK_VERBOSE==='1';   // 4.11: бюджет 30 000 — ползущая попытка отдаётся Stir, а не ждёт часами (замер 2026-09-19)
  const RADT=+(process.env.UK_RAD||0.08), FLATT=+(process.env.UK_FLAT||0.05);
  let _s=1; const rnd=()=>{ _s=(Math.imul(_s,1103515245)+12345)&0x7fffffff; return _s/0x7fffffff; };

  const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/N,y:y/N,z:z/N}; };
  // пересечения проекции вдоль случайного направления (счётчик сверен: трилистник 3, восьмёрка 4, 5₁ 5, 7₁ 7)
  function crossings3D(){
    const t=2*Math.PI*rnd(), z=2*rnd()-1, r=Math.sqrt(1-z*z), w=[r*Math.cos(t), r*Math.sin(t), z];
    let ax=[1,0,0]; if(Math.abs(w[0])>0.9) ax=[0,1,0];
    const e1=[w[1]*ax[2]-w[2]*ax[1], w[2]*ax[0]-w[0]*ax[2], w[0]*ax[1]-w[1]*ax[0]];
    const n1=Math.hypot(e1[0],e1[1],e1[2]); for(let k=0;k<3;k++) e1[k]/=n1;
    const e2=[w[1]*e1[2]-w[2]*e1[1], w[2]*e1[0]-w[0]*e1[2], w[0]*e1[1]-w[1]*e1[0]];
    const n=N, X=new Float64Array(n), Y=new Float64Array(n);
    for(let i=0;i<n;i++){ const v=verts[i]; X[i]=v.x*e1[0]+v.y*e1[1]+v.z*e1[2]; Y[i]=v.x*e2[0]+v.y*e2[1]+v.z*e2[2]; }
    let c=0;
    for(let i=0;i<n;i++){ const i2=(i+1)%n, ax1=X[i], ay1=Y[i], bx=X[i2]-ax1, by=Y[i2]-ay1;
      for(let j=i+2;j<n;j++){ if(i===0 && j===n-1) continue; const j2=(j+1)%n;
        const cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx;
        if(Math.abs(den)<1e-14) continue;
        const s=((cx-ax1)*dy-(cy-ay1)*dx)/den, u=((cx-ax1)*by-(cy-ay1)*bx)/den;
        if(s>0 && s<1 && u>0 && u<1) c++; } }
    return c; }
  function roundness(){
    const c=cen(); let mn=Infinity, mx=0, sum=0;
    for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; }
    const R=sum/N;
    let a=0,b=0,d=0,e=0,f=0,g=0;
    for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ev=Array.from(jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]).vals).sort((p,q)=>p-q);
    return {R:+R.toFixed(3), rad:+((mx-mn)/R).toFixed(4), flat:+(Math.sqrt(Math.max(0,ev[0]))/R).toFixed(4)}; }
  const isCircle=()=>{ const q=roundness(); return q.rad<RADT && q.flat<FLATT && crossings3D()===0; };   // 4.16: и ни одного пересечения в проекции — тугая двойная катушка обманывает разброс и плоскость

  // плоская кривая со множеством самопересечений: сумма случайных гармоник. Число пересечений растёт
  // примерно как квадрат наивысшей гармоники, поэтому нужное C подбирается по K
  function wiggly(K, amp){
    const A=[], B=[];
    for(let k=1;k<=K;k++){ const w=amp/Math.pow(k,0.55);
      A.push([w*(2*rnd()-1), 2*Math.PI*rnd()]); B.push([w*(2*rnd()-1), 2*Math.PI*rnd()]); }
    const M=Math.max(900, Math.min(24000, 20*K*K)), pts=[];
    for(let i=0;i<M;i++){ const t=2*Math.PI*i/M;
      let x=Math.cos(t), y=Math.sin(t);
      for(let k=1;k<=K;k++){ x+=A[k-1][0]*Math.cos(k*t+A[k-1][1]); y+=B[k-1][0]*Math.cos(k*t+B[k-1][1]); }
      pts.push({x, y}); }
    return pts; }
  // диаграмма с ~target пересечениями и нисходящими проходами
  const AMP=+(process.env.UK_AMP||0.8);
  function makeUnknot(target){
    const build=(K)=>{ raw=fitToCanvas(wiggly(K, AMP), 0.92, true); closedCurve=false; drawing=false;
      finishCurve(true, true); return crossings.length; };
    // число пересечений растёт примерно как квадрат наивысшей гармоники: ищем K пополам, затем из
    // нескольких кривых с этим K берём ту, что ближе к цели (кривые случайные, разброс заметный)
    // одна и та же кривая (зерно s0) на всех K — число пересечений растёт с K монотонно, ищем пополам
    const s0=_s, buildAt=(K)=>{ _s=s0; return build(K); };
    let lo=3, hi=130, bestK=3, bestNc=0;
    while(lo<=hi){ const K=(lo+hi)>>1, nc=buildAt(K);
      if(!bestNc || Math.abs(nc-target)<Math.abs(bestNc-target)){ bestNc=nc; bestK=K; }
      if(nc===target) break; if(nc<target) lo=K+1; else hi=K-1; }
    const K=bestK, bestSeed=s0;
    _smoothCap=3000; _s=bestSeed; raw=fitToCanvas(wiggly(K, AMP), 0.92, true); closedCurve=false; drawing=false; finishCurve(true, false);
    for(const c of crossings){ c.over=(c.sA<c.sB)? 'A':'B'; c.pending=false; }   // НИСХОДЯЩЕ ⇒ тривиальный узел
    updateCrossInfo(); updateKnotType();
    return {nc:crossings.length, K, det:knotDet, isUnknot}; }

  const out=[], t00=Date.now();
  for(let q=0;q<NK;q++){
    _s=SEED0+q*7919;
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',+(process.env.UK_THICK||1)); H.setSlider('repCoef',+(process.env.UK_REP||1)); H.setSlider('bendCoef',+(process.env.UK_BEND||9));
    const t0=Date.now(), d=makeUnknot(CT);
    const rec={i:q, nc:d.nc, K:d.K, det2d:d.det, unknot2d:d.isUnknot, tries:[]};
    if(!d.isUnknot){ rec.ok=false; rec.err='diagram not trivial'; out.push(rec); continue; }
    H.set({ms:1}); H.play();                     // лифт из диаграммы и физика
    let done=false;
    for(let attempt=0; attempt<=NSTIR; attempt++){
      let st=0, o=null; const tP=Date.now();
      while(true){ o=H.step(200); st+=200;
        if(VERB && st%2000===0) console.error('   ', q, 'try', attempt, 'step', st, +((Date.now()-tP)/st).toFixed(1)+'ms/st', 'cross', crossings3D(), 'det3d', _detRobust(3), 'quietBy', typeof _dbgQuietBy==='undefined'? '' : _dbgQuietBy);
        if(!o.running || st>=BUD) break; }
      const r=roundness(), cc=crossings3D(), d3=_detRobust(3);
      rec.tries.push({at:attempt, steps:st, settled:!o.running, cross:cc, rad:r.rad, flat:r.flat, det3d:d3});
      if(isCircle()){ done=true; break; }
      if(attempt===NSTIR) break;
      if(H.running()) H.play();
      if(!window.__knotStir()) break;
      while(_stir) window.__knotStir(); }
    rec.ok=done; rec.det3dEnd=_detRobust(3); rec.N=N; rec.ms=Date.now()-t0;
    out.push(rec);
    console.error(q, 'nc', rec.nc, 'N', rec.N, rec.ok? 'CIRCLE at try '+(rec.tries.length-1) : 'no (det3d '+rec.det3dEnd+', cross '+rec.tries[rec.tries.length-1].cross+')', (rec.ms/1000).toFixed(1)+'s'); }
  const good=out.filter(r=>!r.err), ok=good.filter(r=>r.ok).length;
  return {n:NK, targetCross:CT, ok, pct:+(100*ok/Math.max(1,good.length)).toFixed(1),
    ncAvg:+(good.reduce((s,r)=>s+r.nc,0)/Math.max(1,good.length)).toFixed(1),
    NAvg:Math.round(good.reduce((s,r)=>s+(r.N||0),0)/Math.max(1,good.length)),
    stirAvg:+(good.reduce((s,r)=>s+r.tries.length-1,0)/Math.max(1,good.length)).toFixed(2),
    secAvg:+(good.reduce((s,r)=>s+r.ms,0)/Math.max(1,good.length)/1000).toFixed(1), totalSec:+((Date.now()-t00)/1000).toFixed(1),
    rows: out.map(r=>({i:r.i, nc:r.nc, N:r.N, ok:!!r.ok, stir:r.tries? r.tries.length-1 : 0, det3d:r.det3dEnd, sec:+((r.ms||0)/1000).toFixed(1), err:r.err,
      tries:r.tries})) };   // попытки целиком: по rad/flat/cross каждой видно, был ли узел почти окружностью или всё ещё клубком
})()
