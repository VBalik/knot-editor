// 4.1: предпросмотр 2D-диаграммы для облачной сессии (браузера нет).
// Запуск: KNOT_CANVAS=canvas2d.js node harness.js draw2d.js
//   KNOT=trefoil|figure8|cinquefoil|septafoil — пресет; KNOT=rN — randomKnot(N) с фиксированным зерном (SEED);
//   KNOT=open — незамкнутая кривая под пером (виден пунктирный стартовый кружок с тенью)
//   KNOT=img IK_IMG=<файл> — диаграмма, распознанная с картинки (тот же путь, что кнопка Upload): рисунок от руки со всеми его дрожаниями
//   FLIP=<n,m,…> — после загрузки переключить проход у пересечений с этими номерами (проверка артефактов после клика)
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
  else if(/^img$/i.test(kn)){ const src=process.env.IK_IMG; if(!src) throw new Error('KNOT=img требует IK_IMG=<файл>');
    const buf=fs.readFileSync(src); let img;
    if(/\.jpe?g$/i.test(src)){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
    else { const pn=mod('pngjs').PNG.sync.read(buf); img={width:pn.width, height:pn.height, data:pn.data}; }
    const w0=img.width, h0=img.height, k=Math.min(1,1600/Math.max(w0,h0));   // как ikLoadFile: длинная сторона ≤1600
    if(k<1){ const W1=Math.round(w0*k), H1=Math.round(h0*k), d=new Uint8ClampedArray(W1*H1*4), fx=w0/W1, fy=h0/H1;
      for(let y=0;y<H1;y++){ const ya=y*fy, yb=(y+1)*fy, y0=Math.floor(ya), y1=Math.min(h0,Math.ceil(yb));
        for(let x=0;x<W1;x++){ const xa=x*fx, xb=(x+1)*fx, x0=Math.floor(xa), x1=Math.min(w0,Math.ceil(xb)); let r=0,g=0,b=0,a=0,sw=0;
          for(let yy=y0;yy<y1;yy++){ const wy=Math.min(yy+1,yb)-Math.max(yy,ya); if(wy<=0) continue;
            for(let xx=x0;xx<x1;xx++){ const wx=Math.min(xx+1,xb)-Math.max(xx,xa); if(wx<=0) continue; const ww=wx*wy, kk=4*(yy*w0+xx); r+=img.data[kk]*ww; g+=img.data[kk+1]*ww; b+=img.data[kk+2]*ww; a+=img.data[kk+3]*ww; sw+=ww; } }
          const o=4*(y*W1+x); d[o]=r/sw; d[o+1]=g/sw; d[o+2]=b/sw; d[o+3]=a/sw; } }
      img={width:W1, height:H1, data:d}; }
    ikApply(ikRecognize(img)); }
  else H.clickPreset(kn);
  if(process.env.FLIP) for(const n of process.env.FLIP.split(',')){ const c=crossings[(+n|0)%Math.max(1,crossings.length)]; if(c){ c.over=c.over==='A'?'B':'A'; c.pending=false; } }
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
