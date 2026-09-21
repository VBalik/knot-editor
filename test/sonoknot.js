// 4.14 (стенд): SONO (Pieranski) поверх лифта программы: HK_FILE=<json>, SN_* — параметры, HK_SAVE/HK_PROJ, UK_VERBOSE=1
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
  if(!out.importOk) return out;
  // ---------------- SONO (Pieranski, Shrink-On-No-Overlaps) поверх лифта программы ----------------
  // Толщина D растёт (эквивалент укорачивания верёвки при фиксированной длине), перекрытия вершин чужих прядей (дуга > 1.2·D)
  // расталкиваются позиционно, длины рёбер восстанавливаются проекцией. Тривиальный узел при максимальной толщине — окружность.
  // SN_EPS — рост D за итерацию (0.003), SN_K — проходов расталкивания (25), SN_MAX — итераций (20000), SN_STALL — стоп после
  // подряд неудач (200), SN_SHAKE — доля L0 случайной тряски (0.02)
  H.set({ms:1}); H.play(); H.step(1); if(H.running()) H.play();   // лифт построен, физика остановлена
  const EPS=+(process.env.SN_EPS||0.003), K=+(process.env.SN_K||25), MAXIT=+(process.env.SN_MAX||20000), STALL=+(process.env.SN_STALL||200), SHAKE=+(process.env.SN_SHAKE||0.02);
  const nV=N; let _s=11; const rnd=()=>{ _s=(Math.imul(_s,1103515245)+12345)&0x7fffffff; return _s/0x7fffffff; };
  const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/nV,y:y/nV,z:z/nV}; };
  const crossPlane=()=>{ const c=cen(); let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ei=jacobiEig([[a/nV,b/nV,d/nV],[b/nV,e/nV,f/nV],[d/nV,f/nV,g/nV]]), ord=[0,1,2].sort((i,j)=>ei.vals[j]-ei.vals[i]), e1=Array.from(ei.vecs[ord[0]]), e2=Array.from(ei.vecs[ord[1]]);
    const n=nV, X=new Float64Array(n), Y=new Float64Array(n); for(let i=0;i<n;i++){ const v=verts[i]; X[i]=v.x*e1[0]+v.y*e1[1]+v.z*e1[2]; Y[i]=v.x*e2[0]+v.y*e2[1]+v.z*e2[2]; }
    let k=0; for(let i=0;i<n;i++){ const i2=(i+1)%n, ax=X[i], ay=Y[i], bx=X[i2]-ax, by=Y[i2]-ay;
      for(let j=i+2;j<n;j++){ if(i===0 && j===n-1) continue; const j2=(j+1)%n, cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx; if(Math.abs(den)<1e-14) continue;
        const s=((cx-ax)*dy-(cy-ay)*dx)/den, u=((cx-ax)*by-(cy-ay)*bx)/den; if(s>0&&s<1&&u>0&&u<1) k++; } } return k; };   // 4.16: пересечения в проекции на плоскость узла (окружность — 0)
  const roundness=()=>{ const c=cen(); let mn=Infinity, mx=0, sum=0; for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; }
    const R=sum/nV; let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ev=Array.from(jacobiEig([[a/nV,b/nV,d/nV],[b/nV,e/nV,f/nV],[d/nV,f/nV,g/nV]]).vals).sort((p,q)=>p-q); return {rad:+((mx-mn)/R).toFixed(4), flat:+(Math.sqrt(Math.max(0,ev[0]))/R).toFixed(4), R:+(R/L0).toFixed(1)}; };
  // ПРОХОД SONO на аппарате программы: пары ОТРЕЗКОВ чужих прядей ближе D (арк-фильтр энергии), зазоры каждого отрезка,
  // сертификат как в Stir — полный сдвиг вершины меньше половины её зазора до шага (топология неизменна)
  const gapV=new Float64Array(nV), ax=new Float64Array(nV), ay=new Float64Array(nV), az=new Float64Array(nV);
  const MV=0.3*L0;
  const pass=(D)=>{ _inflate=D/sNominal(); _closeCollect=[]; _closeThr=D; _segGap=new Float64Array(nV).fill(Infinity);
    energyGrad(false); const close=_closeCollect, seg=_segGap; _closeCollect=null; _segGap=null; _inflate=1;
    for(let i=0;i<nV;i++) gapV[i]=Math.min(seg[(i-1+nV)%nV], seg[i]);
    ax.fill(0); ay.fill(0); az.fill(0); let worst=0, npairs=0;
    for(let c=0;c<close.length;c+=8){ const i=close[c], j=close[c+1], si=close[c+2], tj=close[c+3], x=close[c+7]; if(!(x>1e-12) || x>=D) continue;
      const ip=(i+1)%nV, jp=(j+1)%nV, h=0.5*(D-x)/x, ex=close[c+4]*h, ey=close[c+5]*h, ez=close[c+6]*h; npairs++; if(D-x>worst) worst=D-x;   // n̂ — от j к i
      ax[i]+=ex*(1-si); ay[i]+=ey*(1-si); az[i]+=ez*(1-si); ax[ip]+=ex*si; ay[ip]+=ey*si; az[ip]+=ez*si;
      ax[j]-=ex*(1-tj); ay[j]-=ey*(1-tj); az[j]-=ez*(1-tj); ax[jp]-=ex*tj; ay[jp]-=ey*tj; az[jp]-=ez*tj; }
    const x0=verts.map(v=>v.clone()); let k=1, ok=false;
    for(let tr=0; tr<3 && !ok; tr++){
      for(let i=0;i<nV;i++){ let dx=ax[i]+SHAKE*L0*(rnd()-0.5), dy=ay[i]+SHAKE*L0*(rnd()-0.5), dz=az[i]+SHAKE*L0*(rnd()-0.5); const d=Math.hypot(dx,dy,dz), lim=k*Math.min(MV, 0.4*gapV[i]);
        if(d>lim && d>1e-300){ const q=lim/d; dx*=q; dy*=q; dz*=q; } verts[i].x=x0[i].x+dx; verts[i].y=x0[i].y+dy; verts[i].z=x0[i].z+dz; }
      projectLengthsSafe(20); ok=true;
      for(let i=0;i<nV;i++){ if(!(verts[i].distanceTo(x0[i])<0.5*gapV[i])){ ok=false; break; } }
      if(!ok){ for(let i=0;i<nV;i++) verts[i].copy(x0[i]); k*=0.35; } }
    return {worst, npairs, ok}; };
  let D=0.98*minSegGapRep(); const Dcap=1.1*nV*L0/Math.PI;
  const det0=_detRobust(3); const t0=Date.now(); let stall=0, it=0, rejected=0; const log=[]; out.sono={D0_L0:+(D/L0).toFixed(3), det0};
  for(it=0; it<MAXIT; it++){
    let r0=null;
    for(let k=0;k<K;k++){ r0=pass(D); if(!r0.ok) rejected++; if(r0.worst<2e-3*D) break; }
    if(r0.worst<0.01*D){ D*=1+EPS; stall=0; } else { stall++; if(stall>=STALL) break; }   // толщина растёт только когда перекрытия сняты
    if(D>Dcap) break;
    if(it%100===0){ const r=roundness(); const rec={it, D_L0:+(D/L0).toFixed(3), worst_D:+(r0.worst/D).toFixed(3), pairs:r0.npairs, stall, rejected, ...r, det:_detRobust(3), sec:+((Date.now()-t0)/1000).toFixed(0)}; log.push(rec); if(process.env.UK_VERBOSE==='1') console.error(J.name, JSON.stringify(rec)); if(r.rad<0.08 && r.flat<0.05) break; }
  }
  recenter();
  if(process.env.SN_POLISH==='1'){ _inflate=1; _energyDirty=true; _ePrev=-1; H.play(); let st=0, o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=+(process.env.UK_BUD||30000)) break; } if(H.running()) H.play(); out.polishSteps=st; }   // доводка обычной физикой
  const r=roundness(); out.sono=Object.assign(out.sono, {iters:it, rejected, D_L0:+(D/L0).toFixed(2), det3d:_detRobust(3), ...r, sec:+((Date.now()-t0)/1000).toFixed(0), log});
  out.cross=crossPlane(); out.ok=r.rad<0.08 && r.flat<0.05 && out.cross===0; out.N=N;
  if(process.env.HK_SAVE){ fs.writeFileSync(process.env.HK_SAVE, JSON.stringify({name:J.name, N, verts:verts.map(v=>[+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)])})); }
  if(process.env.HK_PROJ){ try{ out.proj=__require(path.join(process.cwd(),'proj3d.js'))(verts, jacobiEig, process.env.HK_PROJ, 480); }catch(e){ out.projErr=String(e).slice(0,120); } }
  return out; })()
