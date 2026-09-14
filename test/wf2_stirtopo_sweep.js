// wf2 review: STIR topology/physics sweep. Runs physics to completion (ms=1), then stirs step-by-step
// with an exact swept-segment crossing detector between accepted states, measures det, gaps, edge error, growth.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const cfgs=(process.env.WF2_CFG||'default').split(',');
  const knots=(process.env.WF2_KNOTS||'trefoil,figure8,cinquefoil,septafoil,rand20,rand30,rand40').split(',');
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  // exact swept crossing test: segments (a,a+1),(b,b+1), vertices move linearly x0->x1. Volume V(t)=det(P1-P0,Q0-P0,Q1-P0) cubic in t.
  function cross3(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function dot3(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function sub3(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; }
  function lerp(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
  function vol(P0,P1,Q0,Q1){ return dot3(cross3(sub3(P1,P0),sub3(Q0,P0)),sub3(Q1,P0)); }
  function coplanarIntersect(P0,P1,Q0,Q1){ // segments coplanar: check they intersect (2D in plane)
    const d1=sub3(P1,P0), d2=sub3(Q1,Q0), r=sub3(Q0,P0); const n=cross3(d1,d2); const nn=dot3(n,n);
    if(nn<1e-30) return false; // parallel
    const s=dot3(cross3(r,d2),n)/nn, t=dot3(cross3(r,d1),n)/nn; return s>=-1e-9&&s<=1+1e-9&&t>=-1e-9&&t<=1+1e-9; }
  function sweptCross(X0,X1,n){ // returns count of (pair,t) crossings
    let cnt=0, worst=null;
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+2;j<n;j++){ const jp=(j+1)%n; if(i===0&&jp===0) continue; if(j===ip) continue;
      // sample cubic at 4 points and fit -> roots; simpler: sample V at t in [0,1] fine grid + bisection
      const f=(t)=>vol(lerp(X0[i],X1[i],t),lerp(X0[ip],X1[ip],t),lerp(X0[j],X1[j],t),lerp(X0[jp],X1[jp],t));
      // quick reject: min distance at t=0 and t=1 large vs max displacement
      let fp=f(0); const M=12; for(let k=1;k<=M;k++){ const t=k/M, fc=f(t);
        if((fp<0&&fc>0)||(fp>0&&fc<0)||fc===0){ let a=(k-1)/M,b=t,fa=fp; for(let it=0;it<40;it++){ const m=0.5*(a+b), fm=f(m); if((fa<0&&fm<0)||(fa>0&&fm>0)){a=m;fa=fm;} else b=m; }
          const t0=0.5*(a+b); if(coplanarIntersect(lerp(X0[i],X1[i],t0),lerp(X0[ip],X1[ip],t0),lerp(X0[j],X1[j],t0),lerp(X0[jp],X1[jp],t0))){ cnt++; worst={i,j,t:+t0.toFixed(3)}; } }
        fp=fc; } } }
    return {cnt, worst}; }
  function snap(){ return verts.map(v=>[v.x,v.y,v.z]); }
  function edgeErr(){ let e=0; for(let i=0;i<N;i++){ const d=verts[i].distanceTo(verts[(i+1)%N]); e=Math.max(e,Math.abs(d-L0)); } return e/L0; }
  function minCd2(){ let m=Infinity; for(let i=0;i<N;i++){ const j=(i+2)%N; const r=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]); m=Math.min(m,r.dist); } return m/L0; }
  function maxTh(){ return energyGrad(false).maxTh; }
  for(const cfg of cfgs){ for(const name of knots){
    H.el('clear').onclick();
    if(name.startsWith('rand')) randomKnot(+name.slice(4)); else H.clickPreset(name);
    if(cfg==='thick10'){ H.setSlider('thick',10); H.setSlider('repCoef',10); } else { H.setSlider('thick',5); H.setSlider('repCoef',2); }
    H.set({ms:1});
    const d0=H.dbg(); const rec={N:d0.N, nc:d0.crossings.length, det2d:d0.knotDet};
    if(!running) H.play(); rec.run1=runToEnd(+(process.env.WF2_BUDGET||30000)); rec.status1=H.dbg().status.slice(0,80); rec.inflate1=+_inflate.toFixed(4);
    const g=energyGrad(false); rec.before={det:_detRobust(3), gmin_s:+(g.gmin/sExcl()).toFixed(3), edgeErr:+edgeErr().toExponential(2), maxTh:+g.maxTh.toFixed(3), cd2:+minCd2().toFixed(3)};
    const R0=knotRadius();
    if(!stirStart()){ rec.stirStart=false; rec.statusS=H.dbg().status; out[cfg+':'+name]=rec; continue; }
    let crossings=0, worst=null, badEdge=0, worstEdge=0, accepted=0, gminMinS=Infinity, maxMvT=0, maxTh2=0, cd2min=Infinity;
    let X0=snap(); let rej0=_stir.rejected;
    while(_stir && _stir.i<STIR_STEPS-1){
      const gm0=energyGrad(false).gmin; stirStep();
      if(_stir.rejected===rej0){ // accepted (or fm tiny)
        const X1=snap(); let mv=0; for(let i=0;i<N;i++) mv=Math.max(mv,Math.hypot(X1[i][0]-X0[i][0],X1[i][1]-X0[i][1],X1[i][2]-X0[i][2]));
        if(mv>0){ accepted++; const sc=sweptCross(X0,X1,N); if(sc.cnt){ crossings+=sc.cnt; worst=sc.worst; }
          const ee=edgeErr(); if(ee>1e-8){ badEdge++; worstEdge=Math.max(worstEdge,ee); }
          const g1=energyGrad(false); gminMinS=Math.min(gminMinS,g1.gmin/sExcl()); maxMvT=Math.max(maxMvT,mv/gm0); maxTh2=Math.max(maxTh2,g1.maxTh); cd2min=Math.min(cd2min,minCd2()); }
        X0=X1; } else rej0=_stir.rejected;
    }
    const g2=energyGrad(false);
    rec.stirred={rejected:_stir.rejected, accepted, sweptCrossings:crossings, worstCross:worst, det:_detRobust(3), det5:_detRobust(5), gmin_s:+(g2.gmin/sExcl()).toFixed(3), gminMin_s:+gminMinS.toFixed(3), maxMvT_over_gmin0:+maxMvT.toFixed(3), edgeErrNow:+edgeErr().toExponential(2), stepsWithEdgeErr:badEdge, worstEdgeErr:+worstEdge.toExponential(2), grow:+(knotRadius()/R0).toFixed(3), maxTh:+maxTh2.toFixed(3), minCd2_L0:+cd2min.toFixed(3), inflate:+_inflate.toFixed(4)};
    stirStep(); // finish -> startPhysics
    rec.afterFinish={running, msK:_msK, msRound:_msRound, liftIsStirred: _msLift && _msLift.length===N, dbg:window.__knotTrace().stir, runNote:_runNote, liftWarn:_liftWarn, inflate:+_inflate.toFixed(4)};
    out[cfg+':'+name]=rec; } }
  return out; })()
