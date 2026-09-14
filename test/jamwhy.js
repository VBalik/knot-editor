// ПОЧЕМУ «does not fit» на свободном узле: 2/8/7 (как у пользователя), случайные 8–12 пересечений, без смены и со сменой Repel 2→7 на ходу.
// Для каждой попытки: заклинило ли, при какой доле ядра, зазор до чужих прядей в долях ядра, шагов; трасса надувания.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const THIN=(typeof _thickFit!=='undefined');
  for(const [seed,nc] of [[21001,8],[21002,10],[21003,12],[21004,9]]){
    for(const mode of ['fixed7','switch2to7']){
      H.el('clear').onclick(); if(H.running()) H.play();
      H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef', mode==='fixed7'? 7 : 2);
      seeded(seed, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
      const rec={seed, nc:crossings.length, det:knotDet, N, mode, L0_u:+(L0/unitLen()).toFixed(2), s_L0:+(((thickCoef+5*7)*unitLen())/L0).toFixed(2)};
      H.set({ms:1}); H.play();
      const trace=[]; let st=0, switched=false, o=null;
      while(true){ o=H.step(100); st+=100;
        if(mode==='switch2to7' && !switched && st>=800){ H.setSlider('repCoef',7); window.__physFlush(); switched=true; }
        if(st%500===0){ const tr=window.__knotTrace(); trace.push({st, infl:+_inflate.toFixed(3), gapRep_s:+(minSegGapRep()/sNominal()).toFixed(3), stall:_inflStall, thick:THIN? +_thickFit.toFixed(3):1, E:isFinite(_ePrev)? +_ePrev.toPrecision(4):null}); }
        if(!o.running || st>=40000) break; }
      rec.steps=st; rec.settled=!o.running; rec.inflEnd=+_inflate.toFixed(3); rec.thickEnd=THIN? +_thickFit.toFixed(3) : 1;
      rec.gapRep_s=+(minSegGapRep()/sNominal()).toFixed(3); rec.status=H.dbg().status.slice(0,120); rec.trace=trace.slice(0,16);
      out.push(rec); console.error(JSON.stringify({seed, nc:rec.nc, mode, steps:st, settled:rec.settled, inflEnd:rec.inflEnd, thickEnd:rec.thickEnd, gap:rec.gapRep_s, status:rec.status.slice(0,70)}));
    } }
  return out; })()
