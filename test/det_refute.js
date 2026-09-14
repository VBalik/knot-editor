(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  for(const seed of [5,11,12,13]){
    let s=seed; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    randomKnot(120);
    // число пересечений в случайных проекциях (те же направления, что в _detRobust)
    let sd=8675309; const rnd=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
    const per=[];
    for(let t=0;t<5;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
      const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0];
      let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
      const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]];
      // считаем пересечения так же, как _detProjBasis
      const P=verts.map(v=>[v.x*e1[0]+v.y*e1[1]+v.z*e1[2], v.x*e2[0]+v.y*e2[1]+v.z*e2[2]]);
      let c=0; for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const jp=(j+1)%N;
        const p1=P[i],p2=P[ip],p3=P[j],p4=P[jp]; const d1x=p2[0]-p1[0],d1y=p2[1]-p1[1],d2x=p4[0]-p3[0],d2y=p4[1]-p3[1];
        const den=d1x*d2y-d1y*d2x; if(Math.abs(den)<1e-12) continue;
        const tt=((p3[0]-p1[0])*d2y-(p3[1]-p1[1])*d2x)/den, u=((p3[0]-p1[0])*d1y-(p3[1]-p1[1])*d1x)/den;
        if(tt<=1e-9||tt>=1-1e-9||u<=1e-9||u>=1-1e-9) continue; c++; } }
      const t0=Date.now(); _detProjBasis(e1,e2,d); per.push({cross:c, ms:Date.now()-t0}); }
    const tD=Date.now(); _detRobust(5); const detMs=Date.now()-tD;
    const tP=Date.now(); H.play(); const playMs=Date.now()-tP; if(running) H.play();
    const tE=Date.now(); _detRobust(3); const det3Ms=Date.now()-tE;
    out.push({seed, nc2D:crossings.length, N, per, detRobust5Ms:detMs, playMsTotal:playMs, detRobust3Ms:det3Ms}); }
  return out; })()
