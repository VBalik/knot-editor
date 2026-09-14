// последовательный путь: Stir переносит лучшую попытку как №1, новые попытки — Tries−1, энергии сравниваются с перенесённой
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('clear').onclick(); if(H.running()) H.play(); H.clickPreset('figure8'); H.set({ms:3});
  H.play(); runToEnd(60000); out.s1={status:H.dbg().status.slice(0,60), wins:_msWins.map(w=>[w.k, +w.E.toPrecision(3)]), bestE:_msBest&&+_msBest.E.toPrecision(4)};
  H.play(); out.afterStirClick={stir:!!_stir, wins:_msWins.map(w=>[w.k, +w.E.toPrecision(3)]), carry:!!_msCarry, E:_msEnergies.map(e=>+e.toPrecision(3))};
  let c=0; while(_stir && c<800){ stirStep(); c++; }
  out.series={msK:_msK, offset:_msOffset, E:_msEnergies.map(e=>+e.toPrecision(3)), best:_msBest&&_msBest.round};
  runToEnd(60000); out.s2={status:H.dbg().status.slice(0,90), wins:_msWins.map(w=>[w.k, isFinite(w.E)?+w.E.toPrecision(3):'-']), K:_msK, offset:_msOffset};
  return out; })()
