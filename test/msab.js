(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
  const raw=fs.readFileSync(process.env.TELEM,'utf8'); global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  const M=()=>16*Math.PI*Math.PI/N; const out={};
  const one=async (ms, stretch)=>{ document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300)); window.__knotSet({ms, stretch}); H.setSlider('bendCoef',1); H.setSlider('thick',10); H.setSlider('repCoef',10); if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=40000) break; } if(H.running()) H.play(); return {rounds:window.__knotTrace().msEnergies.map(e=>+(e).toPrecision(3)), best:+(H.bE()/M()).toFixed(3)}; };
  out.stretch6=await one(6,true); out.nostretch6=await one(6,false);
  out.fresh=[]; for(let k=0;k<6;k++){ const r=await one(1,false); out.fresh.push(r.rounds[0]); }
  return out; })()
