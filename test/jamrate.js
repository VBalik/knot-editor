// Как часто попытка «jammed» при разных Repel (ядро (w+5r)·u): 2/8/7 (как на скриншоте) против 2/8/2 и 2/8/4
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  function runToEnd(b){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=b) break; } return {steps:st, settled:!o.running}; }
  for(const rep of [2,4,7]){
    for(const seed of [12001,12002]){
      H.el('clear').onclick(); if(H.running()) H.play();
      H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',rep);
      seeded(seed, ()=>{ let t=0; do{ randomKnot(14); }while(isUnknot && t++<30); });
      const rec={rep, seed, nc:crossings.length, det:knotDet, N, s_u:+((thickCoef+repCoef)).toFixed(0), Ls:+(3000/(thickCoef+repCoef)).toFixed(0)};
      H.set({ms:5}); H.play(); const r=runToEnd(150000);
      const E=_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)? +e.toPrecision(4) : 'jam')));
      rec.jams=E.filter(x=>x==='jam').length; rec.E=E; rec.settled=r.settled; rec.status=H.dbg().status.slice(0,130);
      out.push(rec); console.error(JSON.stringify(rec));
    } }
  return out; })()
