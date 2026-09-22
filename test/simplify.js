// 5.0 (стенд): STIR «SIMPLIFY» — упрощение диаграммы ходами Рейдемейстера в самой программе. Запуск: KNOT_PAGE=index5.html node harness.js simplify.js
// Узел: HK_FILE=out/hard/<name>.json (укладка PD, как в pdknot.js) или KNOT=trefoil|figure8|cinquefoil|septafoil (пресет).
// SP_PRE=<шагов> — физика до Stir (0 — прямо из базового лифта; по умолчанию 3000), SP_ONLY=1 — только упрощение и проверка
// диаграммы (без серии после), UK_STIR — число Stir-попыток (по умолчанию 6), UK_BUD — бюджет шагов на попытку, SP_PNG=<png> — вид 2D
// упрощённой диаграммы (нужен KNOT_CANVAS=canvas2d.js), SP_MODE=open|simplify|branch — техника Stir (сравнение), SP_TRIES — попыток в серии, SP_SEED — зерно, SP_SAVE=<json> — сохранить 3D-форму перед Stir, SP_START=<json> — начать с сохранённой формы (без физики до Stir), SP_KEEP=1 — не восстанавливать диаграмму при неудаче укладки. Критерий окружности — как в pdknot.js/unknot.js.
(async ()=>{ const fs=__require('fs'), path=__require('path'), H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; window.__noAutoThick=true;
  if(process.env.SP_KEEP==='1') window.__simpKeep=true;   // отладка: при неудаче укладки не восстанавливать прежнюю диаграмму (SP_PNG покажет сбойную)
  const out={};
  H.el('clear').onclick(); if(H.running()) H.play();
  H.setSlider('thick',+(process.env.UK_THICK||1)); H.setSlider('repCoef',+(process.env.UK_REP||1)); H.setSlider('bendCoef',+(process.env.UK_BEND||9));
  if(process.env.HK_FILE){
    const J=JSON.parse(fs.readFileSync(process.env.HK_FILE,'utf8')); out.name=J.name;
    const V=J.verts, A=J.arrows, n=A.length, pts=[]; const seg=[]; for(const [i,j] of A) seg.push([V[i], V[j]]);
    for(let k=0;k<n;k++){ const [a,b]=seg[k]; const L=Math.hypot(b[0]-a[0], b[1]-a[1]), m=Math.max(2, Math.round(L/4));
      for(let t=0;t<m;t++) pts.push({x:a[0]+(b[0]-a[0])*t/m, y:a[1]+(b[1]-a[1])*t/m}); }
    _smoothCap=3000; const fitted=fitToCanvas(pts, 0.9, true); raw=fitted; closedCurve=false; drawing=false; finishCurve(true, false);
    const mn=[Math.min(...pts.map(p=>p.x)), Math.min(...pts.map(p=>p.y))], mx=[Math.max(...pts.map(p=>p.x)), Math.max(...pts.map(p=>p.y))];
    const fmn=[Math.min(...fitted.map(p=>p.x)), Math.min(...fitted.map(p=>p.y))], fmx=[Math.max(...fitted.map(p=>p.x)), Math.max(...fitted.map(p=>p.y))];
    const sx=(fmx[0]-fmn[0])/Math.max(1e-9,mx[0]-mn[0]), sy=(fmx[1]-fmn[1])/Math.max(1e-9,mx[1]-mn[1]);
    const map=(p)=>({x:fmn[0]+(p[0]-mn[0])*sx, y:fmn[1]+(p[1]-mn[1])*sy});
    const cum=[0]; for(let k=0;k<n;k++){ const [a,b]=seg[k]; const ma=map(a), mb=map(b); cum.push(cum[k]+Math.hypot(mb.x-ma.x, mb.y-ma.y)); } const total=cum[n];
    const inter=(p1,p2,p3,p4)=>{ const d1x=p2.x-p1.x,d1y=p2.y-p1.y,d2x=p4.x-p3.x,d2y=p4.y-p3.y, den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-9) return null;
      const t=((p3.x-p1.x)*d2y-(p3.y-p1.y)*d2x)/den, u=((p3.x-p1.x)*d1y-(p3.y-p1.y)*d1x)/den; return {x:p1.x+t*d1x, y:p1.y+t*d1y, t, u}; };
    const cyc=(a,b)=>{ const d=Math.abs(a-b)%total; return Math.min(d,total-d); };
    let matched=0; const used=new Set();
    for(const [ua, oa] of J.cross){ const [a1,a2]=seg[ua].map(map), [b1,b2]=seg[oa].map(map); const X=inter(a1,a2,b1,b2); if(!X) continue;
      let best=null, bd=Infinity; for(const c of crossings){ if(used.has(c)) continue; const d=Math.hypot(c.x-X.x, c.y-X.y); if(d<bd){ bd=d; best=c; } }
      if(!best || bd>12) continue; used.add(best); matched++;
      const sOver=cum[oa]+X.u*(cum[oa+1]-cum[oa]); const sA=best.sA/totalLen2D*total, sB=best.sB/totalLen2D*total;
      best.over=(cyc(sA,sOver)<=cyc(sB,sOver))? 'A':'B'; best.pending=false; }
    updateCrossInfo(); updateKnotType(); syncKnot3D();
    out.importOk = crossings.length===J.crossings && matched===J.crossings && pendingCount()===0; if(!out.importOk){ out.ok=false; out.why='import'; return out; }
  } else { const k=process.env.KNOT||'trefoil'; H.clickPreset(k); out.name=k; }
  out.n0=crossings.length; out.det0=knotDet;
  const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/N,y:y/N,z:z/N}; };
  const crossPlane=()=>{ const c=cen(); let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ei=jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]), ord=[0,1,2].sort((i,j)=>ei.vals[j]-ei.vals[i]), e1=Array.from(ei.vecs[ord[0]]), e2=Array.from(ei.vecs[ord[1]]);
    const n=N, X=new Float64Array(n), Y=new Float64Array(n); for(let i=0;i<n;i++){ const v=verts[i]; X[i]=v.x*e1[0]+v.y*e1[1]+v.z*e1[2]; Y[i]=v.x*e2[0]+v.y*e2[1]+v.z*e2[2]; }
    let k=0; for(let i=0;i<n;i++){ const i2=(i+1)%n, ax=X[i], ay=Y[i], bx=X[i2]-ax, by=Y[i2]-ay;
      for(let j=i+2;j<n;j++){ if(i===0 && j===n-1) continue; const j2=(j+1)%n, cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx; if(Math.abs(den)<1e-14) continue;
        const s=((cx-ax)*dy-(cy-ay)*dx)/den, u=((cx-ax)*by-(cy-ay)*bx)/den; if(s>0&&s<1&&u>0&&u<1) k++; } } return k; };
  const roundness=()=>{ const c=cen(); let mn=Infinity, mx=0, sum=0; for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; }
    const R=sum/N; let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-c.x, y=v.y-c.y, z=v.z-c.z; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
    const ev=Array.from(jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]).vals).sort((p,q)=>p-q); return {rad:+((mx-mn)/R).toFixed(4), flat:+(Math.sqrt(Math.max(0,ev[0]))/R).toFixed(4)}; };
  const isCircle=()=>{ const r=roundness(); return r.rad<0.08 && r.flat<0.05 && crossPlane()===0; };
  const png=(f)=>{ try{ renderDraw(); const ctx=H.el('draw').getContext('2d'); const px=ctx.__pixels&&ctx.__pixels(); if(!(px&&px.data)) return null;
    const PNG=__require(path.join(process.cwd(),'node_modules','pngjs')).PNG, o=new PNG({width:px.width,height:px.height});
    for(let i=0;i<px.width*px.height;i++){ const a=px.data[4*i+3]/255; for(let c=0;c<3;c++) o.data[4*i+c]=px.data[4*i+c]*a+255*(1-a); o.data[4*i+3]=255; }
    fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f, PNG.sync.write(o)); return f; }catch(e){ return 'err: '+String(e).slice(0,80); } };
  const PRE=+(process.env.SP_PRE||3000), NSTIR=+(process.env.UK_STIR||6), BUD=+(process.env.UK_BUD||30000);
  H.set({ms:1}); const t0=Date.now();
  if(process.env.SP_START){ const S0=JSON.parse(fs.readFileSync(process.env.SP_START,'utf8')); _setVertsFrom(S0.verts.map(v=>new THREE.Vector3(v[0],v[1],v[2]))); recenter(); _fromLift=true; _liftFromDiagram=false; out.startedFrom=process.env.SP_START; }   // 3D-форма до Stir из файла (SP_SAVE прежнего прогона) — воспроизводимость
  else if(PRE>0){ H.play(); let st=0; while(true){ const o=H.step(200); st+=200; if(!o.running || st>=PRE) break; } if(H.running()) H.play(); out.preSteps=st; }
  if(process.env.SP_SAVE){ fs.mkdirSync(path.dirname(process.env.SP_SAVE),{recursive:true}); fs.writeFileSync(process.env.SP_SAVE, JSON.stringify({name:out.name, N, verts:verts.map(v=>[+v.x.toFixed(5),+v.y.toFixed(5),+v.z.toFixed(5)])})); out.saved=process.env.SP_SAVE; }
  if(process.env.SP_SEED) _stirSeed=+process.env.SP_SEED;
  const MODE=process.env.SP_MODE||'simplify'; window.__stirMode(MODE); out.stirMode=STIR_MODE; H.set({ms:+(process.env.SP_TRIES||1)});   // SP_MODE=open|simplify|branch — сравнение техник; SP_TRIES — попыток в серии после Stir
  out.stirs=[]; let done=isCircle();
  for(let attempt=0; attempt<NSTIR && !done; attempt++){
    if(!window.__knotStir()){ out.stirs.push({at:attempt, started:false}); break; }
    const d=_dbgStir||{}; if(d.ok===undefined) d.ok=!d.tooTight; if(d.tooTight) d.why='too tight'; const rec={at:attempt, ok:d.ok, why:d.why, branch:d.branch? d.branch.M : undefined, n0:d.n0, n1:d.n1, src:d.src, n0src:d.n0src, r3:d.r3, ms:d.ms, nc:crossings.length, det:knotDet, running:H.running()};
    if(attempt===0 && process.env.SP_PNG) rec.png=png(process.env.SP_PNG);
    if(process.env.UK_VERBOSE==='1') console.error(JSON.stringify(rec));
    if(!d.ok){ out.stirs.push(rec); if(process.env.SP_ONLY==='1') break; if(H.running()) H.play(); continue; }   // как пользователь: неудача — нажать Stir ещё раз (другое зерно)
    if(process.env.SP_ONLY==='1'){ out.stirs.push(rec); break; }
    let st=0, o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUD*(+(process.env.SP_TRIES||1))) break; }
    const r=roundness(); Object.assign(rec, {steps:st, E:_msBest? +(+_msBest.E).toPrecision(4) : null, settled:!o.running, rad:r.rad, flat:r.flat, cross:crossPlane(), det3d:_detRobust(3)}); out.stirs.push(rec);
    if(process.env.UK_VERBOSE==='1') console.error(JSON.stringify(rec));
    if(r.rad<0.08 && r.flat<0.05 && rec.cross===0){ done=true; break; }
    if(H.running()) H.play(); }
  out.n1=crossings.length; out.det1=knotDet; out.detKept=(out.det1===out.det0);
  out.circle=done; out.sec=+((Date.now()-t0)/1000).toFixed(1);
  out.stirFails=out.stirs.filter(s=>s.ok===false).length;
  out.ok = out.detKept && out.stirs.length>0 && (process.env.SP_ONLY==='1' ? out.stirs.every(s=>s.ok!==false) : (out.det0!==1 || done));
  return out; })()
