// Заклинивают ли попытки из-за протяжки ползунка? Одинаковые серии (ползунки 2/8/7, как на скриншоте):
// A — без вмешательства, B — на 400-м шаге «протяжка» Stiff. (10 событий) + применение отложенного перезапуска.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const es=()=>_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)? +e.toPrecision(4) : 'jam')));
  for(const seed of [11001, 11002, 11003]){
    for(const mode of ['plain','drag']){
      H.el('clear').onclick(); if(H.running()) H.play();
      H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',7);
      seeded(seed, ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); });
      const det=knotDet, n=crossings.length;
      H.set({ms:5}); H.play();
      H.step(400);
      let dragged=0;
      if(mode==='drag'){                                   // «дёрганье» ползунка Stiff. во время счёта
        const el=document.getElementById('bendCoef');
        for(let i=0;i<10;i++){ el.value=String(5+(i%8)); el.oninput(); dragged++; }
        el.value='8'; el.oninput();                        // вернули как было
        window.__physFlush();
      }
      const r=runToEnd(120000);
      const E=es(); const jams=E.filter(x=>x==='jam').length;
      out.push({seed, mode, nc:n, det, dragged, steps:r.steps, settled:r.settled, jams, E, status:H.dbg().status.slice(0,120)});
      console.error(JSON.stringify(out[out.length-1]));
    }
  }
  return out; })()
