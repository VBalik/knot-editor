// 2.06: каждая попытка — новый лифт из диаграммы со случайными высотами (тип узла сохранён); единая кнопка Physics→Pause→Stir
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function zstats(){ const v=H.verts(); let mn=1e9,mx=-1e9,s=0; for(const p of v){ mn=Math.min(mn,p[2]); mx=Math.max(mx,p[2]); s+=p[2]*p[2]; } return {zmin:+mn.toFixed(3), zmax:+mx.toFixed(3), zrms:+Math.sqrt(s/v.length).toFixed(3)}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.clickPreset('figure8'); H.set({ms:3});
  out.base=Object.assign({N:H.dbg().N, det2d:H.dbg().knotDet}, zstats());
  H.play(); const rounds=[{round:0, runDet:H.dbg().runDet, ...zstats()}]; let last=0, o=null, st=0;
  while(true){ o=H.step(50); st+=50; const tr=window.__knotTrace(); if(tr.msRound!==last){ rounds.push({round:tr.msRound, st, runDet:H.dbg().runDet, ...zstats()}); last=tr.msRound; } if(!o.running || st>60000) break; }
  out.rounds=rounds; out.final={status:H.dbg().status.slice(0,90), E:_msEnergies.map(e=>+e.toPrecision(4)), playStir:_playStir, running:H.running()};
  // единая кнопка: клик в режиме Stir → разрыхление → серия
  H.play(); out.afterClick={stir:!!_stir, playStir:_playStir, running:H.running()};
  const rr=window.__knotStir(700); out.stir={grow:rr.dbg&&rr.dbg.grow, det:rr.dbg&&[rr.dbg.det0, rr.dbg.det1], running:rr.running};
  st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>60000) break; }
  out.final2={status:H.dbg().status.slice(0,90), E:_msEnergies.map(e=>+e.toPrecision(4)), playStir:_playStir, liftFromDiagram:_liftFromDiagram};
  // новая диаграмма → режим Physics
  H.clickPreset('trefoil'); out.afterNewDiagram={playStir:_playStir, liftFromDiagram:_liftFromDiagram, stir:!!_stir};
  return out; })()
