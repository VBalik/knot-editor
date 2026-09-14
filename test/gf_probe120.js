// Зонд: фильтрованный gmin (energyGrad) vs точный minSegGap на каждом принятом
// шаге; сертификат 2·mvT < gExact; фаза надувания: gF/D_eff.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=777; Math.random=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
  function exactGap(P){ const n=P.length; let m=Infinity;
    for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){ const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const d=_closestSeg(V3(P[i]),V3(P[(i+1)%n]),V3(P[j]),V3(P[(j+1)%n])).dist; if(d<m) m=d; } return m; }
  const snap=()=>verts.map(v=>[v.x,v.y,v.z]);
  const origProj=projectLengths; let projLog=[];
  projectLengths=function(iter){
    if(_projOnce){ const P0=snap(); const gF=energyGrad(false).gmin; const gE=exactGap(P0); origProj(iter); const P1=snap();
      let mv=0,emax=0; for(let i=0;i<N;i++){ const d=Math.hypot(P1[i][0]-P0[i][0],P1[i][1]-P0[i][1],P1[i][2]-P0[i][2]); if(d>mv) mv=d;
        const e=Math.hypot(P1[i][0]-P1[(i+1)%N][0],P1[i][1]-P1[(i+1)%N][1],P1[i][2]-P1[(i+1)%N][2]); if(e>emax) emax=e; }
      projLog.push({gF:gF/L0, gE:gE/L0, mv:mv/L0, emax:emax/L0}); return; }
    origProj(iter); };
  function runOne(name, load, thick, maxSteps){
    projLog=[]; load(); if(thick) _thickScale=thick;
    const rec={name, N, thick:+_thickScale.toFixed(3), D_L0:+(thickDNominal()/L0).toFixed(3), det2d:knotDet};
    if(!H.running()) H.play();
    rec.start={projCalls:projLog.length, filtGtExact:projLog.filter(r=>r.gF>r.gE*1.0001).length,
      maxRatioProj:+Math.max(0,...projLog.map(r=>2*r.mv/r.gE)).toFixed(3), emax:+Math.max(0,...projLog.map(r=>r.emax)).toFixed(3),
      inflate0:+_inflate.toFixed(4)};
    const st={acc:0, sat:0, filtGtExact:0, maxGfOverGe:0, maxRatio:0, maxGfOverDinfl:0, inflSteps:0, maxMv:0, worst:null};
    let steps=0;
    while(running && steps<maxSteps){
      const P0=snap(); const gE=exactGap(P0); const infl0=_inflate, D0=thickD();
      relaxStep(); steps++;
      if(_dbgTier<0) continue;
      st.acc++; const gF=_dbgGmin, R=D0+1.5*L0;
      if(gF>=R*0.999) st.sat++;
      if(gF>gE*1.0001) st.filtGtExact++;
      st.maxGfOverGe=Math.max(st.maxGfOverGe, gF/gE);
      if(infl0<1){ st.inflSteps++; st.maxGfOverDinfl=Math.max(st.maxGfOverDinfl, gF/D0); }
      const P1=snap(); let mv=0; for(let i=0;i<N;i++){ const d=Math.hypot(P1[i][0]-P0[i][0],P1[i][1]-P0[i][1],P1[i][2]-P0[i][2]); if(d>mv) mv=d; }
      st.maxMv=Math.max(st.maxMv, mv/L0);
      const ratio=2*mv/gE; if(ratio>st.maxRatio){ st.maxRatio=ratio; st.worst={step:steps, mv:+(mv/L0).toFixed(4), gE:+(gE/L0).toFixed(4), gF:+(gF/L0).toFixed(4), D:+(D0/L0).toFixed(3), infl:+infl0.toFixed(3)}; }
    }
    if(H.running()) H.play();
    for(const k of ['maxGfOverGe','maxRatio','maxGfOverDinfl','maxMv']) st[k]=+st[k].toFixed(4);
    rec.steps=steps; rec.settled=!running; rec.inflateEnd=+_inflate.toFixed(3); rec.run=st; rec.detEnd=_detRobust(5);
    return rec;
  }
  const out=[]; out.push(runOne("rand120_ui", ()=>randomKnot(120), 0, 700)); return out;
  out.push(runOne('trefoil', ()=>H.clickPreset('trefoil'), 0, 1500));
  out.push(runOne('trefoil_t022', ()=>H.clickPreset('trefoil'), 0.22, 1500));
  out.push(runOne('figure8_t022', ()=>H.clickPreset('figure8'), 0.22, 1500));
  out.push(runOne('septafoil_t022', ()=>H.clickPreset('septafoil'), 0.22, 1500));
  out.push(runOne('rand30', ()=>randomKnot(30), 0, 1200));
  out.push(runOne('rand30_t022', ()=>randomKnot(30), 0.22, 1200));
  out.push(runOne('rand60_t022', ()=>randomKnot(60), 0.22, 800));
  return out;
})()
