// заведомо тесная посадка: подпись окна и подсказка в статусе, когда часть попыток не помещается
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  H.el('clear').onclick(); H.setSlider('thick',10); H.setSlider('bendCoef',9); H.setSlider('repCoef',10);
  seeded(13001, ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); });
  out.knot={nc:crossings.length, det:knotDet, core_u:thickCoef+5*repCoef};
  H.set({ms:3}); H.play();
  let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=120000) break; }
  out.notes=_msWins.map(w=>w.note); out.E=_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)?+e.toPrecision(4):'jam')));
  out.status=H.dbg().status; out.settled=!o.running;
  return out; })()
