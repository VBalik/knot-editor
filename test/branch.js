// 5.1 (стенд): STIR «BRANCH» — новая серия от M лучших форм прошлой серии. Запуск: KNOT_PAGE=index5.html node harness.js branch.js
// KNOT=<пресет> (по умолчанию figure8) или HK_FILE=out/hard/<name>.json; BR_TRIES — попыток в серии (3), BR_ROUNDS — сколько раз
// ветвить (1), UK_BUD — бюджет шагов на попытку, UK_VERBOSE=1. Проверяет: серия после ветвления стартует от M разных форм
// (_msLifts), det сохранён, попытки доходят до конца; для тривиального узла — дошёл ли до окружности.
(async ()=>{ const fs=__require('fs'), H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; window.__noAutoThick=true;
  const out={}; H.el('clear').onclick(); if(H.running()) H.play();
  H.setSlider('thick',+(process.env.UK_THICK||1)); H.setSlider('repCoef',+(process.env.UK_REP||1)); H.setSlider('bendCoef',+(process.env.UK_BEND||9));
  if(process.env.HK_FILE){ const J=JSON.parse(fs.readFileSync(process.env.HK_FILE,'utf8')); out.name=J.name;
    const V=J.verts, A=J.arrows, n=A.length, pts=[]; const seg=[]; for(const [i,j] of A) seg.push([V[i], V[j]]);
    for(let k=0;k<n;k++){ const [a,b]=seg[k]; const L=Math.hypot(b[0]-a[0], b[1]-a[1]), m=Math.max(2, Math.round(L/4)); for(let t=0;t<m;t++) pts.push({x:a[0]+(b[0]-a[0])*t/m, y:a[1]+(b[1]-a[1])*t/m}); }
    _smoothCap=3000; const fitted=fitToCanvas(pts, 0.9, true); raw=fitted; closedCurve=false; drawing=false; finishCurve(true, false);
    const mn=[Math.min(...pts.map(p=>p.x)), Math.min(...pts.map(p=>p.y))], mx=[Math.max(...pts.map(p=>p.x)), Math.max(...pts.map(p=>p.y))];
    const fmn=[Math.min(...fitted.map(p=>p.x)), Math.min(...fitted.map(p=>p.y))], fmx=[Math.max(...fitted.map(p=>p.x)), Math.max(...fitted.map(p=>p.y))];
    const sx=(fmx[0]-fmn[0])/Math.max(1e-9,mx[0]-mn[0]), sy=(fmx[1]-fmn[1])/Math.max(1e-9,mx[1]-mn[1]); const map=(p)=>({x:fmn[0]+(p[0]-mn[0])*sx, y:fmn[1]+(p[1]-mn[1])*sy});
    const cum=[0]; for(let k=0;k<n;k++){ const [a,b]=seg[k]; const ma=map(a), mb=map(b); cum.push(cum[k]+Math.hypot(mb.x-ma.x, mb.y-ma.y)); } const total=cum[n];
    const inter=(p1,p2,p3,p4)=>{ const d1x=p2.x-p1.x,d1y=p2.y-p1.y,d2x=p4.x-p3.x,d2y=p4.y-p3.y, den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-9) return null; const t=((p3.x-p1.x)*d2y-(p3.y-p1.y)*d2x)/den, u=((p3.x-p1.x)*d1y-(p3.y-p1.y)*d1x)/den; return {x:p1.x+t*d1x, y:p1.y+t*d1y, t, u}; };
    const cyc=(a,b)=>{ const d=Math.abs(a-b)%total; return Math.min(d,total-d); }; const used=new Set(); let matched=0;
    for(const [ua, oa] of J.cross){ const [a1,a2]=seg[ua].map(map), [b1,b2]=seg[oa].map(map); const X=inter(a1,a2,b1,b2); if(!X) continue; let best=null, bd=Infinity; for(const c of crossings){ if(used.has(c)) continue; const d=Math.hypot(c.x-X.x, c.y-X.y); if(d<bd){ bd=d; best=c; } } if(!best || bd>12) continue; used.add(best); matched++;
      const sOver=cum[oa]+X.u*(cum[oa+1]-cum[oa]); const sA=best.sA/totalLen2D*total, sB=best.sB/totalLen2D*total; best.over=(cyc(sA,sOver)<=cyc(sB,sOver))? 'A':'B'; best.pending=false; }
    updateCrossInfo(); updateKnotType(); syncKnot3D(); out.importOk=crossings.length===J.crossings && matched===J.crossings; if(!out.importOk){ out.ok=false; return out; }
  } else { const k=process.env.KNOT||'figure8'; H.clickPreset(k); out.name=k; }
  out.det0=knotDet; const TRIES=+(process.env.BR_TRIES||3), BUD=+(process.env.UK_BUD||30000), ROUNDS=+(process.env.BR_ROUNDS||1);
  const cen=()=>{ let x=0,y=0,z=0; for(const v of verts){ x+=v.x; y+=v.y; z+=v.z; } return {x:x/N,y:y/N,z:z/N}; };
  const roundness=()=>{ const c=cen(); let mn=Infinity, mx=0, sum=0; for(const v of verts){ const r=Math.hypot(v.x-c.x, v.y-c.y, v.z-c.z); if(r<mn)mn=r; if(r>mx)mx=r; sum+=r; } const R=sum/N; return +((mx-mn)/R).toFixed(4); };
  const runSeries=()=>{ let st=0, o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUD*TRIES) break; } return {steps:st, settled:!o.running, E:_msBest? +(+_msBest.E).toPrecision(4) : null, rad:roundness(), wins:_msWins.filter(w=>isFinite(w.E)).map(w=>+(+w.E).toPrecision(4))}; };
  H.set({ms:TRIES}); const t0=Date.now(); H.play(); out.series0=runSeries(); if(process.env.UK_VERBOSE==='1') console.error('series0', JSON.stringify(out.series0));
  window.__stirMode('branch'); out.rounds=[];
  for(let r=0; r<ROUNDS; r++){ if(H.running()) H.play();
    if(!window.__knotStir()){ out.rounds.push({started:false}); break; } while(_stir) window.__knotStir();
    const d=_dbgStir||{}; const rec={branch:d.branch||null, M:_msLifts? _msLifts.length : 0, running:H.running(), note:_stirNote};
    if(_msLifts && _msLifts.length>1){ let dmax=0; for(let i=1;i<_msLifts.length;i++){ const a=_msLifts[0], b=_msLifts[i]; if(a.length!==b.length){ dmax=Infinity; break; } for(let k=0;k<a.length;k++) dmax=Math.max(dmax, a[k].distanceTo(b[k])); } rec.srcDiff_L0=isFinite(dmax)? +(dmax/L0).toFixed(2) : 'N differs'; }
    Object.assign(rec, runSeries()); rec.det=_detRobust(3); out.rounds.push(rec); if(process.env.UK_VERBOSE==='1') console.error('round', r, JSON.stringify(rec)); }
  out.sec=+((Date.now()-t0)/1000).toFixed(1); out.det1=_detRobust(3);
  out.ok = out.rounds.length===ROUNDS && out.rounds.every(x=>x.branch && x.M>=2 && x.settled && x.det===out.det0 && (x.srcDiff_L0==='N differs' || x.srcDiff_L0>0.05));
  return out; })()
