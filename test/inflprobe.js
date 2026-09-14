// Проверка режима Stir «inflate ×k»: Physics → Stir inflate → серия; ядро стартует с 1/k, det сохранён, серия садится
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  function runToEnd(b){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=b) break; } return {steps:st, settled:!o.running}; }
  const es=()=>_msEnergies.filter(e=>e!==undefined && isFinite(e)).map(e=>+e.toPrecision(5));
  for(const [name, mk, sl, seed] of [['trefoil', ()=>H.clickPreset('trefoil'), [5,2,9], 9001], ['rand30', ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }, [3,1,9], 4343]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    const rec=seeded(seed, ()=>{ mk(); H.set({ms:3}); H.play(); const r1=runToEnd(60000); const E1=es(), det0=_detRobust(3);
      window.__stirMode('inflate'); window.__stirInfl(10); const rr=window.__knotStir(); const dbg=_dbgStir;
      const infl0=_inflate; const trace=[]; for(const st of [1,300,600,900,1200,1500,1800,2100,2400]){ H.step(st-(trace.length? trace[trace.length-1][0] : 0)); trace.push([st, +_inflate.toFixed(3), +(_ePrev).toPrecision(4), !!(_kBmul&&_inflate>=1)]); } const inflAfter1=trace[0][1];
      const r2=runToEnd(120000); const E2=es();
      return {N, det0, phys:r1, E1, stir:{mode:dbg&&dbg.mode, k:dbg&&dbg.remap&&dbg.remap.k, running:rr.running, det:[dbg&&dbg.det0, dbg&&dbg.det1]}, inflate0:+infl0.toFixed(4), inflateAfter1:+inflAfter1.toFixed(4), trace, series:r2, E2, lastTryInflate0:runLog&&runLog.meta&&runLog.meta.inflate0, detEnd:_detRobust(3), status:H.dbg().status.slice(0,120)}; });
    out[name]=rec; console.error(name, JSON.stringify(rec)); }
  return out; })()
