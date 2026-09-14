// 2.30→2.40: смена ползунков ПОСЛЕ того, как часть попыток закончилась. Ожидание 2.40: серия не перезапускается и НИЧЕГО не досчитывается —
// законченные попытки сохраняют энергию и ключ старых значений, идущая и следующие считаются с новыми константами (их энергия = истинная при новых),
// все места заполнены, серия кончается штатно с пометкой «settings changed mid-run (finished tries not recomputed)».
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const runs=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const trueE=(vs, t)=>{ const keepV=verts, keepN=N, keepL=L0, ki=_inflate, kb=_kBmul, kr=_kRmul, kt=_thickFit; _setVertsFrom(vs); _inflate=1; _kBmul=null; _kRmul=null; _thickFit=(t>0? t : 1); updateGeomUnits();
    const E=energyGrad(false).E; verts=keepV; N=keepN; L0=keepL; if(!_fx || _fx.length!==N) allocBuffers(); _thickFit=kt; updateGeomUnits(); _inflate=ki; _kBmul=kb; _kRmul=kr; return E; };   // истинная энергия формы при нынешних ползунках и толщине попытки
  for(const seed of [15001, 15002]){
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',2);
    seeded(seed, ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); });
    const rec={seed, nc:crossings.length, det:knotDet};
    H.set({ms:4}); H.play();
    let st=0; while(_msEnergies.filter(e=>e!==undefined).length<2 && H.running() && st<60000){ H.step(100); st+=100; }
    const key0=constsKey(), before=_msEnergies.slice(); const nb=before.filter(e=>e!==undefined).length;
    rec.finishedBefore=nb; rec.Ebefore=before.map(e=>e===undefined?'—':+e.toPrecision(4));
    H.setSlider('bendCoef',14); H.setSlider('repCoef',5); window.__physFlush();
    rec.afterChange={stale:_msStale.length, redo:!!_msRedo, slots:_msEnergies.map(e=>e===undefined?'—':+e.toPrecision(4)), running:H.running(), mixed:_parMixed, round:_msRound};
    let o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=200000) break; }
    rec.settled=!o.running; rec.E=_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)? +e.toPrecision(5) : 'jam')));
    rec.keys=_msKey.map(k=>k===constsKey()? 'new' : (k===key0? 'old' : k));
    // проверка: попытки, посчитанные при новых значениях, — истинная энергия формы при новых; законченные до смены — нетронуты
    rec.check=_msWins.slice().sort((a,b)=>a.k-b.k).map(w=>{ const i=w.k-1, rep=_msEnergies[i]; const e=trueE(w.verts, _msThick[i]);
      return {k:w.k, key:rec.keys[i], reported:(isFinite(rep)? +(+rep).toPrecision(5) : String(rep)), trueNow:+e.toPrecision(5), rel:(isFinite(rep) && isFinite(e))? +(Math.abs(e-rep)/Math.max(1e-12,Math.abs(e))).toExponential(1) : null}; });
    rec.status=H.dbg().status.slice(0,200);
    rec.ok=rec.settled && rec.afterChange.stale===0 && !rec.afterChange.redo && rec.afterChange.running && _msEnergies.length===4 && _msEnergies.every(e=>e!==undefined)
      && before.slice(0,nb).every((e,i)=>e===_msEnergies[i]) && rec.keys.slice(0,nb).every(k=>k==='old') && rec.keys.slice(nb).every(k=>k==='new')
      && rec.check.filter(c=>c.key==='new').every(c=>c.rel===null || c.rel<1e-2) && /finished tries not recomputed/.test(rec.status);
    runs.push(rec); console.error(JSON.stringify(rec));
  }
  return {ok:runs.every(r=>r.ok), runs}; })()
