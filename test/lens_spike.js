// LENS (i)/(iii): anchor spikes from the pair correction with the 2.21 amplitude vs the 2.20 amplitude (0.3+0.7·rnd):
// kinks (max turning angle), spike heights at anchors, lift bend energy, and a 1-try descent on the same diagram
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  const src=liftFromDiagram.toString(); if(!src.includes('0.8+0.4*rnd()')) return {err:'pattern not found'};
  const liftNew=liftFromDiagram, liftOld=(0,eval)('('+src.replace('0.8+0.4*rnd()','0.3+0.7*rnd()')+')');
  function liftStats(){ const n=N; let thMax=0, nKink=0, bE=0; const th=new Float64Array(n);
    for(let i=0;i<n;i++){ const a=verts[(i-1+n)%n], b=verts[i], c=verts[(i+1)%n]; const ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z, vx=c.x-b.x,vy=c.y-b.y,vz=c.z-b.z;
      const cx=uy*vz-uz*vy, cy=uz*vx-ux*vz, cz=ux*vy-uy*vx; const t=Math.atan2(Math.hypot(cx,cy,cz), ux*vx+uy*vy+uz*vz); th[i]=t; bE+=t*t; thMax=Math.max(thMax,t); if(t>Math.PI/2) nKink++; }
    // spike: |z_i - mean(z_{i±4})| / L0 max
    let spike=0; for(let i=0;i<n;i++){ const m=0.5*(verts[(i+4)%n].z+verts[(i-4+n)%n].z); spike=Math.max(spike, Math.abs(verts[i].z-m)/L0); }
    let zmin=1e9,zmax=-1e9; for(const v of verts){ zmin=Math.min(zmin,v.z); zmax=Math.max(zmax,v.z); }
    return {N:n, thMaxDeg:+(thMax*180/Math.PI).toFixed(1), nKink90:nKink, bE:+bE.toFixed(2), spike_L0:+spike.toFixed(2), zExt:+(zmax-zmin).toFixed(2), gRep_s:+(minSegGapRep()/sNominal()).toFixed(3)}; }
  function runToEnd(budget){ let o=null, st=0; const t0=Date.now(); while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running, ms:Date.now()-t0}; }
  for(const [name,target] of [['rand20a',20],['rand20b',20]]){
    H.el('clear').onclick(); if(H.running()) H.play();
    let t=0; do{ randomKnot(target); }while(isUnknot && t++<30);
    const rec={cross:crossings.length, det2d:knotDet, base:liftStats()};
    for(const [tag,fn] of [['new',liftNew],['old',liftOld]]){
      liftFromDiagram=fn;
      const lifts=[]; for(let k=0;k<4;k++){ fn(Math.random); lifts.push(liftStats()); }
      // 1-try descent (startPhysics builds its own random lift with fn)
      liftNew(null); _fromLift=true; _liftFromDiagram=true; H.set({ms:1}); _msContinue=false; startPhysics();
      const st={inflate0:+_inflate.toFixed(3), N, unstick:_dbgUnstick};
      const r=runToEnd(8000); rec[tag]={lifts, start:st, run:{...r, E:+_ePrev.toPrecision(4), detEnd:_dbgDetEnd, inflate:_inflate, status:H.dbg().status.slice(0,90)}};
    }
    liftFromDiagram=liftNew; out[name]=rec; console.error(name, JSON.stringify(rec).slice(0,900)); }
  return out; })()
