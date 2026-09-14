// 2.30: смена ползунков во время счёта продолжает серию с новыми константами (без перезапуска и без «does not fit»)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  for(const seed of [14001, 14002]){
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',2);
    seeded(seed, ()=>{ let t=0; do{ randomKnot(14); }while(isUnknot && t++<30); });
    const rec={seed, nc:crossings.length, det:knotDet};
    H.set({ms:4}); H.play();
    H.step(600); rec.beforeRound=window.__knotTrace().msRound; rec.winsBefore=_msWins.length;
    // «дёрганье» Stiff. и Repel. во время счёта
    const b=document.getElementById('bendCoef'), r=document.getElementById('repCoef');
    for(let i=0;i<12;i++){ b.value=String(5+(i%14)); b.oninput(); r.value=String(2+(i%6)); r.oninput(); }
    b.value='14'; b.oninput(); r.value='6'; r.oninput();     // конечные значения отличаются от стартовых
    window.__physFlush();
    rec.afterRound=window.__knotTrace().msRound; rec.winsAfter=_msWins.length; rec.sliders=[thickCoef,bendCoef,repCoef];
    let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=150000) break; }
    const E=_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)? +e.toPrecision(4) : 'jam')));
    rec.steps=st; rec.settled=!o.running; rec.jams=E.filter(x=>x==='jam').length; rec.E=E;
    rec.notes=_msWins.map(w=>(w.note||'').trim()); rec.status=H.dbg().status.slice(0,150);
    out.push(rec); console.error(JSON.stringify(rec));
  }
  return out; })()
