// wf2 verify (2): root cause of the stir stall. Count foreign contacts near the core before/after the real stir,
// classify fields from the squeezed state, and try three variants: reviewer fix A (backtrack amplitude),
// reviewer fix B (cap by 0.5*(gminRep-s)), and C (reject steps that squeeze gminRep below 1.15*s).
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function contacts(th){ // foreign segment pairs (cd>2, arc-filter) with gap < th*s
    const n=N, s=sExcl(); let c=0; for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+3;j<n;j++){ const jp=(j+1)%n; const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const r=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]); const x=r.dist; if(cd*L0/(2*Math.max(x,1e-12))-1<=0) continue; if(x<th*s) c++; } } return c; }
  function stirVariant(mode, steps){
    const Rb=knotRadius(); let rej=0, acc=0; stirField();
    for(let step=0; step<steps; step++){
      const n=N, g0=energyGrad(false), gm0=g0.gmin;
      if(step>0 && step%40===0) stirField();
      for(let i=0;i<n;i++){ _fx[i]=_stirUx[i]; _fy[i]=_stirUy[i]; _fz[i]=_stirUz[i]; }
      dirTangentProject(8); removeRigidModes(); let fm=0; for(let i=0;i<n;i++) fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i]));
      if(fm<1e-300){ stirField(); continue; }
      let cap=Math.max(Math.min(0.35*gm0,0.5*L0),1e-6*L0);
      if(mode==='B') cap=Math.max(Math.min(cap, 0.5*(g0.gminRep-sExcl())), 1e-6*L0);
      const xs=verts.map(v=>v.clone()); let ok=false; const H=(mode==='A')?4:1;
      for(let h=0;h<H;h++){ const a=cap/fm/Math.pow(2,h);
        for(let i=0;i<n;i++){ verts[i].x=xs[i].x+a*_fx[i]; verts[i].y=xs[i].y+a*_fy[i]; verts[i].z=xs[i].z+a*_fz[i]; }
        projectLengthsSafe(40); const e1=energyGrad(false); let mvT=0; for(let i=0;i<n;i++) mvT=Math.max(mvT, verts[i].distanceTo(xs[i]));
        ok=isFinite(e1.E) && e1.gmin>0.55*Math.min(gm0,sExcl()) && mvT<0.5*Math.min(gm0,5*sExcl()+0.5*L0);
        if(ok && mode==='C') ok = e1.gminRep>=Math.min(g0.gminRep, 1.15*sExcl());
        if(ok) break; }
      if(!ok){ for(let i=0;i<n;i++) verts[i].copy(xs[i]); rej++; stirField(); } else { acc++; recenter(); }
    }
    const gb=energyGrad(false);
    return {rejected:rej, accepted:acc, grow:+(knotRadius()/Rb).toFixed(3), gminRep_s:+(gb.gminRep/sExcl()).toFixed(3), contacts110:contacts(1.10), det:_detRobust(3)};
  }
  for(const name of (process.env.WF2_KNOTS||'cinquefoil,septafoil').split(',')){
    H.el('clear').onclick(); H.clickPreset(name); H.set({ms:1});
    if(!running) H.play(); const rec={run1:runToEnd(20000)};
    const g=energyGrad(false); rec.before={gminRep_s:+(g.gminRep/sExcl()).toFixed(3), contacts110:contacts(1.10), contacts130:contacts(1.30), contacts160:contacts(1.60)};
    const rest=verts.map(v=>v.clone());
    const r=window.__knotStir(300); rec.realStir=r.dbg;
    // stop the auto-started series, keep the stirred (squeezed) shape
    const squeezed=verts.map(v=>v.clone());
    H.el('clear').onclick(); H.clickPreset(name); H.set({ms:1}); window.__knotSetVerts(squeezed.map(v=>[v.x,v.y,v.z])); _inflate=1; _energyDirty=true;
    const gs=energyGrad(false); rec.afterRealStir={gminRep_s:+(gs.gminRep/sExcl()).toFixed(3), contacts110:contacts(1.10), contacts130:contacts(1.30), contacts160:contacts(1.60)};
    // classify fields from the squeezed state
    { const cls={inf:0, okFull:0, okHalf:0, okQuarter:0, okEighth:0, never:0}; const x0=verts.map(v=>v.clone());
      for(let t=0;t<40;t++){ stirField(); const n=N, g0=energyGrad(false), gm0=g0.gmin;
        for(let i=0;i<n;i++){ _fx[i]=_stirUx[i]; _fy[i]=_stirUy[i]; _fz[i]=_stirUz[i]; }
        dirTangentProject(8); removeRigidModes(); let fm=0; for(let i=0;i<n;i++) fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i]));
        const cap=Math.max(Math.min(0.35*gm0,0.5*L0),1e-6*L0); let firstOk=-1;
        for(let h=0;h<4;h++){ const a=cap/fm/Math.pow(2,h);
          for(let i=0;i<n;i++){ verts[i].x=x0[i].x+a*_fx[i]; verts[i].y=x0[i].y+a*_fy[i]; verts[i].z=x0[i].z+a*_fz[i]; }
          projectLengthsSafe(40); const e1=energyGrad(false); let mvT=0; for(let i=0;i<n;i++) mvT=Math.max(mvT, verts[i].distanceTo(x0[i]));
          const ok=isFinite(e1.E) && e1.gmin>0.55*Math.min(gm0,sExcl()) && mvT<0.5*Math.min(gm0,5*sExcl()+0.5*L0);
          if(h===0 && !isFinite(e1.E)) cls.inf++;
          if(ok){ firstOk=h; break; } }
        for(let i=0;i<n;i++) verts[i].copy(x0[i]);
        cls[['okFull','okHalf','okQuarter','okEighth'][firstOk]||'never']++; }
      rec.classifySqueezed=cls; }
    for(const mode of ['A','B','C']){ for(let i=0;i<N;i++) verts[i].copy(rest[i]); _energyDirty=true; rec['variant'+mode]=stirVariant(mode, 300); }
    out[name]=rec;
  }
  return out; })()
