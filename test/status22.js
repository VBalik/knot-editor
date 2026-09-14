// интерфейс 2.02: формат статуса «Min · % · E», ранний выход мультистарта при окружности,
// разнесение пересечений случайной диаграммы (≥1.5·CROSS_R)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function run(budget){ let last='', o=null, st=0, pctPrev=-1, pctMono=true; const snaps=[];
    while(true){ o=H.step(50); st+=50; const s=H.dbg().status; if(s!==last){ snaps.push(st+': '+s); last=s; }
      const m=/ (\d+)% /.exec(s); if(m){ const p=+m[1]; if(p<pctPrev) pctMono=false; pctPrev=p; }
      if(!o.running || st>=budget) break; }
    return {steps:st, settled:!o.running, final:H.dbg().status, pctMono, nSnaps:snaps.length,
      snaps:snaps.filter((_,i)=>i%Math.max(1,Math.ceil(snaps.length/14))===0).concat([snaps[snaps.length-1]]), msEnergies:window.__knotTrace().msEnergies}; }
  H.clickPreset('trefoil'); H.play(); out.trefoil=run(40000);
  let tries=0; while(tries++<80){ randomKnot(6); if(isUnknot && crossings.length>=3) break; }
  out.unknot={nc:crossings.length, det:knotDet, tries, status0:H.dbg().status};
  H.play(); Object.assign(out.unknot, run(40000));
  out.sep=[]; for(const t of [5,20,50,100]){ const t0=Date.now(); randomKnot(t); const ms=Date.now()-t0;
    out.sep.push({t, nc:crossings.length, md:+_minCrossDist().toFixed(1), ms, status:H.dbg().status.slice(0,100)}); }
  return out; })()
