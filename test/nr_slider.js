(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const isBad=(v)=>typeof v==='number' && !isFinite(v);
  H.clickPreset('trefoil'); H.setSlider('bendCoef',9); H.setSlider('thick',1); H.setSlider('repCoef',1);
  if(!H.running()) H.play(); H.step(100);
  out.pre={running:H.running(), E:_ePrev, gap_L0:+(minSegGap()/L0).toFixed(3), sN_L0:+(sNominal()/L0).toFixed(3), inflate:_inflate};
  // ПОЛЬЗОВАТЕЛЬ ТЯНЕТ ПОЛЗУНКИ ВО ВРЕМЯ РАБОТЫ: s растёт 0.15→1.5 L0 при зазоре ~0.7 L0
  H.setSlider('thick',10); H.setSlider('repCoef',10);
  const eg=energyGrad(false); out.afterSlide={running:H.running(), sN_L0:+(sNominal()/L0).toFixed(3), inflate:_inflate, energyDirty:_energyDirty, E_now:String(eg.E), gap_sN:+(minSegGap()/sNominal()).toFixed(3)};
  const rows=[]; let o=null; for(let k=0;k<60;k++){ o=H.step(25); const tr=window.__knotTrace(); rows.push({st:stepCounter, E:String(_ePrev), fRel:+tr.fRel.toExponential(2), stuck:_stuck, settle:settleCount, quietBy:tr.quietBy, mv:+tr.moved.toExponential(1), gap_sN:+(minSegGap()/sNominal()).toFixed(3), inflate:+_inflate.toFixed(3), running:o.running, status:o.status.slice(0,70)}); if(!o.running) break; }
  out.rows=rows.filter((r,i)=>i<4||i%10===0||!r.running);
  const s=H.log().series||[]; out.series={n:s.length, eInf:s.filter(r=>r.E!=null&&!isFinite(r.E)).length, eNull:s.filter(r=>r.E==null).length, nanAny:s.reduce((a,r)=>a+Object.values(r).filter(isBad).length,0)};
  out.final={status:H.dbg().status, E:String(_ePrev), running:H.running(), gap_sN:+(minSegGap()/sNominal()).toFixed(3), dbgE:H.dbg().E, telemLastE:String((s[s.length-1]||{}).E)};
  if(H.running()) H.play(); return out; })()
