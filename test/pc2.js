(async ()=>{
  let _seed=12345; Math.random=()=>{ _seed=(_seed*1103515245+12345)&0x7fffffff; return _seed/0x7fffffff; };
  const H=global.__H; window.__noAutoSave=true;
  // арк-фильтрованный зазор + разложение энергии/сил (повторяет цикл energyGrad)
  const fg=()=>{ const n=N, S=sExcl(), DC=4*S, D=thickD(), kR=kRep(); let gminF=Infinity, gminAll=Infinity, cdMin=-1, nHalo=0, nWedge=0, nCore=0, Erep=0, minDl=Infinity;
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n; const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<gminAll) gminAll=x;
      const wArg=(cd*L0/(2*Math.max(x,1e-12))-1)/0.15; if(wArg<=0) continue;
      if(x<gminF){ gminF=x; cdMin=cd; } const dl=x-S; if(dl<=0){ nCore++; continue; } if(dl<minDl) minDl=dl;
      if(dl<DC){ nHalo++; if(wArg<1) nWedge++; const w=wArg>=1?1:wArg, sw=w*w*(3-2*w); Erep+=sw*kR*(Math.pow(D/dl,4)-Math.pow(D/DC,4)); } } }
    return {gminF, gminAll, cdMin, nHalo, nWedge, nCore, Erep, minDl}; };
  const decomp=()=>{ const g=energyGrad(true); const n=N; const tot=[]; let fm=0; for(let i=0;i<n;i++){ tot.push([_fx[i],_fy[i],_fz[i]]); fm=Math.max(fm,Math.hypot(_fx[i],_fy[i],_fz[i])); }
    const kb0=KB_PER; KB_PER=1e-12; energyGrad(true); let rm=0, rn=0, tn=0; for(let i=0;i<n;i++){ const r=Math.hypot(_fx[i],_fy[i],_fz[i]); rm=Math.max(rm,r); rn+=r*r; tn+=tot[i][0]**2+tot[i][1]**2+tot[i][2]**2; }
    KB_PER=kb0; const Eb=kBend()*H.bE(); return {E:g.E, Ebend:Eb, Erep:g.E-Eb, repFracE:(g.E-Eb)/g.E, maxFrep_L0:rm*L0/(2*kBend()), maxFtot_L0:fm*L0/(2*kBend()), repNormFrac:Math.sqrt(rn/tn)}; };
  const runTo=(maxB)=>{ if(!H.running()) H.play(); let o=null,st=0; const infl0=window.__knotTrace().inflate; for(let b=0;b<(maxB||600);b++){ o=H.step(25); st+=25; if(!o.running) break; } const wasRunning=H.running(); if(wasRunning) H.play(); return {settled:!wasRunning, steps:st, infl0, status:H.dbg().status}; };
  const metrics=()=>{ const u=unitLen(), s=sNominal(), D=thickDNominal(), f=fg(), d=decomp(), dg=H.dbg(); let maxTh=0; const V=H.verts(), n=V.length; for(let i=0;i<n;i++){ const a=V[(i-1+n)%n],b=V[i],c=V[(i+1)%n]; const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2]; const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx; maxTh=Math.max(maxTh,Math.atan2(Math.hypot(cx,cy,cz),ux*vx+uy*vy+uz*vz)); }
    return {N, w:thickCoef, r:repCoef, u_L0:+(u/L0).toFixed(4), s_L0:+(s/L0).toFixed(3), gapF_L0:+(f.gminF/L0).toFixed(3), gapF_s:+(f.gminF/s).toFixed(3), gapF_u:+(f.gminF/u).toFixed(2), gapAll_L0:+(f.gminAll/L0).toFixed(3), cdMin:f.cdMin, nHalo:f.nHalo, nWedge:f.nWedge, nCore:f.nCore, minDl_s:+(f.minDl/s).toFixed(3), bE:+H.bE().toFixed(4), Ebend:+d.Ebend.toExponential(3), Erep:+d.Erep.toExponential(3), repFracE:+d.repFracE.toExponential(2), maxFrep:+d.maxFrep_L0.toExponential(2), maxFtot:+d.maxFtot_L0.toExponential(2), repNormFrac:+d.repNormFrac.toExponential(2), rvar:+knotDiagnostics().rvar.toFixed(2), det3d:H.det3d(), maxTh:+maxTh.toFixed(3), rhoMin_over_halfD:+((L0/Math.max(maxTh,1e-9))/(D/2)).toFixed(2), inflate:+window.__knotTrace().inflate.toFixed(3)}; };
  const out={};
  const run=(prep,w,r,maxB)=>{ prep(); H.setSlider('thick',w); H.setSlider('repCoef',r); const rr=runTo(maxB||800); return Object.assign(rr, metrics()); };
  const pick=m=>({settled:m.settled,steps:m.steps,infl0:+(+m.infl0).toFixed(3),N:m.N,s_L0:m.s_L0,gapF_L0:m.gapF_L0,gapF_s:m.gapF_s,gapAll_L0:m.gapAll_L0,minDl_s:m.minDl_s,bE:m.bE,repFracE:m.repFracE,rvar:m.rvar,det3d:m.det3d,inflate:m.inflate,status:m.status.slice(0,70)});
  // (а) чувствительность к kR: трилистник w=10 r=2
  out.kR={}; const k0=KR_CONST; for(const f of [0.01,0.1,1,10,100]){ KR_CONST=k0*f; out.kR['x'+f]=pick(run(()=>H.clickPreset('trefoil'),10,2)); } KR_CONST=k0;
  out.kR_w5r2={}; for(const f of [0.01,1,100]){ KR_CONST=k0*f; out.kR_w5r2['x'+f]=pick(run(()=>H.clickPreset('trefoil'),5,2)); } KR_CONST=k0;
  // (б) зависимость от N при той же форме: удвоение вершин
  const dbl=()=>{ const V=H.verts(), n=V.length, arr=[]; for(let i=0;i<n;i++){ const a=V[i], b=V[(i+1)%n]; arr.push(a); arr.push([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); } window.__knotSetVerts(arr); };
  H.clickPreset('trefoil'); const base=run(()=>{},5,2); out.N225=pick(base);
  out.N450=pick(run(dbl,5,2));
  out.N900=pick(run(dbl,5,2,1200));
  // (в) заклинивание: N=450, w=r=10 (1.3·s = 3.9·L0 > 2·L0)
  H.clickPreset('trefoil'); run(()=>{},5,2); dbl();
  out.jam_N450_w10r10=pick(run(()=>{},10,10,1200));
  H.clickPreset('trefoil'); run(()=>{},5,2); dbl();
  out.jam_N450_w5r5=pick(run(()=>{},5,5,1200));
  return out; })()
