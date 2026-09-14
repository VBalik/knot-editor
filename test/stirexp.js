// ЭКСПЕРИМЕНТ STIR (2.22): случайные диаграммы NC пересечений, серия Physics (TRIES попыток) → Stir → серия (TRIES−1 новых + лучшая),
// контроль — ещё TRIES−1 свежих попыток с той же диаграммы без Stir. Сравнение минимумов.
// W=1 R=1 B=9 TRIES=5 IDX="0,1,2" NCS="20,36,52" BUDGET=200000 node harness.js stirexp.js
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const W=+(process.env.W||1), R=+(process.env.R||1), B=+(process.env.B||9), TRIES=+(process.env.TRIES||5), BUDGET=+(process.env.BUDGET||200000);
  const IDX=(process.env.IDX||'0').split(',').map(Number), NCS=(process.env.NCS||'20').split(',').map(Number);
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  function runToEnd(){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUDGET) break; } return {steps:st, settled:!o.running}; }
  const es=()=>_msEnergies.filter(e=>e!==undefined && isFinite(e)).map(e=>+e.toPrecision(5));
  const mn=a=>a.length? Math.min(...a) : null;
  for(let q=0;q<IDX.length;q++){ const idx=IDX[q], nc=NCS[q];
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',W); H.setSlider('repCoef',R); H.setSlider('bendCoef',B);
    seeded(1000+idx, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
    const rawPts=raw.map(p=>({x:p.x,y:p.y})), overs=crossings.map(c=>c.over);
    const d=H.dbg(); const rec={idx, ncWanted:nc, nc:d.crossings.length, det:d.knotDet, N:d.N};
    let t0=Date.now(); H.set({ms:TRIES}); H.play(); const r1=runToEnd(); rec.phys={...r1, sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), status:H.dbg().status.slice(0,100)};
    if(!r1.settled || rec.phys.E.length===0){ rec.skip='physics not settled / jam'; out.push(rec); console.error(JSON.stringify(rec)); continue; }
    // Stir → серия
    t0=Date.now(); const rr=window.__knotStir(); const stirDbg=_dbgStir;
    const r2=rr.running? runToEnd() : {steps:0, settled:false};
    rec.stir={dbg:stirDbg, ...r2, sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), status:H.dbg().status.slice(0,120)};
    // контроль: та же диаграмма, ещё TRIES−1 свежих попыток без Stir
    H.el('clear').onclick(); if(H.running()) H.play();
    raw=rawPts.map(p=>({x:p.x,y:p.y})); closedCurve=false; drawing=false; finishCurve(true); crossings.forEach((c,i)=>c.over=overs[i]); updateKnotType(); syncKnot3D();
    t0=Date.now(); H.set({ms:Math.max(1,TRIES-1)}); H.play(); const r3=runToEnd(); rec.ctrl={...r3, sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), det:H.dbg().knotDet};
    rec.gainStir = rec.stir.min!==null? +((rec.phys.min-rec.stir.min)/rec.phys.min).toFixed(4) : null;
    rec.gainCtrl = rec.ctrl.min!==null? +((rec.phys.min-rec.ctrl.min)/rec.phys.min).toFixed(4) : null;
    out.push(rec); console.error(JSON.stringify(rec).slice(0,700)); }
  return out; })()
