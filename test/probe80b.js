(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  randomKnot(Number(process.env.TARGET||80));
  const errL=()=>{ let e=0; for(let i=0;i<N;i++){ const d=Math.abs(verts[(i+1)%N].distanceTo(verts[i])-L0); if(d>e) e=d; } return e/L0; };
  const trace=[]; let it=0;
  const oU=unstickLift; unstickLift=function(m){ const g0=minSegGap()/L0, e0=errL(); const r=oU(m); trace.push({it:it++, k:'U', pushes:r, g0:+g0.toFixed(5), g1:+(minSegGap()/L0).toFixed(5), e0:+e0.toExponential(2), e1:+errL().toExponential(2)}); return r; };
  const oP=projectLengths; projectLengths=function(k){ const g0=minSegGap()/L0, e0=errL(); const cap=_projCap/L0; oP(k); trace.push({k:'P', cap:+cap.toFixed(5), g0:+g0.toFixed(5), g1:+(minSegGap()/L0).toFixed(5), e0:+e0.toExponential(2), e1:+errL().toExponential(2)}); };
  const oS=startFeasibility; startFeasibility=function(m){ const r=oS(m); r.gapAfter=+(minSegGap()/L0).toFixed(5); r.gT=+(0.05*thickDNominal()/L0).toFixed(5); trace.push(r); return r; };
  H.play();
  const feas=trace.pop();
  // сжать: первые 30 записей, затем каждую 20-ю, и последние 10
  const sel=trace.filter((_,i)=> i<30 || i%20===0 || i>=trace.length-10);
  return {feas, n:trace.length, sel}; })()
