// Снимок данных для стенда Wasm: координаты rand30 после релаксации и список пар (cd>2, |Δсередин|≤R) — как у ядра пар
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const out={};
  for(const [name, mk, sl, seed] of [['rand30', ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }, [3,1,9], 4343], ['rand60', ()=>{ let t=0; do{ randomKnot(60); }while(isUnknot && t++<30); }, [3,1,9], 4444]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    seeded(seed, ()=>{ mk(); H.set({ms:1}); H.play(); let o=null, st=0; while(st<1500){ o=H.step(100); st+=100; if(!o.running) break; } });
    _flatCoords(); const n=N, S=sExcl(), R=S+TAIL_CUT*S+1.5*L0, R2=R*R; const pairs=[];
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const cd=Math.min(j-i, n-(j-i)); if(cd<=2) continue;
      const mdx=_mx[j]-_mx[i], mdy=_my[j]-_my[i], mdz=_mz[j]-_mz[i]; if(mdx*mdx+mdy*mdy+mdz*mdz>R2) continue; pairs.push(i,j); } }
    out[name]={n, R, L0, x:Array.from(_vx), y:Array.from(_vy), z:Array.from(_vz), pairs};
    console.error(name, 'n', n, 'pairs', pairs.length/2); }
  const fs=process.mainModule.require('fs'), path=process.mainModule.require('path');   // require в vm недоступен — через модуль стенда
  fs.writeFileSync(path.join(process.cwd(),'wasm','knots.json'), JSON.stringify(out));
  return {ok:true, knots:Object.keys(out)}; })()
