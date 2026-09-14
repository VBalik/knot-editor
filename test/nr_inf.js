(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.clickPreset('trefoil'); H.setSlider('bendCoef',9); H.setSlider('thick',5); H.setSlider('repCoef',5);
  if(!H.running()) H.play(); H.step(200);
  const sN=sNominal(); out.pre={inflate:_inflate, gap_sN:+(minSegGap()/sN).toFixed(3), E:_ePrev, running:H.running()};
  // АДВЕРСАРИАЛЬНО: поднимаем ядро выше фактического зазора (как если бы ратчет ошибся)
  const g=minSegGap(); _inflate=Math.min(1, 1.2*g/sN); _energyDirty=true; lbReset();
  out.forced={inflate:_inflate, sEff_gap:+(sExcl()/g).toFixed(3)};
  const eg=energyGrad(false); out.E_now=eg.E; out.gmin_now_L0=+(eg.gmin/L0).toFixed(4); out.trueGap_L0=+(g/L0).toFixed(4);
  const rows=[]; for(let k=0;k<40;k++){ const o=H.step(25); const tr=window.__knotTrace(); rows.push({st:stepCounter, E:_ePrev, fRel:+tr.fRel.toExponential(2), inflate:+_inflate.toFixed(4), stall:_inflStall, jam:_inflJammed, stuck:_stuck, settle:settleCount, mv:+tr.moved.toExponential(1), gmin:+(_dbgGmin/L0).toFixed(3), gapS:+(minSegGap()/sExcl()).toFixed(3), running:o.running, status:o.status.slice(0,60)}); if(!o.running) break; }
  out.rows=rows.filter((r,i)=>i<6||i%5===0||!r.running);
  // серия: есть ли Infinity в E?
  const s=H.log().series||[]; out.eInf=s.filter(r=>r.E!=null&&!isFinite(r.E)).length; out.eNull=s.filter(r=>r.E==null).length; out.seriesLen=s.length;
  out.final={status:H.dbg().status, E:_ePrev, running:H.running()};
  if(H.running()) H.play();
  return out; })()
