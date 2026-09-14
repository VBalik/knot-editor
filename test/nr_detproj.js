(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={N, det2d:knotDet};
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  const dist=(k)=>{ const m={}; let sd=8675309; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; };
    const vals=[];
    for(let t=0;t<k;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
      const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0]; let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
      const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]];
      const v=_detProjBasis(e1,e2,d); vals.push(v); m[v]=(m[v]||0)+1; }
    for(const ax of [0,1,2]){ const v=_detProj(ax); m['axis'+ax+':'+v]=1; }
    return {first3:vals.slice(0,3), hist:m}; };
  out.lift={gap_L0:+(minSegGap()/L0).toFixed(4), ...dist(20), robust3:_detRobust(3), robust5:_detRobust(5)};
  if(!H.running()) H.play();
  out.afterStart={gap_L0:+(minSegGap()/L0).toFixed(4), ...dist(20), robust3:_detRobust(3), robust5:_detRobust(5), runDet:_runDet};
  H.step(1000); out.after1000={gap_L0:+(minSegGap()/L0).toFixed(4), ...dist(20), robust3:_detRobust(3), robust5:_detRobust(5)};
  if(H.running()) H.play(); return out; })()
