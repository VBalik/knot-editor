// Проверка сравнимости энергии при смене длины/числа вершин: та же форма, масштаб λ, N'=round(λ·N0), рёбра L0 → E'·N'/N0 ?= E0
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  function resampleTo(vs, n2){ const curve=new THREE.CatmullRomCurve3(vs, true, 'centripetal', 0.5); curve.arcLengthDivisions=Math.max(800, 4*vs.length); const pts=curve.getSpacedPoints(n2); pts.pop(); return pts; }
  for(const [name, mk, sl] of [['trefoil', ()=>H.clickPreset('trefoil'), [5,2,9]], ['rand30', ()=>seeded(4343, ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }), [3,1,9]]]){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    seeded(9001, ()=>{ mk(); H.set({ms:1}); H.play(); let o=null, st=0; while(st<60000){ o=H.step(200); st+=200; if(!o.running) break; } });
    const N0=N, L0v=L0, base=verts.map(v=>v.clone()); _inflate=1; _kBmul=null; _kRmul=null; _energyDirty=true;
    const g0=energyGrad(false), E0=g0.E, b0=E0-energyGrad(false,true).E, u0=unitLen(), s0=sNominal();
    const rec={N0, E0:+E0.toPrecision(6), bend0:+b0.toPrecision(6), rep0:+(E0-b0).toPrecision(4), gmin0_s:+(g0.gmin/s0).toFixed(3), rows:[]};
    for(const lam of [0.8, 1.0, 1.3, 1.6, 2.0]){
      const n2=Math.round(lam*N0); const cx=base.reduce((a,v)=>a+v.x,0)/N0, cy=base.reduce((a,v)=>a+v.y,0)/N0, cz=base.reduce((a,v)=>a+v.z,0)/N0;
      const sc=n2/N0; const scaled=base.map(v=>new THREE.Vector3(cx+(v.x-cx)*sc, cy+(v.y-cy)*sc, cz+(v.z-cz)*sc));   // точная длина n2·L0 после ресэмпла
      const Y=resampleTo(scaled, n2); _setVertsFrom(Y); L0=L0v; updateGeomUnits(); projectLengthsSafe(40); _inflate=1; _energyDirty=true;
      const g=energyGrad(false), b=g.E-energyGrad(false,true).E; let tl=0; for(let i=0;i<N;i++) tl+=verts[i].distanceTo(verts[(i+1)%N]);
      rec.rows.push({lam, N:N, u_u0:+(unitLen()/u0).toFixed(3), s_s0:+(sNominal()/s0).toFixed(3), L_L0N0:+(tl/(L0v*N0)).toFixed(3), E:+g.E.toPrecision(6), E_norm:+(g.E*N/N0).toPrecision(6), ratio:+((g.E*N/N0)/E0).toFixed(4), bend_norm_ratio:+((b*N/N0)/b0).toFixed(4), rep_norm_ratio:+(((g.E-b)*N/N0)/(E0-b0)).toFixed(4), gmin_s:+(g.gmin/sNominal()).toFixed(3)});
    }
    // обратно: с N'=1.6·N0 вернуться к N0 (фаза 3) — E совпадает с E0?
    { const n2=Math.round(1.6*N0); const sc=n2/N0; const cx=base.reduce((a,v)=>a+v.x,0)/N0, cy=base.reduce((a,v)=>a+v.y,0)/N0, cz=base.reduce((a,v)=>a+v.z,0)/N0;
      const Y=resampleTo(base.map(v=>new THREE.Vector3(cx+(v.x-cx)*sc, cy+(v.y-cy)*sc, cz+(v.z-cz)*sc)), n2); _setVertsFrom(Y); L0=L0v; updateGeomUnits(); projectLengthsSafe(40);
      const cx2=verts.reduce((a,v)=>a+v.x,0)/N, cy2=verts.reduce((a,v)=>a+v.y,0)/N, cz2=verts.reduce((a,v)=>a+v.z,0)/N; const back=verts.map(v=>new THREE.Vector3(cx2+(v.x-cx2)/sc, cy2+(v.y-cy2)/sc, cz2+(v.z-cz2)/sc));
      const Yb=resampleTo(back, N0); _setVertsFrom(Yb); L0=L0v; updateGeomUnits(); projectLengthsSafe(40); _inflate=1; _energyDirty=true; const gb=energyGrad(false);
      rec.roundtrip={N, E:+gb.E.toPrecision(6), ratio_E0:+(gb.E/E0).toFixed(4)}; }
    out[name]=rec; console.error(JSON.stringify(rec)); }
  return out; })()
