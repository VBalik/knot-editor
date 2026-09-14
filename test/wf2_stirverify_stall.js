// wf2 verify: does Stir stall on contact-tight knots because the field amplitude is never backtracked?
// Independent reproduction: page-default sliders, ms=1, run to rest, real stirStep x300; then replay
// captured fields at cap/2^h to classify the rejection cause; then a hypothetical backtracking loop.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const knots=(process.env.WF2_KNOTS||'cinquefoil,septafoil,trefoil').split(',');
  const doBT=process.env.WF2_BT!=='0';
  for(const name of knots){
    H.el('clear').onclick(); if(name.startsWith('rand')) randomKnot(+name.slice(4)); else H.clickPreset(name);
    H.set({ms:1});
    const rec={N, thick:thickCoef, rep:repCoef, s_L0:+(sExcl()/L0).toFixed(3)};
    if(!running) H.play(); rec.run1=runToEnd(20000); rec.status1=H.dbg().status.slice(0,60);
    const g=energyGrad(false); rec.before={gmin_s:+(g.gmin/sExcl()).toFixed(3), gminRep_s:+(g.gminRep/sExcl()).toFixed(3), cap_s:+(Math.min(0.35*g.gmin,0.5*L0)/sExcl()).toFixed(3)};
    const rest=verts.map(v=>v.clone());
    // (A) the real stir
    const R0=knotRadius();
    const r=window.__knotStir(300); rec.stir=r.dbg; rec.stirRet={stir:r.stir, running:r.running, i:r.i};
    const g1=energyGrad(false); rec.afterStir={grow:+(knotRadius()/R0).toFixed(3), gminRep_s:+(g1.gminRep/sNominal()).toFixed(3), inflate:+_inflate.toFixed(4), msK:_msK, runNote:_runNote, status:H.dbg().status.slice(0,100)};
    // stop the new series so it does not interfere; restore rest shape
    H.el('clear').onclick(); if(name.startsWith('rand')) randomKnot(+name.slice(4)); else H.clickPreset(name); H.set({ms:1});
    window.__knotSetVerts(rest.map(v=>[v.x,v.y,v.z])); _inflate=1; _energyDirty=true;
    const chk=energyGrad(false); rec.restored={gmin_s:+(chk.gmin/sExcl()).toFixed(3), E:isFinite(chk.E)};
    // (B) classify: replay captured fields at cap/2^h, h=0..3
    const cls={inf:0, gminCert:0, mvTCert:0, ok:0, okHalf:0, okQuarter:0, okEighth:0, never:0}; const trials=40;
    const x0=verts.map(v=>v.clone());
    for(let t=0;t<trials;t++){
      stirField(); const n=N, g0=energyGrad(false), gm0=g0.gmin;
      for(let i=0;i<n;i++){ _fx[i]=_stirUx[i]; _fy[i]=_stirUy[i]; _fz[i]=_stirUz[i]; }
      dirTangentProject(8); removeRigidModes(); let fm=0; for(let i=0;i<n;i++) fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i]));
      const cap=Math.max(Math.min(0.35*gm0,0.5*L0),1e-6*L0);
      const fx=Float64Array.from(_fx), fy=Float64Array.from(_fy), fz=Float64Array.from(_fz);
      let firstOk=-1, cause=null;
      for(let h=0;h<4;h++){ const a=cap/fm/Math.pow(2,h);
        for(let i=0;i<n;i++){ verts[i].x=x0[i].x+a*fx[i]; verts[i].y=x0[i].y+a*fy[i]; verts[i].z=x0[i].z+a*fz[i]; }
        projectLengthsSafe(40); const e1=energyGrad(false); let mvT=0; for(let i=0;i<n;i++) mvT=Math.max(mvT, verts[i].distanceTo(x0[i]));
        const cInf=!isFinite(e1.E), cG=!(e1.gmin>0.55*Math.min(gm0,sExcl())), cM=!(mvT<0.5*Math.min(gm0,5*sExcl()+0.5*L0));
        if(h===0) cause = cInf? 'inf' : cG? 'gminCert' : cM? 'mvTCert' : 'ok';
        if(!cInf && !cG && !cM){ firstOk=h; break; } }
      for(let i=0;i<n;i++) verts[i].copy(x0[i]);
      cls[cause]++; if(firstOk===1) cls.okHalf++; else if(firstOk===2) cls.okQuarter++; else if(firstOk===3) cls.okEighth++; else if(firstOk<0) cls.never++;
    }
    rec.classify=cls;
    // (C) hypothetical: same stir loop but backtrack amplitude (x0.5, up to 3 times) before redrawing
    if(doBT){
      for(let i=0;i<N;i++) verts[i].copy(rest[i]); _energyDirty=true;
      const Rb=knotRadius(); let rej=0, acc=0, byH=[0,0,0,0]; stirField();
      for(let step=0; step<300; step++){
        const n=N, g0=energyGrad(false), gm0=g0.gmin;
        if(step>0 && step%40===0) stirField();
        for(let i=0;i<n;i++){ _fx[i]=_stirUx[i]; _fy[i]=_stirUy[i]; _fz[i]=_stirUz[i]; }
        dirTangentProject(8); removeRigidModes(); let fm=0; for(let i=0;i<n;i++) fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i]));
        if(fm<1e-300){ stirField(); continue; }
        const cap=Math.max(Math.min(0.35*gm0,0.5*L0),1e-6*L0); const xs=verts.map(v=>v.clone()); let ok=false;
        for(let h=0;h<4;h++){ const a=cap/fm/Math.pow(2,h);
          for(let i=0;i<n;i++){ verts[i].x=xs[i].x+a*_fx[i]; verts[i].y=xs[i].y+a*_fy[i]; verts[i].z=xs[i].z+a*_fz[i]; }
          projectLengthsSafe(40); const e1=energyGrad(false); let mvT=0; for(let i=0;i<n;i++) mvT=Math.max(mvT, verts[i].distanceTo(xs[i]));
          ok=isFinite(e1.E) && e1.gmin>0.55*Math.min(gm0,sExcl()) && mvT<0.5*Math.min(gm0,5*sExcl()+0.5*L0);
          if(ok){ byH[h]++; break; } }
        if(!ok){ for(let i=0;i<n;i++) verts[i].copy(xs[i]); rej++; stirField(); } else { acc++; recenter(); }
      }
      const gb=energyGrad(false);
      rec.backtrack={rejected:rej, accepted:acc, acceptedAtHalving:byH, grow:+(knotRadius()/Rb).toFixed(3), gminRep_s:+(gb.gminRep/sExcl()).toFixed(3), det:_detRobust(3)};
    }
    out[name]=rec;
  }
  return out; })()
