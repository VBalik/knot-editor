// 2.33→2.40: последовательно — ползунок увели после двух законченных попыток и вернули назад. 2.40: ни туда, ни обратно ничего не устаревает
// и не пересчитывается: места и энергии законченных попыток неизменны, серия доходит до конца; ключи — при каких значениях посчитана каждая
// попытка (после возврата все совпадают с нынешними).
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  H.el('clear').onclick(); H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',2);
  seeded(17001, ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); });
  H.set({ms:4}); H.play();
  let st=0; while(_msEnergies.filter(e=>e!==undefined).length<2 && H.running() && st<80000){ H.step(100); st+=100; }
  const before=_msEnergies.slice(), key0=constsKey(), nb=before.filter(e=>e!==undefined).length;
  const slots=()=>_msEnergies.map(e=>e===undefined?'—':+(+e).toPrecision(4));
  H.setSlider('repCoef',5); window.__physFlush();             // увели
  out.afterAway={stale:_msStale.length, redo:!!_msRedo, slots:slots(), unchanged:before.every((e,i)=>e===_msEnergies[i]), running:H.running(), mixed:_parMixed};
  H.setSlider('repCoef',2); window.__physFlush();             // вернули
  out.afterBack={stale:_msStale.length, redo:!!_msRedo, slots:slots(), unchanged:before.every((e,i)=>e===_msEnergies[i]), keyBack:constsKey()===key0};
  let o=null; while(true){ o=H.step(200); st+=200; if(!o.running || st>=200000) break; }
  out.final={settled:!o.running, E:_msEnergies.map(e=>e===undefined?'—':(isFinite(e)?+e.toPrecision(5):'jam')), keys:_msKey.slice(), cur:constsKey(), allCur:_msKey.every(k=>k===constsKey()),
    finishedUntouched:before.slice(0,nb).every((e,i)=>e===_msEnergies[i]), status:H.dbg().status.slice(0,150)};
  out.ok=nb>=2 && out.afterAway.stale===0 && !out.afterAway.redo && out.afterAway.unchanged && out.afterAway.running && out.afterBack.stale===0 && out.afterBack.unchanged && out.afterBack.keyBack
    && out.final.settled && _msEnergies.length===4 && _msEnergies.every(e=>e!==undefined) && out.final.allCur && out.final.finishedUntouched;
  return out; })()
