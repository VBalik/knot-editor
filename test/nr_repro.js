(async ()=>{ const H=global.__H; window.__noAutoSave=true; const MODE=process.env.MODE||'plain';
  const SEED=+(process.env.SEED||42), W=+(process.env.W||5), R=+(process.env.R||5), TARGET=+(process.env.TARGET||80);
  let seed=SEED; Math.random=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  randomKnot(TARGET); const out={MODE, N};
  if(MODE==='dense'){ const d0=H.dbg(); out.nc=d0.crossings.length; }
  H.setSlider('bendCoef',9); H.setSlider('thick',W); H.setSlider('repCoef',R);
  if(MODE==='arc'){ out.detLift=_detRobust(3); }
  out.seedBeforePlay=seed;
  if(!H.running()) H.play();
  out.seedAfterPlay=seed;
  const dist=(k)=>{ const m={}; let sd=8675309; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; };
    for(let t=0;t<k;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
      const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0]; let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
      const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]];
      const v=_detProjBasis(e1,e2,d); m[v]=(m[v]||0)+1; } return m; };
  let hsh=0; for(const v of verts){ hsh=(hsh*31+Math.round(v.x*1e6)+Math.round(v.y*1e6)*7+Math.round(v.z*1e6)*13)%1000000007; }
  out.afterStart={robust3:_detRobust(3), dist:dist(12), hash:hsh, gap_L0:+(minSegGap()/L0).toFixed(4), inflate:+_inflate.toFixed(4), runDet:_runDet, unstick:_dbgUnstick};
  if(H.running()) H.play(); return out; })()
