// LENS 2.21: геометрия кубического лифта — точность якорей, порядок над/под в 3D-ломаной,
// рост длины/толщины, зазоры на старте. Рецентровка отключена, чтобы xy вершин совпадали с xyAt(s).
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  const recenter0=recenter;
  function analyze(tag){
    const n=N; const v=verts;
    let L3=0, emin=1e9, emax=0, slopeMax=0; for(let i=0;i<n;i++){ const a=v[i], b=v[(i+1)%n]; const e=a.distanceTo(b); L3+=e; emin=Math.min(emin,e); emax=Math.max(emax,e); slopeMax=Math.max(slopeMax, Math.abs(b.z-a.z)/Math.max(1e-12, Math.hypot(b.x-a.x,b.y-a.y))); }
    const L2=totalLen2D*worldScale;
    let zmin=1e9,zmax=-1e9,xmin=1e9,xmax=-1e9,ymin=1e9,ymax=-1e9; for(const p of v){ zmin=Math.min(zmin,p.z); zmax=Math.max(zmax,p.z); xmin=Math.min(xmin,p.x); xmax=Math.max(xmax,p.x); ymin=Math.min(ymin,p.y); ymax=Math.max(ymax,p.y); }
    // якоря: для каждого пересечения ищем вершины с xy == мировые координаты пересечения
    let exact2=0, exact1=0, exact0=0, bad=0, worstMargin=Infinity; const badList=[];
    for(const c of crossings){
      const wx=(c.x-worldCx)*worldScale, wy=-(c.y-worldCy)*worldScale;
      const hits=[]; for(let i=0;i<n;i++){ if(Math.hypot(v[i].x-wx, v[i].y-wy)<1e-6) hits.push(i); }
      if(hits.length>=2){ exact2++; hits.sort((a,b)=>a-b);
        // индекс монотонен по s от первого якоря; sA<sB ⇒ прядь A — меньший индекс
        const iA=(c.sA<c.sB)? hits[0] : hits[hits.length-1], iB=(c.sA<c.sB)? hits[hits.length-1] : hits[0];
        const m=(v[iA].z-v[iB].z)*(c.over==='A'?1:-1); worstMargin=Math.min(worstMargin, m);
        if(m<=0){ bad++; badList.push({iA,iB,zA:+v[iA].z.toFixed(3), zB:+v[iB].z.toFixed(3), over:c.over}); } }
      else if(hits.length===1) exact1++; else exact0++;
    }
    const gRep=minSegGapRep(), g=minSegGap();
    return {tag, N:n, L0:+L0.toFixed(4), L3:+L3.toFixed(2), L2:+L2.toFixed(2), L3_L2:+(L3/L2).toFixed(3), edge:[+(emin/L0).toFixed(3), +(emax/L0).toFixed(3)], slopeMax:+slopeMax.toFixed(2),
      ext:[+(xmax-xmin).toFixed(2), +(ymax-ymin).toFixed(2), +(zmax-zmin).toFixed(2)], span:+(6).toFixed(1),
      det2d:knotDet, detZ:_detProj(0), detR:_detRobust(3), cross:crossings.length, exact2, exact1, exact0, badOver:bad, worstMargin:+worstMargin.toFixed(4), badList:badList.slice(0,3),
      s_L0:+(sNominal()/L0).toFixed(3), sNom:+sNominal().toFixed(4), u:+unitLen().toFixed(4), gRep_s:+(gRep/sNominal()).toFixed(3), g_L0:+(g/L0).toFixed(3)};
  }
  const cases=[['trefoil', ()=>H.clickPreset('trefoil')], ['figure8', ()=>H.clickPreset('figure8')],
    ['rand12', ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<20); }],
    ['rand20a', ()=>{ let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); }],
    ['rand20b', ()=>{ let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); }],
    ['rand30a', ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<20); }],
    ['rand30b', ()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<20); }]];
  for(const [name, prep] of cases){
    H.el('clear').onclick(); if(H.running()) H.play(); prep();
    recenter=()=>{};                      // без рецентровки: xy вершин == xyAt(s)
    liftFromDiagram(null); const base=analyze('base');
    const tries=[]; for(let k=0;k<4;k++){ liftFromDiagram(Math.random); tries.push(analyze('try'+k)); }
    recenter=recenter0;
    out[name]={cross:crossings.length, det2d:knotDet, base, tries};
    console.error(name, JSON.stringify(out[name]).slice(0,600));
  }
  return out; })()
