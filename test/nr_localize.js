(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N, det2d:knotDet};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  const copy=()=>verts.map(v=>[v.x,v.y,v.z]); const restore=(c)=>{ for(let i=0;i<N;i++) verts[i].set(c[i][0],c[i][1],c[i][2]); };
  // ТОЧНО как startPhysics (без вызовов det до шума — они потребляют Math.random)
  const A=copy(); _inflate=1; _inflStall=0; _inflJammed=false;
  const feas=startFeasibility(300); const B=copy();
  const g0=minSegGap();
  for(let i=0;i<N;i++){ _fx[i]=Math.random()-0.5; _fy[i]=Math.random()-0.5; _fz[i]=Math.random()-0.5; }
  dirTangentProject(8); removeRigidModes(); const fm=fieldMax(); const amp=Math.min(0.02*L0, 0.3*g0);
  if(fm>1e-12){ const k=amp/fm; for(let i=0;i<N;i++){ verts[i].x+=k*_fx[i]; verts[i].y+=k*_fy[i]; verts[i].z+=k*_fz[i]; } }
  const C=copy(); const perr=projectLengthsSafe(40); const D=copy();
  const dist=(k)=>{ const m={}; let sd=8675309; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; };
    for(let t=0;t<k;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
      const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0]; let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
      const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]];
      const v=_detProjBasis(e1,e2,d); m[v]=(m[v]||0)+1; } return m; };
  const maxMove=(P,Q)=>{ let m=0; for(let i=0;i<N;i++) m=Math.max(m, Math.hypot(P[i][0]-Q[i][0],P[i][1]-Q[i][1],P[i][2]-Q[i][2])); return +(m/L0).toFixed(4); };
  const stage=(tag,c,prev)=>{ restore(c); return {tag, gap_L0:+(minSegGap()/L0).toFixed(4), det:dist(12), moveFromPrev_L0: prev?maxMove(c,prev):null}; };
  out.A=stage('лифт',A,null); out.B=stage('после startFeasibility',B,A); out.B.feas=feas; out.C=stage('после шума',C,B); out.C.amp_L0=+(amp/L0).toFixed(4); out.C.g0_L0=+(g0/L0).toFixed(4);
  out.D=stage('после projectLengthsSafe(40)',D,C); out.D.perr=perr;
  return out; })()
