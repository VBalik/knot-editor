// 2.26: таскание ползунка во время счёта — отложенная часть (physSettingsChanged) ОДИН раз после паузы, а не на каждое событие.
// 2.40: смена ползунков не запускает счёт и не пересчитывает законченные попытки (ничего в досчёте), серия доходит до конца, все места заполнены.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  H.el('clear').onclick(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  seeded(9001, ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); });
  H.set({ms:3}); H.play(); H.step(400);
  // счётчик отложенных применений (physSettingsChanged)
  let n=0; const orig=physSettingsChanged; physSettingsChanged=function(){ n++; return orig.apply(this,arguments); };
  const el=document.getElementById('repCoef');
  for(let i=0;i<20;i++){ el.value=String(1+(i%8)); el.oninput(); }          // «протяжка»: 20 событий подряд
  out.duringDrag={applied:n, repCoef, running:H.running(), stale:_msStale.length, redo:!!_msRedo};   // ожидание: 0 применений, значение принято сразу, счёт идёт
  out.flushed=window.__physFlush();                                          // отложенное применение — вручную
  out.afterFlush={applied:n, running:H.running(), wins:_msWins.length, stale:_msStale.length, redo:!!_msRedo, mixed:_parMixed, status:H.dbg().status.slice(0,80)};
  let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=60000) break; }
  out.final={steps:st, settled:!o.running, energies:_msEnergies.map(e=>e===undefined?'—':(isFinite(e)?+e.toPrecision(4):'jam')), keys:_msKey.slice(), cur:constsKey(), status:H.dbg().status.slice(0,150)};
  physSettingsChanged=orig;
  // без счёта — применение немедленное (без задержки) и без запуска счёта
  H.el('clear').onclick(); seeded(9002, ()=>{ randomKnot(8); });
  let m=0; const o2=physSettingsChanged; physSettingsChanged=function(){ m++; return o2.apply(this,arguments); };
  document.getElementById('thick').value='7'; document.getElementById('thick').oninput();
  out.idle={applied:m, pending:window.__physFlush(), running:H.running()};   // ожидание: 1 применение сразу, отложенного нет, счёт не запущен
  physSettingsChanged=o2;
  out.ok=out.duringDrag.applied===0 && out.duringDrag.running && out.flushed===true && out.afterFlush.applied===1 && out.afterFlush.running && out.afterFlush.stale===0 && !out.afterFlush.redo
    && out.final.settled && out.final.energies.length===3 && out.final.energies.every(e=>e!=='—') && out.idle.applied===1 && !out.idle.pending && !out.idle.running;
  return out; })()
