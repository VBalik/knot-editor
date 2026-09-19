// что делает Stir «раздутие ×k» по шагам: масштаб (Rg) и БЕЗРАЗМЕРНЫЙ отпечаток формы
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const runToEnd=(b)=>{ let o=null,st=0; while(true){ o=H.step(200); st+=200; if(!o.running||st>=b) break; } return {steps:st, settled:!o.running}; };
  const seeded=(seed,fn)=>{ const o=Math.random; let s=seed; Math.random=()=>{ s=(Math.imul(s,1103515245)+12345)&0x7fffffff; return s/0x7fffffff; }; try{ fn(); } finally{ Math.random=o; } };
  function fp(){ const n=N, c={x:0,y:0,z:0};
    for(let i=0;i<n;i++){ c.x+=verts[i].x; c.y+=verts[i].y; c.z+=verts[i].z; } c.x/=n; c.y/=n; c.z/=n;
    let rg=0; for(let i=0;i<n;i++){ const dx=verts[i].x-c.x, dy=verts[i].y-c.y, dz=verts[i].z-c.z; rg+=dx*dx+dy*dy+dz*dz; }
    rg=Math.sqrt(rg/n);
    const f=[]; for(const m of [n>>3, n>>2, n>>1]){ let s=0;
      for(let i=0;i<n;i++){ const a=verts[i], b=verts[(i+m)%n]; s+=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z); }
      f.push(+(s/n/rg).toFixed(4)); }
    return {rg:+rg.toFixed(3), f}; }
  async function one(name, prep, sl){
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    await prep(); H.set({ms:1}); H.play(); runToEnd(60000);
    const E1=_msEnergies.map(e=>isFinite(e)?+e.toPrecision(5):'jam'), det=knotDet, base=fp();
    window.__knotStir();
    const tr=[{at:0, infl:+_inflate.toFixed(3), ...fp()}];
    let st=0; while(st<3000){ H.step(100); st+=100; if(st%300===0) tr.push({at:st, infl:+_inflate.toFixed(3), ...fp()}); }
    const mid=fp(); const r2=runToEnd(90000);
    out[name]={det, E1, base, trace:tr, afterHold:mid, r2,
      E2:_msEnergies.map(e=>isFinite(e)?+e.toPrecision(5):'jam'), det2:knotDet};
    console.error(name, JSON.stringify(out[name])); }
  await one('trefoil', async()=>H.clickPreset('trefoil'), [5,2,9]);
  await one('rand12', async()=>seeded(4242,()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }), [5,2,9]);
  return {ok:true}; })()
