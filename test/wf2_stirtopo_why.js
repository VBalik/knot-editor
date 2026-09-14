// wf2 review: why do stir steps get rejected on tight knots? Replicates stirStep with the same field and classifies:
// E=inf (hard core), gmin cert, mvT cert; also tests whether halving the amplitude (backtracking) would pass.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  const knot=process.env.WF2_KNOT||'cinquefoil';
  H.el('clear').onclick(); if(knot.startsWith('rand')) randomKnot(+knot.slice(4)); else H.clickPreset(knot); H.set({ms:1});
  if(!running) H.play(); out.run1=runToEnd(15000); out.N=N;
  const g=energyGrad(false); out.before={gmin_s:+(g.gmin/sExcl()).toFixed(3), gminRep_s:+(g.gminRep/sExcl()).toFixed(3), s_L0:+(sExcl()/L0).toFixed(3)};
  const cls={inf:0, gminCert:0, mvTCert:0, ok:0, okHalf:0, okQuarter:0, okEighth:0, never:0}; const trials=+(process.env.WF2_TRIALS||60);
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
  out.trials=trials; out.classes=cls;
  return out; })()
