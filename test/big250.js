// Узел на 250 пересечений: лифт (det), N, автотолщина, одна попытка физики — время и посадка
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const out=[];
  for(const nc of [150, 250]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('repCoef',1); H.setSlider('bendCoef',9);
    const t0=Date.now(); seeded(777+nc, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<10); });
    const rec={want:nc, nc:crossings.length, det:knotDet, N, thick:thickCoef, genSec:+((Date.now()-t0)/1000).toFixed(1)};
    const t1=Date.now(); H.set({ms:1}); H.play(); let o=null, st=0; while(st<60000){ o=H.step(200); st+=200; if(!o.running) break; }
    rec.phys={steps:st, settled:!o.running, sec:+((Date.now()-t1)/1000).toFixed(1), msPerStep:+((Date.now()-t1)/st).toFixed(2), E:+(_ePrev).toPrecision(4), inflate:+_inflate.toFixed(3), thickFit:+_thickFit.toFixed(3), detEnd:_detRobust(3), status:H.dbg().status.slice(0,110)};
    out.push(rec); console.error(JSON.stringify(rec)); }
  return out; })()
