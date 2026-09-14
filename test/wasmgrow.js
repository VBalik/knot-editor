// АРЕНА Wasm (3.2): рост памяти и пересоздание видов не должны менять траекторию. PART=big,vl,kr (по умолчанию все); NOWASM=1 — JS-путь.
// big: узел на CROSS (200) пересечений (N≈1200) — grow арены внутри первого energyGrad (список Верле); хэш/E после STEPS шагов сравнивать с
//      KNOT_PAGE=test/out/v31.html (эталон 3.1 без арены) и с NOWASM=1.   vl: принудительное удвоение списка Верле посреди постройки
//      (_vlJ подменён коротким видом) — хэш тот же, что без подмены.   kr: профиль _kRmul — вид арены; после grow указывает на те же байты;
//      trueEnergy восстанавливает свежий вид, если старый отсоединён.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={}; if(process.env.NOWASM) window.__noWasm=true;
  const PART=(process.env.PART||'big,vl,kr').split(','), STEPS=+(process.env.STEPS||300), CROSS=+(process.env.CROSS||200);
  const isNew=(typeof _wa==='object' && _wa && _wa.mem);
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const hash=()=>{ let h=0; for(const v of verts){ for(const c of [v.x,v.y,v.z]){ const q=Math.round(c*1e9); h=(Math.imul(h,31)+q)|0; h=(Math.imul(h,31)+Math.floor(q/4294967296))|0; } } return h; };
  const wa=()=>window.__wasm? window.__wasm() : null;
  const prep=(sl)=>{ H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]); };
  const run=(steps, hook)=>{ H.set({ms:1}); H.play(); let o=null, st=0; while(st<steps){ o=H.step(100); st+=100; if(hook && st===100) hook(); if(!o.running) break; } return st; };
  if(PART.includes('big')){ prep([3,1,9]); const w0=wa();
    const rec=seeded(777+CROSS, ()=>{ let t=0; do{ randomKnot(CROSS); }while(isUnknot && t++<10); const N0=N, det=knotDet, t0=Date.now(); const st=run(STEPS);
      return {N:N0, det, steps:st, sec:+((Date.now()-t0)/1000).toFixed(1), E:+_ePrev.toPrecision(7), hash:hash(), inflate:+(+_inflate).toFixed(4), wasm0:w0, wasm:wa()}; });
    out.big=rec; console.error('big', JSON.stringify(rec)); }
  if(PART.includes('vl')){ const one=(force)=>{ prep([3,1,9]); return seeded(4343, ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30);
      let info=null; const st=run(STEPS, force? ()=>{ if(!isNew) return; const cap=_wa.cap.nnz; _vlJ=_wa.v.vlJ.subarray(0,64); _vlN=0;   // короткий вид: постройка упрётся в cnt===_vlJ.length → _waLayout(n, 128) → виды заново
          info={capBefore:cap, lenBefore:_vlJ.length}; } : null);
      if(info){ info.capAfter=_wa.cap.nnz; info.lenAfter=_vlJ.length; info.same=(_vlJ===_wa.v.vlJ); }
      return {steps:st, E:+_ePrev.toPrecision(7), hash:hash(), info}; }); };
    const a=one(false), b=one(true); out.vl={plain:a, forced:b, hashEqual:a.hash===b.hash && a.E===b.E, wasm:wa()}; console.error('vl', JSON.stringify(out.vl)); }
  if(PART.includes('kr') && isNew){ prep([3,1,9]);
    const rec=seeded(4343, ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); run(300);
      const r={hasKR:!!(_kRmul), isView:_kRmul===_wa.v.kR, inflate:+(+_inflate).toFixed(4)}; if(!_kRmul) return r;
      const before=Float64Array.from(_kRmul), old=_kRmul; _wa.mem.grow(1); _waViews();   // grow отсоединяет старый буфер; виды пересоздаются
      r.oldDetached=old.buffer.byteLength===0; r.repointed=(_kRmul===_wa.v.kR); r.sameBytes=before.every((x,i)=>x===_kRmul[i]);
      _kRmul=old; const E=trueEnergy(); r.guardRestored=(_kRmul===_wa.v.kR); r.trueE=+E.toPrecision(7);   // старый (отсоединённый) вид → trueEnergy обязан вернуть свежий
      const E2=energyGrad(true).E; r.E_afterGuard=+E2.toPrecision(7); r.fxView=(_fx===_wa.v.fx); r.wasm=wa(); return r; });
    out.kr=rec; console.error('kr', JSON.stringify(rec)); }
  return out; })()
