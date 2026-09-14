// трёхлепестковая ловушка (fixtures/trap_coilloop.json): минимальная мода с бо́льшим числом
// итераций Ланцоша и прямой пробный выход из седла
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
  const pts=JSON.parse(fs.readFileSync('fixtures/trap_coilloop.json','utf8'));
  out.set=window.__knotSetVerts(pts); H.set({ms:1});
  window.__knotProject(60);
  const circE=4*Math.PI*Math.PI/H.dbg().N; out.ratio0=+(H.bE()/circE).toFixed(3);
  for(const k of [36,80,150]){ const t0=Date.now(); const r=window.__knotMinMode(k); r.ms=Date.now()-t0; out['mm'+k]=r; }
  SADDLE_REL=1e-7;
  out.escape=window.__knotSaddle(); out.ratioAfterEscape=+(H.bE()/circE).toFixed(3);
  H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=40000) break; }
  const tr=window.__knotTrace(); out.run={steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,80), saddleN:tr.saddleN, lastSaddle:tr.saddle, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3)};
  return out; })()
