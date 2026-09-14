// разнообразие попыток со случайным профилем жёсткости: диаграмма пользователя (det 11) и восьмёрка
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const T=JSON.parse(fs.readFileSync('../telemetry/knot-telemetry-20260904-165935-456.json','utf8'));
  async function series(name, prep, thick, rep, bend, ms, budget){
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',thick); H.setSlider('repCoef',rep); H.setSlider('bendCoef',bend);
    await prep(); H.set({ms});
    const d=H.dbg(); const rec={nc:d.crossings.length, det:d.knotDet, N:d.N};
    const circE=4*Math.PI*Math.PI/d.N; H.play();
    let o=null, st=0, lastRound=-1; const rounds=[];
    while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace(); if(tr.msRound!==lastRound){ rounds.push({round:tr.msRound, st, phaseA:!!_kBmul}); lastRound=tr.msRound; } if(!o.running || st>=budget) break; }
    const tr=window.__knotTrace();
    Object.assign(rec,{steps:st, settled:!o.running, status:H.dbg().status.slice(0,140), msEnergies:tr.msEnergies.map(e=>+e.toPrecision(4)), ratio:+(H.bE()/circE).toFixed(3), rounds, saddleN:tr.saddleN});
    console.error(name, JSON.stringify(rec)); out[name]=rec; return rec; }
  await series('user_det11_w10r10', async()=>{ global.fetch=async ()=>({ ok:true, json:async ()=>T }); document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,400)); }, 10,10,2, 5, 30000);
  await series('figure8', async()=>H.clickPreset('figure8'), 5,2,9, 5, 20000);
  await series('rand20', async()=>{ let seed=7; randomKnot(20); }, 5,2,9, 5, 30000);
  return out; })()
