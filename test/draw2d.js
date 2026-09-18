// 4.1: предпросмотр 2D-диаграммы для облачной сессии (браузера нет).
// Запуск: KNOT_CANVAS=canvas2d.js node harness.js draw2d.js
//   KNOT=trefoil|figure8|cinquefoil|septafoil — пресет; KNOT=rN — randomKnot(N) с фиксированным зерном (SEED);
//   KNOT=open — незамкнутая кривая под пером (виден пунктирный стартовый кружок с тенью)
//   OUT=<файл.png> (по умолчанию out/draw2d.png), SCALE=1..4 — суперсэмплинг (DPR), BG=<цвет фона страницы>
(async ()=>{ const fs=__require('fs'), path=__require('path'), H=global.__H;
  const mod=(n)=>__require(path.join(process.cwd(),'node_modules',n));
  window.__noAutoSave=true; window.__noWorkers=true;
  const cv=H.el('draw'), ctx=cv.getContext('2d');
  const probe = ctx.__pixels && ctx.__pixels();   // без KNOT_CANVAS стенд отдаёт no-op-прокси: любой ключ — пустая функция
  if(!probe || !probe.data) throw new Error('нет растеризации 2D: запускай с KNOT_CANVAS=canvas2d.js');
  const C2=__require(path.join(process.cwd(),'canvas2d.js'));

  const sc=Math.max(1, Math.min(4, +(process.env.SCALE||1)||1));
  if(sc!==1){ DPR=sc; fitCanvas(); }                       // холст в sc раз крупнее, координаты диаграммы те же
  const kn=String(process.env.KNOT||'trefoil'), seed=(+(process.env.SEED||1)|0)||1;
  H.el('clear').onclick();
  const m=/^r(\d+)$/i.exec(kn), open=/^open$/i.test(kn);
  if(open){ const f=(u)=>({x:400+190*Math.cos(4.2*u-1.6), y:300+150*Math.sin(4.2*u-1.6)*Math.cos(1.3*u)});
    H.pointer('pointerdown', f(0).x, f(0).y);
    for(let i=1;i<=140;i++){ const p=f(i/140); H.pointer('pointermove', p.x, p.y); } }   // перо не отпускаем: кривая открыта
  else if(m){ const R=Math.random; let s=((Math.imul(seed,1103515245)+12345)&0x7fffffff)|1;   // randomKnot берёт зерно из Math.random — подменяем на время вызова
    Math.random=()=>{ s=(Math.imul(s,1103515245)+12345)&0x7fffffff; return s/0x80000000; };
    try{ randomKnot(+m[1]); } finally { Math.random=R; } }
  else H.clickPreset(kn);
  renderDraw();

  // холст прозрачный: кладём его на фон страницы (#draw{background:…var(--bg2)})
  const bg=C2.parseColor(process.env.BG||'#0b1019')||[11,16,25,1];
  // фон страницы под холстом: точки шагом 22 px, как в CSS #draw (DOTS=0 — без них)
  const dots=process.env.DOTS!=='0', dz=(process.env.SCALE|0)||1, dot=[170,190,230], dotA=0.17;
  const bgAt=(x,y)=>{ if(!dots) return bg;
    const gx=((x/dz)%22+22)%22, gy=((y/dz)%22+22)%22, d=Math.hypot(Math.min(gx,22-gx), Math.min(gy,22-gy));
    const a=d<=1? dotA : (d<1.6? dotA*(1.6-d)/0.6 : 0);
    return [bg[0]*(1-a)+dot[0]*a, bg[1]*(1-a)+dot[1]*a, bg[2]*(1-a)+dot[2]*a]; };
  const px=ctx.__pixels(), N=px.width*px.height, PNG=mod('pngjs').PNG, out=new PNG({width:px.width, height:px.height}), D=out.data;
  let any=0, ink=0;
  for(let i=0;i<N;i++){ const k=4*i, a=px.data[k+3]/255;
    const bb=bgAt(k/4%px.width, Math.floor(k/4/px.width));
    for(let c=0;c<3;c++) D[k+c]=px.data[k+c]*a + bb[c]*(1-a);
    D[k+3]=255;
    if(a>0.02) any++;                                       // всё нарисованное, включая точечную сетку
    if(a>0.5) ink++; }                                      // плотный штрих: линия, кольца, стартовый кружок
  const file=path.resolve(process.env.OUT || path.join(process.cwd(),'out','draw2d.png'));
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, PNG.sync.write(out));

  return { ok: ink>0 && (open ? (raw.length>1 && !closedCurve) : (crossings.length>0 && closedCurve)), img:file, knot:kn, scale:sc,
    W:px.width, H:px.height, crossings:crossings.length, det:knotDet, unknot:isUnknot, pending:pendingCount(),
    pixAny:any, pixInk:ink, inkFrac:+(ink/N).toFixed(4), anyFrac:+(any/N).toFixed(4),
    status:H.dbg().status };
})()
