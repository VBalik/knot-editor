// повтор slidercont на текущем коде, с отметками времени и хода: многократная смена ползунков на ходу (12 пар событий) и применение.
// 2.40: ничего не ставится в досчёт (stale 0, redo false), идущие попытки продолжают с новыми константами, серия кончается, все места заполнены.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const runs=[];
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const SEEDS=(process.env.SEEDS||'14002').split(',').map(Number);
  for(const seed of SEEDS){ const t0=Date.now();
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',2);
    seeded(seed, ()=>{ let t=0; do{ randomKnot(14); }while(isUnknot && t++<30); });
    const rec={seed, nc:crossings.length, det:knotDet, N};
    H.set({ms:4}); H.play(); H.step(600);
    const key0=constsKey(), before=_msEnergies.slice();
    const b=document.getElementById('bendCoef'), r=document.getElementById('repCoef');
    for(let i=0;i<12;i++){ b.value=String(5+(i%14)); b.oninput(); r.value=String(2+(i%6)); r.oninput(); }
    b.value='14'; b.oninput(); r.value='6'; r.oninput(); window.__physFlush();
    rec.afterChange={stale:_msStale.length, redo:!!_msRedo, running:H.running(), unchanged:before.every((e,i)=>e===_msEnergies[i]), mixed:_parMixed};
    let o=null, st=600, lastLog=0, maxStale=0;
    while(true){ const s0=Date.now(); o=H.step(200); st+=200; const dt=Date.now()-s0; maxStale=Math.max(maxStale, _msStale.length+(_msRedo?1:0));
      if(st-lastLog>=4000 || dt>5000){ lastLog=st; const tr=window.__knotTrace(); console.error(JSON.stringify({seed, st, sec:Math.round((Date.now()-t0)/1000), msPer200:dt, round:tr.msRound, E:_msEnergies.map(e=>e===undefined?'-':(isFinite(e)?+e.toPrecision(4):'jam')), inflate:+_inflate.toFixed(3), N, stale:_msStale.length, redo:!!_msRedo, stat:H.dbg().status.slice(0,90)})); }
      if(!o.running || st>=150000 || Date.now()-t0>400000) break; }
    rec.steps=st; rec.sec=Math.round((Date.now()-t0)/1000); rec.settled=!o.running; rec.maxStale=maxStale;
    rec.E=_msEnergies.map(e=>(e===undefined?'—':(isFinite(e)? +e.toPrecision(4) : 'jam'))); rec.keys=_msKey.map(k=>k===constsKey()? 'new' : (k===key0? 'old' : k)); rec.status=H.dbg().status.slice(0,160);
    rec.ok=rec.settled && rec.afterChange.stale===0 && !rec.afterChange.redo && rec.afterChange.unchanged && maxStale===0 && _msEnergies.length===4 && _msEnergies.every(e=>e!==undefined) && rec.keys.every(k=>k==='old'||k==='new');
    runs.push(rec); console.error('RESULT', JSON.stringify(rec)); }
  return {ok:runs.every(r=>r.ok), runs}; })()
