(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  // те же направления, что в _detRobust (seed 8675309)
  function dirs(k){ let sd=8675309; const rnd=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; }; const r=[];
    for(let t=0;t<k;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
      const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0];
      let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
      const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]]; r.push([e1,e2,d]); } return r; }
  // «запас невырожденности» проекции: минимальное расстояние параметров t,u до 0/1 среди принятых И отброшенных по порогу 1e-9 пересечений; min|den|
  function margin(e1,e2){ const P=verts.map(v=>[v.x*e1[0]+v.y*e1[1]+v.z*e1[2], v.x*e2[0]+v.y*e2[1]+v.z*e2[2]]);
    let mT=1, mDen=Infinity, nearDrop=0, cnt=0;
    for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const jp=(j+1)%N;
      const p1=P[i],p2=P[ip],p3=P[j],p4=P[jp]; const d1x=p2[0]-p1[0],d1y=p2[1]-p1[1],d2x=p4[0]-p3[0],d2y=p4[1]-p3[1];
      const den=d1x*d2y-d1y*d2x; mDen=Math.min(mDen,Math.abs(den)); if(Math.abs(den)<1e-12) continue;
      const tt=((p3[0]-p1[0])*d2y-(p3[1]-p1[1])*d2x)/den, u=((p3[0]-p1[0])*d1y-(p3[1]-p1[1])*d1x)/den;
      if(tt<-1e-6||tt>1+1e-6||u<-1e-6||u>1+1e-6) continue;   // далеко вне отрезков — неинтересно
      const m=Math.min(Math.abs(tt),Math.abs(1-tt),Math.abs(u),Math.abs(1-u)); mT=Math.min(mT,m);
      if(m<=1e-9) nearDrop++; else cnt++; } }
    return {cross:cnt, dropped:nearDrop, minParamMargin:+mT.toExponential(2), minDen:+mDen.toExponential(2)}; }
  function snap(label, ref){ const D=dirs(5); const vals=D.map(([e1,e2,d])=>_detProjBasis(e1,e2,d)); const mg=D.slice(0,3).map(([e1,e2])=>margin(e1,e2));
    const r3=_detRobust(3), r5=_detRobust(5); const wrong3=vals.slice(0,3).filter(v=>v!==ref).length;
    return {label, ref, vals3:vals.slice(0,3), vals5:vals, detRobust3:r3, detRobust5:r5, wrongOf3:wrong3, margins3:mg}; }
  const run=(name, setup)=>{ setup(); const d0=H.dbg(); const ref2d=d0.knotDet; const rec={name, N:d0.N, nc2d:d0.crossings.length, det2d:ref2d};
    rec.freshLift=snap('fresh lift', ref2d);
    if(!H.running()) H.play(); const runDet=H.dbg().runDet; rec.runDet=runDet;
    let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running||st>=12000) break; }
    if(H.running()) H.play();
    rec.steps=st; rec.settled=!o.running; rec.status=H.dbg().status.slice(0,90);
    rec.rest=snap('rest', runDet>0?runDet:ref2d); rec.detEndTrace=window.__knotTrace().detEnd; out.push(rec); };
  for(const k of ['trefoil','figure8','cinquefoil','septafoil']) run(k, ()=>H.clickPreset(k));
  let s=7; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  for(const t of [10,20,40,60,90]) run('rand'+t, ()=>randomKnot(t));
  return out; })()
