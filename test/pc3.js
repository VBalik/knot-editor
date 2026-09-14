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
  const fd=(h)=>{ const g=energyGrad(true); const n=N; const gx=Array.from(_fx),gy=Array.from(_fy),gz=Array.from(_fz); let worst=0, info=null, worstAbs=0; const f=fg();
    for(let idx=0;idx<n;idx++) for(const ax of ['x','y','z']){ const v=verts[idx], old=v[ax]; v[ax]=old+h; const Ep=energyGrad(false).E; v[ax]=old-h; const Em=energyGrad(false).E; v[ax]=old;
      const num=-(Ep-Em)/(2*h), ana=(ax==='x'?gx:ax==='y'?gy:gz)[idx]; const rel=Math.abs(num-ana)/Math.max(1e-6*Math.abs(g.E)/L0, Math.abs(num), Math.abs(ana)); if(rel>worst){ worst=rel; info={idx,ax,num,ana}; } worstAbs=Math.max(worstAbs, Math.abs(num-ana)); }
    return {E:g.E, worstRel:+worst.toExponential(2), worstAbs_rel_gradscale:+(worstAbs*L0/(2*kBend())).toExponential(2), info, nWedge:f.nWedge, nHalo:f.nHalo, minDl_s:+(f.minDl/sNominal()).toFixed(3)}; };
  const run=(prep,w,r,maxB)=>{ prep(); H.setSlider('thick',w); H.setSlider('repCoef',r); return runTo(maxB||800); };
  // (г) градиент: равновесие w5r2 трилистник, все вершины
  run(()=>H.clickPreset('trefoil'),5,2); out.grad_eq_trefoil=fd(1e-6*L0);
  // ранняя стадия: septafoil w10r10 после 10 шагов (контакты тесные, надувание)
  H.clickPreset('septafoil'); H.setSlider('thick',10); H.setSlider('repCoef',10); if(!H.running()) H.play(); H.step(10); out.grad_early_sept=fd(1e-6*L0); out.grad_early_sept.inflate=window.__knotTrace().inflate;
  // поиск состояния с парами в клине (0<wArg<1) по ходу спуска
  let found=null; for(let b=0;b<40 && H.running();b++){ H.step(5); const f=fg(); if(f.nWedge>0){ found={atStep:(b+1)*5+10, nWedge:f.nWedge, chk:fd(1e-6*L0)}; break; } }
  out.wedgeState=found||'no wedge pairs in first 200 steps'; if(H.running()) H.play();
  // синтетика: шпилька — две антипараллельные ветви на расстоянии ~s c параллельными ножками: пары с wArg в клине гарантированы
  { H.clickPreset('trefoil'); const n=N; const V=[]; const s=sNominal(); const R=0.7*s, per=n; // стадион: длина = 2*straight + 2*pi*R
    const straight=(n*L0-2*Math.PI*R)/2; const P=2*straight+2*Math.PI*R;
    for(let i=0;i<n;i++){ const t=i/n*P; let p; if(t<straight) p=[t-straight/2, -R, 0]; else if(t<straight+Math.PI*R){ const a=(t-straight)/R; p=[straight/2+R*Math.sin(a), -R*Math.cos(a), 0]; } else if(t<2*straight+Math.PI*R) p=[straight/2-(t-straight-Math.PI*R), R, 0]; else { const a=(t-2*straight-Math.PI*R)/R; p=[-straight/2-R*Math.sin(a), R*Math.cos(a), 0]; }
      p[2]=0.03*L0*Math.sin(7*i); V.push(p); }
    window.__knotSetVertsRaw(V); const f=fg(); out.stadium={R_s:0.7, gapF_s:+(f.gminF/s).toFixed(3), nWedge:f.nWedge, nHalo:f.nHalo, nCore:f.nCore};
    // ядро при R=0.7s => 2R=1.4s > s: допустимо; в клине пары есть?
    out.stadium.chk=fd(1e-6*L0); }
  // (в) смена ползунка НА ХОДУ: трилистник w1 r1, 100 шагов, затем w=10,r=10
  H.clickPreset('trefoil'); H.setSlider('thick',1); H.setSlider('repCoef',1); if(!H.running()) H.play(); H.step(100);
  const before={E:window.__knotTrace().E, gapF_L0:+(fg().gminF/L0).toFixed(3), running:H.running()};
  H.setSlider('thick',10); H.setSlider('repCoef',10);
  const g=energyGrad(false); const after0={E:g.E, s_L0:+(sExcl()/L0).toFixed(3), gapF_L0:+(fg().gminF/L0).toFixed(3), nCore:fg().nCore, running:H.running(), inflate:window.__knotTrace().inflate};
  let trace=[]; for(let b=0;b<40 && H.running();b++){ const o=H.step(25); const t=window.__knotTrace(); trace.push({st:(b+1)*25, E:isFinite(t.E)?+t.E.toFixed(4):String(t.E), moved:+t.moved.toFixed(4), stuck:t.stuck, fRel:+t.fRel.toExponential(2), settle:t.settle, gapF_s:+(fg().gminF/sNominal()).toFixed(3), status:o.status.slice(0,40)}); }
  out.midrun={before, after0, settled:!H.running(), last:trace[trace.length-1], trace:trace.filter((_,i)=>i%8===0)};
  if(H.running()) H.play();
  return out; })()
