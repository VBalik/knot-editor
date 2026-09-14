(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  let seedTry=0; let found=false;
  for(let k=0;k<6 && !found;k++){ randomKnot(30); const D=thickDNominal(); const gT=0.05*D;
    // replicate startFeasibility loop with instrumentation
    const n=N; const rows=[];
    for(let it=0; it<300; it++){
      let err=0; for(let i=0;i<n;i++){ const e=Math.abs(verts[(i+1)%n].distanceTo(verts[i])-L0); if(e>err) err=e; }
      const gBefore=minSegGap();
      if(err<1e-9*L0 && gBefore>=gT){ rows.push({it, done:true}); break; }
      const p=unstickLift(6); const gAfterU=minSegGap();
      let gAfterP=null;
      if(!(err<1e-9*L0)){ const g=energyGrad(false).gmin; _projCap=Math.min(0.25*L0,0.45*g); _projOnce=true; projectLengths(1); _projOnce=false; _projCap=0; gAfterP=minSegGap(); }
      if(it<4 || it>296) rows.push({it, errL0:+(err/L0).toExponential(1), gBefore_gT:+(gBefore/gT).toFixed(5), pushes:p, gAfterU_gT:+(gAfterU/gT).toFixed(5), gAfterP_gT: gAfterP==null?null:+(gAfterP/gT).toFixed(5)});
      if(it===299) found=true;
    }
    out['try'+k]={nc:crossings.length, rows};
  }
  return out; })()
