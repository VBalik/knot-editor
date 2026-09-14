// ЭКСПЕРИМЕНТ ОТЖИГА (2.19): сравнение настроек window.__ann на наборе узлов, серия из TRIES попыток, REP повторов.
// ANN='{"stiff":2.08,"rep":1.39,"hard":true}' REP=3 TRIES=5 KNOTS=figure8,det11,det11b,r12,r16,r20 node harness.js annexp.js
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
  const ann=process.env.ANN? JSON.parse(process.env.ANN) : null; if(ann) window.__ann=ann;
  const REP=+(process.env.REP||2), TRIES=+(process.env.TRIES||5), BUDGET=+(process.env.BUDGET||80000);
  const want=(process.env.KNOTS||'figure8,det11,det11b,r12,r16,r20').split(',');
  const TF='fixtures/telemetry/knot-telemetry-20260904-165935-456.json';
  const T=fs.existsSync(TF)? JSON.parse(fs.readFileSync(TF,'utf8')) : null;
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const restore=async()=>{ global.fetch=async()=>({ok:true,json:async()=>T}); document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,400)); };
  const rnd=(n,seed)=>async()=>seeded(seed,()=>{ let t=0; do{ randomKnot(n); }while(isUnknot && t++<30); });
  const TF2='fixtures/telemetry/knot-telemetry-20260907-120335-802.json'; const T2=fs.existsSync(TF2)? JSON.parse(fs.readFileSync(TF2,'utf8')) : null;
  const restore2=async()=>{ global.fetch=async()=>({ok:true,json:async()=>T2}); document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,400)); };
  const KNOTS={ figure8:{prep:async()=>H.clickPreset('figure8'), sl:[5,2,9]}, user20:{prep:restore2, sl:[5,2,9]},
    det11:{prep:restore, sl:[10,10,2]}, det11b:{prep:restore, sl:[5,2,9]},
    r12:{prep:rnd(12,12001), sl:[5,2,9]}, r16:{prep:rnd(16,16001), sl:[5,2,9]}, r20:{prep:rnd(20,20001), sl:[5,2,9]}, r20b:{prep:rnd(20,20002), sl:[10,10,2]} };
  const out={ann:ann||'default', rep:REP, tries:TRIES, knots:{}};
  for(const name of want){ const K=KNOTS[name]; if(!K){ console.error('unknown knot',name); continue; } const runs=[];
    for(let r=0;r<REP;r++){
      H.el('clear').onclick(); if(H.running()) H.play();
      H.setSlider('thick',K.sl[0]); H.setSlider('repCoef',K.sl[1]); H.setSlider('bendCoef',K.sl[2]);
      await K.prep(); H.set({ms:TRIES});
      const d=H.dbg(); const t0=Date.now(); H.play();
      let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=BUDGET) break; }
      const tr=window.__knotTrace(); const es=tr.msEnergies.filter(e=>e!==undefined && isFinite(e));
      const rec={nc:d.crossings.length, det:d.knotDet, N:d.N, steps:st, sec:+((Date.now()-t0)/1000).toFixed(1), settled:!o.running, energies:es.map(e=>+e.toPrecision(5)), min:es.length? +Math.min(...es).toPrecision(5) : null, status:H.dbg().status.slice(0,120)};
      runs.push(rec); console.error(name, r, JSON.stringify(rec)); }
    out.knots[name]=runs; }
  return out; })()
