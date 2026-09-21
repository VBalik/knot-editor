// 4.14 (стенд): ТРУДНЫЕ ТРИВИАЛЬНЫЕ УЗЛЫ ИЗ ЛИТЕРАТУРЫ. Диаграмма берётся из out/hard/<name>.json (pd2plink.py: Regina +
// spherogram), строится в программе как замкнутая ломаная с проходами из PD-кода — без распознавания картинки.
// HK_FILE=<json> [HK_RUN=1 — Physics и Stir до UK_STIR раз, критерий окружности как в unknot.js] [HK_PNG=<файл> — вид 2D
// (нужен KNOT_CANVAS=canvas2d.js)] [HK_SAVE=<json> — конечные 3D-точки] [HK_PROJ=<png> — проекция конечной 3D-формы] [UK_BUD, UK_STIR, UK_THICK/UK_REP/UK_BEND, UK_VERBOSE=1]
(async ()=>{ const fs=__require('fs'), path=__require('path'), H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; window.__noAutoThick=true;
  const file=process.env.HK_FILE; if(!file) throw new Error('set HK_FILE=out/hard/<name>.json');
  const J=JSON.parse(fs.readFileSync(file,'utf8'));
  // --- ломаная вдоль цепочки стрелок; углы ортогональной укладки чуть скругляем промежуточными точками, чтобы сплайн не срезал их
  const V=J.verts, A=J.arrows, n=A.length, pts=[];
  const seg=[]; for(const [i,j] of A) seg.push([V[i], V[j]]);
  for(let k=0;k<n;k++){ const [a,b]=seg[k]; const L=Math.hypot(b[0]-a[0], b[1]-a[1]), m=Math.max(2, Math.round(L/4));
    for(let t=0;t<m;t++) pts.push({x:a[0]+(b[0]-a[0])*t/m, y:a[1]+(b[1]-a[1])*t/m}); }
  if(process.env.HK_ANN) window.__ann=JSON.parse(process.env.HK_ANN);   // лаборатория отжига (см. annApply в index.html)
  H.el('clear').onclick(); if(H.running()) H.play();
  H.setSlider('thick',+(process.env.UK_THICK||1)); H.setSlider('repCoef',+(process.env.UK_REP||1)); H.setSlider('bendCoef',+(process.env.UK_BEND||9));
  _smoothCap=3000;
  const fitted=fitToCanvas(pts, 0.9, true);              // те же коэффициенты, что у pts → нужна карта исходных → холст: считаем аффинно по двум точкам
  raw=fitted; closedCurve=false; drawing=false; finishCurve(true, false);
  // аффинная карта из координат укладки в холст (fitToCanvas — масштаб+сдвиг): по крайним точкам
  const mn=[Math.min(...pts.map(p=>p.x)), Math.min(...pts.map(p=>p.y))], mx=[Math.max(...pts.map(p=>p.x)), Math.max(...pts.map(p=>p.y))];
  const fmn=[Math.min(...fitted.map(p=>p.x)), Math.min(...fitted.map(p=>p.y))], fmx=[Math.max(...fitted.map(p=>p.x)), Math.max(...fitted.map(p=>p.y))];
  const sx=(fmx[0]-fmn[0])/Math.max(1e-9,mx[0]-mn[0]), sy=(fmx[1]-fmn[1])/Math.max(1e-9,mx[1]-mn[1]);
  const map=(p)=>({x:fmn[0]+(p[0]-mn[0])*sx, y:fmn[1]+(p[1]-mn[1])*sy});
  // дуговая позиция начала каждой стрелки вдоль ломаной (в единицах холста) — чтобы понять, какая прядь программы = стрелка «над»
  const cum=[0]; for(let k=0;k<n;k++){ const [a,b]=seg[k]; const ma=map(a), mb=map(b); cum.push(cum[k]+Math.hypot(mb.x-ma.x, mb.y-ma.y)); }
  const total=cum[n];
  const inter=(p1,p2,p3,p4)=>{ const d1x=p2.x-p1.x,d1y=p2.y-p1.y,d2x=p4.x-p3.x,d2y=p4.y-p3.y, den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-9) return null;
    const t=((p3.x-p1.x)*d2y-(p3.y-p1.y)*d2x)/den, u=((p3.x-p1.x)*d1y-(p3.y-p1.y)*d1x)/den; return {x:p1.x+t*d1x, y:p1.y+t*d1y, t, u}; };
  const cyc=(a,b)=>{ const d=Math.abs(a-b)%total; return Math.min(d,total-d); };
  let matched=0, dmax=0, unmatched=[];
  const used=new Set();
  for(const [ua, oa] of J.cross){ const [a1,a2]=seg[ua].map(map), [b1,b2]=seg[oa].map(map); const X=inter(a1,a2,b1,b2); if(!X){ unmatched.push([ua,oa,'parallel']); continue; }
    let best=null, bd=Infinity; for(const c of crossings){ if(used.has(c)) continue; const d=Math.hypot(c.x-X.x, c.y-X.y); if(d<bd){ bd=d; best=c; } }
    if(!best || bd>12){ unmatched.push([ua,oa,+bd.toFixed(1)]); continue; }
    used.add(best); matched++; dmax=Math.max(dmax,bd);
    const sOver=cum[oa]+X.u*(cum[oa+1]-cum[oa]);           // дуговая позиция точки на стрелке «над» (ломаная программы идёт в том же порядке и масштабе)
    const sA=best.sA/totalLen2D*total, sB=best.sB/totalLen2D*total;
    best.over=(cyc(sA,sOver)<=cyc(sB,sOver))? 'A':'B'; best.pending=false; }
  updateCrossInfo(); updateKnotType();
  if(process.env.HK_DUMP){ fs.writeFileSync(process.env.HK_DUMP, JSON.stringify({total:totalLen2D, pts:smooth.map(p=>[+p.x.toFixed(2),+p.y.toFixed(2)]), cross:crossings.map(c=>({x:+c.x.toFixed(2),y:+c.y.toFixed(2),sA:+c.sA.toFixed(2),sB:+c.sB.toFixed(2),over:c.over}))})); }   // HK_DUMP=<json>: кривая и пересечения для внешней отрисовки (blackink.py)
  const pdProgram=__require(path.join(process.cwd(),'pdcode.js'))(crossings);   // PD-код, каким его видит программа (для сверки с исходным в Regina)
  const out={name:J.name, pdProgram, expectCrossings:J.crossings, nc:crossings.length, matched, unmatched, dmaxPx:+dmax.toFixed(2), det:knotDet, isUnknot, pending:pendingCount()};
  out.importOk = crossings.length===J.crossings && matched===J.crossings && pendingCount()===0;
  if(process.env.HK_PNG && typeof KNOT_CANVAS_OK!=='undefined' || process.env.HK_PNG){ try{ renderDraw(); const ctx=H.el('draw').getContext('2d'); const px=ctx.__pixels&&ctx.__pixels();
      if(px&&px.data){ const PNG=__require(path.join(process.cwd(),'node_modules','pngjs')).PNG, o=new PNG({width:px.width,height:px.height});
        for(let i=0;i<px.width*px.height;i++){ const a=px.data[4*i+3]/255; for(let c=0;c<3;c++) o.data[4*i+c]=px.data[4*i+c]*a+255*(1-a); o.data[4*i+3]=255; }
        fs.mkdirSync(path.dirname(process.env.HK_PNG),{recursive:true}); fs.writeFileSync(process.env.HK_PNG, PNG.sync.write(o)); out.png=process.env.HK_PNG; } }catch(e){ out.pngErr=String(e).slice(0,80); } }
  if(process.env.HK_RUN==='1' && out.importOk){
    const NSTIR=+(process.env.UK_STIR||10), BUD=+(process.env.UK_BUD||30000), VERB=process.env.UK_VERBOSE==='1';
    let _s=7; const rnd=()=>{ _s=(Math.imul(_s,1103515245)+12345)&0x7fffffff; return _s/0x7fffffff; };
    const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/N,y:y/N,z:z/N}; };
  const crossPlane=()=>{ const c=cen(); let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ei=jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]), ord=[0,1,2].sort((i,j)=>ei.vals[j]-ei.vals[i]), e1=Array.from(ei.vecs[ord[0]]), e2=Array.from(ei.vecs[ord[1]]);
    const n=N, X=new Float64Array(n), Y=new Float64Array(n); for(let i=0;i<n;i++){ const v=verts[i]; X[i]=v.x*e1[0]+v.y*e1[1]+v.z*e1[2]; Y[i]=v.x*e2[0]+v.y*e2[1]+v.z*e2[2]; }
    let k=0; for(let i=0;i<n;i++){ const i2=(i+1)%n, ax=X[i], ay=Y[i], bx=X[i2]-ax, by=Y[i2]-ay;
      for(let j=i+2;j<n;j++){ if(i===0 && j===n-1) continue; const j2=(j+1)%n, cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx; if(Math.abs(den)<1e-14) continue;
        const s=((cx-ax)*dy-(cy-ay)*dx)/den, u=((cx-ax)*by-(cy-ay)*bx)/den; if(s>0&&s<1&&u>0&&u<1) k++; } } return k; };   // 4.16: пересечения в проекции на плоскость узла (окружность — 0)
    const roundness=()=>{ const c=cen(); let mn=Infinity, mx=0, sum=0; for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; }
      const R=sum/N; let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
      const ev=Array.from(jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]).vals).sort((p,q)=>p-q); return {rad:+((mx-mn)/R).toFixed(4), flat:+(Math.sqrt(Math.max(0,ev[0]))/R).toFixed(4), E:isFinite(_ePrev)? +(+_ePrev).toPrecision(4) : null}; };
    if(process.env.HK_START){ H.play(); if(H.running()) H.play(); const S0=JSON.parse(fs.readFileSync(process.env.HK_START,'utf8'));   // продолжить с сохранённой 3D-формы (HK_SAVE прежнего прогона)
      _setVertsFrom(S0.verts.map(v=>new THREE.Vector3(v[0],v[1],v[2]))); recenter(); _fromLift=true; _liftFromDiagram=false; out.startedFrom=process.env.HK_START; }
    const t0=Date.now(); H.set({ms:1}); H.play(); out.tries=[]; let done=false; out.liftCheck=(typeof _liftCheck!=='undefined')? _liftCheck : null;   // 4.20: проверка лифта (mult, N, пересечения проекции, det)
    for(let attempt=0; attempt<=NSTIR; attempt++){
      let st=0, o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUD) break; }
      const r=roundness(); out.tries.push({at:attempt, steps:st, settled:!o.running, rad:r.rad, flat:r.flat, E:r.E, det3d:_detRobust(3)});
      if(VERB) console.error(J.name, JSON.stringify(out.tries[out.tries.length-1]));
      out.tries[out.tries.length-1].cross=crossPlane();
      if(r.rad<0.08 && r.flat<0.05 && out.tries[out.tries.length-1].cross===0){ done=true; break; }
      if(attempt===NSTIR) break; if(H.running()) H.play(); if(!window.__knotStir()) break; while(_stir) window.__knotStir(); }
    out.ok=done; out.N=N; out.det3dEnd=_detRobust(3); out.sec=+((Date.now()-t0)/1000).toFixed(1);
    if(process.env.HK_SAVE){ fs.mkdirSync(path.dirname(process.env.HK_SAVE),{recursive:true}); fs.writeFileSync(process.env.HK_SAVE, JSON.stringify({name:J.name, N, verts:verts.map(v=>[+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)])})); out.saved=process.env.HK_SAVE; }
    if(process.env.HK_PROJ){ try{ out.proj=__require(path.join(process.cwd(),'proj3d.js'))(verts, jacobiEig, process.env.HK_PROJ, +(process.env.HK_PROJ_W||480)); }catch(e){ out.projErr=String(e).slice(0,120); } } }
  return out; })()
