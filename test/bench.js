// СТЕНД СКОРОСТИ: три узла с фиксированными seed-ами, одна попытка, STEPS шагов (по умолчанию 1500):
// мс/шаг, E после STEPS шагов, хэш траектории (координаты ×1e9) — оптимизация обязана сохранять хэш
// (точная эквивалентность) или объяснять расхождение. FULL=1 — досчитать до покоя (шаги, время, E, det).
// STEPS=1500 FULL=0 KNOTS=trefoil,rand30,rand60 node harness.js bench.js   (KNOT_PAGE=… — другой файл; NOWASM=1 — JS-путь ядра пар, 3.2)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={}; if(process.env.NOWASM) window.__noWasm=true;
  out.wasm0=window.__wasm? window.__wasm() : null;
  const STEPS=+(process.env.STEPS||1500), FULL=+(process.env.FULL||0), KNOTS=(process.env.KNOTS||'trefoil,rand30,rand60').split(',');
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const hash=()=>{ let h=0; for(const v of verts){ for(const c of [v.x,v.y,v.z]){ const q=Math.round(c*1e9); h=(Math.imul(h,31)+q)|0; h=(Math.imul(h,31)+Math.floor(q/4294967296))|0; } } return h; };
  const defs={ trefoil:{mk:()=>H.clickPreset('trefoil'), sl:[5,2,9]}, figure8:{mk:()=>H.clickPreset('figure8'), sl:[5,2,9]},
    rand30:{mk:()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }, sl:[3,1,9], seed:4343},
    rand60:{mk:()=>{ let t=0; do{ randomKnot(60); }while(isUnknot && t++<30); }, sl:[3,1,9], seed:4444} };
  for(const name of KNOTS){ const d=defs[name]; if(!d) continue;
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',d.sl[0]); H.setSlider('repCoef',d.sl[1]); H.setSlider('bendCoef',d.sl[2]);
    const rec=seeded(d.seed||9001, ()=>{ d.mk(); const N0=N, det=knotDet;
      H.set({ms:1}); const t0=Date.now(); H.play(); let o=null, st=0;
      while(st<STEPS){ o=H.step(100); st+=100; if(!o.running) break; }
      const ms=Date.now()-t0; const r={N:N0, det, steps:st, msPerStep:+(ms/st).toFixed(3), E:+_ePrev.toPrecision(7), hash:hash(), running:!!o.running, inflate:+(+_inflate).toFixed(4)};
      if(FULL && o.running){ const t1=Date.now(); let s2=st; while(s2<200000){ o=H.step(200); s2+=200; if(!o.running) break; } r.full={steps:s2, sec:+((Date.now()-t1+ms)/1000).toFixed(1), settled:!o.running, E:+_ePrev.toPrecision(7), det:_detRobust(3), status:H.dbg().status.slice(0,80)}; }
      return r; });
    out[name]=rec; console.error(name, JSON.stringify(rec)); }
  out.wasm=window.__wasm? window.__wasm() : null; console.error('wasm', JSON.stringify(out.wasm));   // 3.2: ok, проходы Wasm (used) и JS (js)
  return out; })()
