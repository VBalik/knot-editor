(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  const detDist=(k)=>{ const m={}; for(let t=0;t<k;t++){ const v=_detRobust(1); m[v]=(m[v]||0)+1; } return m; };
  const snap=(tag)=>{ const eg=energyGrad(false); let err=0; for(let i=0;i<N;i++){ const e=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(e>err) err=e; }
    return {tag, inflate:+_inflate.toFixed(4), E:eg.E, gminPartial_L0:+(eg.gmin/L0).toFixed(3), trueGap_L0:+(minSegGap()/L0).toFixed(3), capWouldBe_L0:+(Math.min(0.25*L0,0.45*eg.gmin)/L0).toFixed(3), lenErr:+(err/L0).toExponential(1), det:detDist(9)}; };
  // повторяем стадии startPhysics вручную (порядок как в коде)
  _inflate=1; out.s0=snap('после лифта, _inflate=1 (как в startPhysics)');
  out.feas=startFeasibility(300); out.s1=snap('после startFeasibility(300)');
  { const g0=minSegGap(); for(let i=0;i<N;i++){ _fx[i]=Math.random()-0.5; _fy[i]=Math.random()-0.5; _fz[i]=Math.random()-0.5; }
    dirTangentProject(8); removeRigidModes(); const fm=fieldMax(); const amp=Math.min(0.02*L0, 0.3*g0);
    if(fm>1e-12){ const k=amp/fm; for(let i=0;i<N;i++){ verts[i].x+=k*_fx[i]; verts[i].y+=k*_fy[i]; verts[i].z+=k*_fz[i]; } }
    out.s2=snap('после шума (до проекции)'); out.projErr=projectLengthsSafe(40); out.s3=snap('после projectLengthsSafe(40)'); }
  return out; })()
