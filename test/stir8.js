// Stir 2.23 «наизнанку»: режим, det, серия после Stir с выворачиванием на каждую попытку. Стенд stir.html: MODE=loops|invert, PIN=1|0 (пины веера) — необязательные env
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  if(process.env.MODE && window.__stirMode) window.__stirMode(process.env.MODE); if(process.env.PIN!==undefined && window.__stirPin) window.__stirPin(process.env.PIN!=='0');   // index.html хуков не имеет — пропуск
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  async function one(name, prep, sl){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    await prep(); H.set({ms:3}); H.play(); const r1=runToEnd(60000); const E1=_msEnergies.map(e=>isFinite(e)?+e.toPrecision(4):'jam'); const det=knotDet;
    const t0=Date.now(); const rr=window.__knotStir(); const ms=Date.now()-t0; const dbg=_dbgStir; const holes0=_stirHoles.length;
    const r2=rr.running? runToEnd(90000) : null;
    out[name]={det, E1, stirMs:ms, mode:dbg&&dbg.mode, remap:dbg&&dbg.remap, det01:[dbg&&dbg.det0, dbg&&dbg.det1], r2, E2:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(4):'jam'), holes:[holes0,_stirHoles.length], status:H.dbg().status.slice(0,110)};
    console.error(name, JSON.stringify(out[name]).slice(0,500)); }
  await one('trefoil', async()=>H.clickPreset('trefoil'), [5,2,9]);
  await one('figure8', async()=>H.clickPreset('figure8'), [5,2,9]);
  await one('rand12', async()=>seeded(4242,()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }), [5,2,9]);
  await one('rand30', async()=>seeded(4343,()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }), [3,1,9]);
  return out; })()
