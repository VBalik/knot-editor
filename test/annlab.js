// ЛАБОРАТОРИЯ ОТЖИГА (stir.html): диаграммы seed 1000+idx (как stirlab), серия Physics (TRIES попыток, seed PHYS_SEED+idx)
// при разных настройках случайных профилей жёсткости/отталкивания (window.__ann: stiff=ln размаха, rep=ln размаха, steps=длина отжига).
// SETS="base:3.466:2.773:1500,wide:4.605:4.605:1500,widelong:4.605:4.605:3000,huge:6.908:6.908:3000" IDX=0,1 NCS=20,22 TRIES=5 PHYS_SEED=9000 KNOT_PAGE=stir.html node harness.js annlab.js
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const W=+(process.env.W||3), R=+(process.env.R||1), B=+(process.env.B||9), TRIES=+(process.env.TRIES||5), BUDGET=+(process.env.BUDGET||200000), PHYS_SEED=+(process.env.PHYS_SEED||9000);
  const IDX=(process.env.IDX||'0').split(',').map(Number), NCS=(process.env.NCS||'20').split(',').map(Number);
  const SETS=(process.env.SETS||'base:3.466:2.773:1500,wide:4.605:4.605:1500,widelong:4.605:4.605:3000,huge:6.908:6.908:3000').split(',').map(t=>{ const [name,st,rp,steps,mx,mxr]=t.split(':'); return {name, stiff:+st, rep:+rp, steps:+steps, mixTo:mx? +mx : 0, mixToR:mxr? +mxr : 0}; });   // 5-е/6-е поля — верх случайного размаха (ln) для stiff/rep
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  function runToEnd(){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUDGET) break; } return {steps:st, settled:!o.running}; }
  const es=()=>_msEnergies.filter(e=>e!==undefined && isFinite(e)).map(e=>+e.toPrecision(5));
  for(let q=0;q<IDX.length;q++){ const idx=IDX[q], nc=NCS[q];
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',W); H.setSlider('repCoef',R); H.setSlider('bendCoef',B);
    seeded(1000+idx, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
    const rawPts=raw.map(p=>({x:p.x,y:p.y})), overs=crossings.map(c=>c.over);
    const d=H.dbg(); const rec={idx, nc:d.crossings.length, det:d.knotDet, N:d.N, W, R, B, TRIES, sets:{}};
    for(const S of SETS){
      H.el('clear').onclick(); if(H.running()) H.play();
      raw=rawPts.map(p=>({x:p.x,y:p.y})); closedCurve=false; drawing=false; finishCurve(true); crossings.forEach((c,i)=>c.over=overs[i]); updateKnotType(); syncKnot3D();
      window.__ann={stiff:S.stiff, rep:S.rep, steps:S.steps, mixTo:S.mixTo||0, mixToR:S.mixToR||0};
      const t0=Date.now(); const r=seeded(PHYS_SEED+idx, ()=>{ H.set({ms:TRIES}); H.play(); return runToEnd(); });
      const E=es(); rec.sets[S.name]={...r, sec:+((Date.now()-t0)/1000).toFixed(1), E, min:E.length? Math.min(...E) : null, det:H.dbg().knotDet, status:H.dbg().status.slice(0,90)};
      console.error('  set', S.name, 'idx', idx, JSON.stringify(rec.sets[S.name]).slice(0,220)); }
    window.__ann=null;
    const base=rec.sets[SETS[0].name]; for(const S of SETS){ const m=rec.sets[S.name]; m.gainVsBase = (m.min!==null && base.min)? +((base.min-m.min)/base.min).toFixed(4) : null; }
    out.push(rec); console.error(JSON.stringify({idx, nc:rec.nc, gains:Object.fromEntries(Object.entries(rec.sets).map(([k,v])=>[k,[v.min,v.gainVsBase,v.sec]]))})); }
  return out; })()
