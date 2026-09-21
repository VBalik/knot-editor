// 4.13: ГИПОТЕЗА НА РИСУНКЕ. Картинка с диска (IK_IMG) → распознавание тем же путём, что кнопка Upload → проверка,
// что диаграмма импортирована как одна кривая с det = 1 (тривиальный узел из литературы) → Physics, при неудаче
// Stir до UK_STIR раз → окружность? Критерий и счётчики — как в unknot.js. Параметры: IK_IMG, UK_STIR (10),
// UK_BUD (30000 шагов на попытку), UK_THICK/UK_REP/UK_BEND (ползунки, физические значения), UK_VERBOSE=1,
// HK_SAVE=<json> — конечные 3D-точки, HK_PROJ=<png> — проекция конечной 3D-формы (proj3d.js), HK_PDONLY=1 — только импорт и PD-код
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n));
  const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; window.__noAutoThick=true;
  const src=process.env.IK_IMG; if(!src) throw new Error('set IK_IMG=<image .png|.jpg>');
  const NSTIR=+(process.env.UK_STIR||10), BUD=+(process.env.UK_BUD||30000), VERB=process.env.UK_VERBOSE==='1';
  let _s=7; const rnd=()=>{ _s=(Math.imul(_s,1103515245)+12345)&0x7fffffff; return _s/0x7fffffff; };
  const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/N,y:y/N,z:z/N}; };
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
        const cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx; if(Math.abs(den)<1e-14) continue;
        const s=((cx-ax1)*dy-(cy-ay1)*dx)/den, u=((cx-ax1)*by-(cy-ay1)*bx)/den; if(s>0 && s<1 && u>0 && u<1) c++; } }
    return c; }
  function roundness(){ const c=cen(); let mn=Infinity, mx=0, sum=0;
    for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; }
    const R=sum/N; let a=0,b=0,d=0,e=0,f=0,g=0;
    for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ev=Array.from(jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]).vals).sort((p,q)=>p-q);
    return {R:+R.toFixed(3), rad:+((mx-mn)/R).toFixed(4), flat:+(Math.sqrt(Math.max(0,ev[0]))/R).toFixed(4)}; }
  const isCircle=()=>{ const q=roundness(); return q.rad<0.08 && q.flat<0.05 && crossings3D()===0; };   // 4.16: и ни одного пересечения в проекции — тугая двойная катушка обманывает разброс и плоскость
  // --- картинка, как в imgphoto.js
  const buf=fs.readFileSync(src), ext=path.extname(src).toLowerCase(); let img;
  if(ext==='.jpg'||ext==='.jpeg'){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
  else { const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
  const w0=img.width, h0=img.height, sc=Math.min(1, 1600/Math.max(w0,h0)), W=Math.max(8, Math.round(w0*sc)), Hh=Math.max(8, Math.round(h0*sc));
  let data=img.data;
  if(W!==w0 || Hh!==h0){ const d=new Uint8ClampedArray(W*Hh*4), fx=w0/W, fy=h0/Hh;
    for(let y=0;y<Hh;y++){ const ya=y*fy, yb=(y+1)*fy, y0=Math.floor(ya), y1=Math.min(h0, Math.ceil(yb));
      for(let x=0;x<W;x++){ const xa=x*fx, xb=(x+1)*fx, x0=Math.floor(xa), x1=Math.min(w0, Math.ceil(xb)); let r=0,g=0,b=0,a=0,s=0;
        for(let yy=y0; yy<y1; yy++){ const wy=Math.min(yy+1,yb)-Math.max(yy,ya); if(wy<=0) continue;
          for(let xx=x0; xx<x1; xx++){ const wx=Math.min(xx+1,xb)-Math.max(xx,xa); if(wx<=0) continue; const w=wx*wy, k=4*(yy*w0+xx); r+=img.data[k]*w; g+=img.data[k+1]*w; b+=img.data[k+2]*w; a+=img.data[k+3]*w; s+=w; } }
        const o=4*(y*W+x); d[o]=r/s; d[o+1]=g/s; d[o+2]=b/s; d[o+3]=a/s; } } data=d; }
  H.el('clear').onclick(); if(H.running()) H.play();
  H.setSlider('thick',+(process.env.UK_THICK||1)); H.setSlider('repCoef',+(process.env.UK_REP||1)); H.setSlider('bendCoef',+(process.env.UK_BEND||9));
  const t0=Date.now(), res=ikRecognize({width:W, height:Hh, data}), ap=ikApply(res);
  const rec={file:path.basename(src), nc:crossings.length, det2d:knotDet, comps:res.notes&&res.notes.comps, pending:pendingCount(), importOk:!!(ap&&ap.ok) && knotDet===1 && (res.notes? res.notes.comps===1 : true) && pendingCount()===0, tries:[]};
  if(!rec.importOk){ rec.ok=false; rec.err='import not exact (need one curve, det 1, no pending crossings)'; return rec; }
  rec.pd=__require(path.join(process.cwd(),'pdcode.js'))(crossings);  if(process.env.HK_DUMP){ fs.writeFileSync(process.env.HK_DUMP, JSON.stringify({total:totalLen2D, pts:smooth.map(p=>[+p.x.toFixed(2),+p.y.toFixed(2)]), cross:crossings.map(c=>({x:+c.x.toFixed(2),y:+c.y.toFixed(2),sA:+c.sA.toFixed(2),sB:+c.sB.toFixed(2),over:c.over}))})); }   // HK_DUMP=<json>: кривая и пересечения для внешней отрисовки (blackink.py)
   // PD-код импортированной диаграммы (сертификация в Regina, hardreport.py)
  if(process.env.HK_PDONLY==='1'){ rec.ok=null; return rec; }   // только импорт и PD-код, без физики
  H.set({ms:1}); H.play();
  let done=false;
  for(let attempt=0; attempt<=NSTIR; attempt++){
    let st=0, o=null, tP=Date.now();
    while(true){ o=H.step(200); st+=200; if(VERB && st%5000===0) console.error('  try', attempt, 'step', st, +((Date.now()-tP)/st).toFixed(1)+'ms/st', 'cross', crossings3D()); if(!o.running || st>=BUD) break; }
    const r=roundness(); rec.tries.push({at:attempt, steps:st, settled:!o.running, cross:crossings3D(), rad:r.rad, flat:r.flat, det3d:_detRobust(3)});
    if(VERB) console.error(JSON.stringify(rec.tries[rec.tries.length-1]));
    if(isCircle()){ done=true; break; }
    if(attempt===NSTIR) break;
    if(H.running()) H.play(); if(!window.__knotStir()) break; while(_stir) window.__knotStir(); }
  rec.ok=done; rec.N=N; rec.det3dEnd=_detRobust(3); rec.sec=+((Date.now()-t0)/1000).toFixed(1);
  if(process.env.HK_SAVE){ fs.mkdirSync(path.dirname(process.env.HK_SAVE),{recursive:true}); fs.writeFileSync(process.env.HK_SAVE, JSON.stringify({name:rec.file, N, verts:verts.map(v=>[+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)])})); rec.saved=process.env.HK_SAVE; }
  if(process.env.HK_PROJ){ try{ rec.proj=__require(path.join(process.cwd(),'proj3d.js'))(verts, jacobiEig, process.env.HK_PROJ, +(process.env.HK_PROJ_W||480)); }catch(e){ rec.projErr=String(e).slice(0,120); } }
  return rec; })()
