// Зонд топологических сертификатов: точный зазор vs фильтрованный gmin,
// сертификат по прямолинейной гомотопии на каждом принятом шаге, cd=2 пары,
// стадии старта (unstick/projectLengths), det по стадиям.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  // детерминированный ГСЧ
  let seed=12345; Math.random=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
  const segDistArr=(P,i,j)=>{ const n=P.length; return _closestSeg(V3(P[i]),V3(P[(i+1)%n]),V3(P[j]),V3(P[(j+1)%n])).dist; };
  function exactGap(P, cdMin){ const n=P.length; let m=Infinity, mi=-1, mj=-1;
    for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){ const cd=Math.min(j-i,n-(j-i)); if(cd<cdMin) continue;
      const d=segDistArr(P,i,j); if(d<m){m=d;mi=i;mj=j;} } return {g:m,i:mi,j:mj}; }
  function cd2Gap(P){ const n=P.length; let m=Infinity; for(let i=0;i<n;i++){ const d=segDistArr(P,i,(i+2)%n); if(d<m) m=d; } return m; }
  // пересечение на прямолинейном пути P0→P1 (сэмплирование): min по λ расстояния пар cd>=2
  function pathMinGap(P0,P1,K){ const n=P0.length; let m=Infinity, at=null;
    for(let k=0;k<=K;k++){ const l=k/K; const P=P0.map((p,i)=>[p[0]+(P1[i][0]-p[0])*l, p[1]+(P1[i][1]-p[1])*l, p[2]+(P1[i][2]-p[2])*l]);
      for(let i=0;i<n;i++) for(let j=i+2;j<n;j++){ if(i===0&&j===n-1) continue; const d=segDistArr(P,i,j); if(d<m){m=d; at={l,i,j};} } }
    return {m,at}; }
  const snap=()=>verts.map(v=>[v.x,v.y,v.z]);
  // --- патчи ---
  const origProj=projectLengths, origUnstick=unstickLift;
  let lastTrial=null, projLog=[], unstickLog=[], phase='';
  projectLengths=function(iter){
    if(_projOnce){ const P0=snap(); const gF=energyGrad(false).gmin; const gE=exactGap(P0,3).g; const c2=cd2Gap(P0);
      origProj(iter); const P1=snap(); let mv=0; for(let i=0;i<N;i++){ const d=Math.hypot(P1[i][0]-P0[i][0],P1[i][1]-P0[i][1],P1[i][2]-P0[i][2]); if(d>mv) mv=d; }
      let emax=0,emin=1e9; for(let i=0;i<N;i++){ const e=Math.hypot(P1[i][0]-P1[(i+1)%N][0],P1[i][1]-P1[(i+1)%N][1],P1[i][2]-P1[(i+1)%N][2]); emax=Math.max(emax,e); emin=Math.min(emin,e); }
      const rec={phase, gFilt:gF/L0, gExact:gE/L0, cd2:c2/L0, cap:_projCap/L0, mv:mv/L0, ok2:(2*mv<gE), emax:emax/L0, emin:emin/L0};
      if(!rec.ok2){ const pm=pathMinGap(P0,P1,16); rec.pathMin=pm.m/L0; }
      projLog.push(rec); return; }
    origProj(iter); lastTrial=snap(); };
  unstickLift=function(maxRounds){ let tot=0;
    for(let r=0;r<(maxRounds||300);r++){ const P0=snap(); const p=origUnstick(1); if(!p) break; tot+=p; const P1=snap();
      let mv=0; for(let i=0;i<N;i++){ const d=Math.hypot(P1[i][0]-P0[i][0],P1[i][1]-P0[i][1],P1[i][2]-P0[i][2]); if(d>mv) mv=d; }
      const gE0=exactGap(P0,3), gE1=exactGap(P1,3); const pm=pathMinGap(P0,P1,8);
      unstickLog.push({mv:mv/L0, g0:gE0.g/L0, g1:gE1.g/L0, pathMin:pm.m/L0, cd2:cd2Gap(P1)/L0}); }
    _dbgUnstick+=0; return tot; };
  function edgeStats(){ let emax=0,emin=1e9; for(let i=0;i<N;i++){ const e=verts[i].distanceTo(verts[(i+1)%N]); emax=Math.max(emax,e); emin=Math.min(emin,e);} return {emax:+(emax/L0).toFixed(3), emin:+(emin/L0).toFixed(3)}; }
  function runOne(name, load, maxSteps){
    projLog=[]; unstickLog=[]; phase='start';
    load();
    const lift={N, edges:edgeStats(), gExact:+(exactGap(snap(),3).g/L0).toFixed(5), cd2:+(cd2Gap(snap())/L0).toFixed(4), det:_detRobust(5), D:+(thickDNominal()/L0).toFixed(3), thickScale:+_thickScale.toFixed(3)};
    if(!H.running()) H.play();
    const start={det:_detRobust(5), gExact:+(exactGap(snap(),3).g/L0).toFixed(5), inflate:+_inflate.toFixed(4), edges:edgeStats(),
      unstickPushes:unstickLog.length, unstickBad:unstickLog.filter(r=>!(2*r.mv<r.g0)).length, unstickPathMin:+Math.min(...unstickLog.map(r=>r.pathMin),1e9).toFixed(5),
      projCalls:projLog.length, projUncert:projLog.filter(r=>!r.ok2).length, projPathMin:+Math.min(...projLog.filter(r=>!r.ok2).map(r=>r.pathMin),1e9).toFixed(5),
      projFiltGtExact:projLog.filter(r=>r.gFilt>r.gExact*1.0001).length, projEmax:+Math.max(...projLog.map(r=>r.emax),0).toFixed(3)};
    phase='run';
    const st={acc:0, filtGtExact:0, sat:0, uncert:0, uncertList:[], maxRatio:0, minCd2:1e9, minPathGap:1e9, cd2below:0};
    let steps=0;
    while(running && steps<maxSteps){
      const P0=snap(); const gE=exactGap(P0,3); const c20=cd2Gap(P0);
      lastTrial=null; relaxStep(); steps++;
      if(_dbgTier<0 || !lastTrial) continue;
      st.acc++;
      const gF=_dbgGmin; const R=thickD()+1.5*L0;
      if(gF>=R*0.999) st.sat++;
      if(gF>gE.g*1.0001) st.filtGtExact++;
      const P1=lastTrial; let mv=0; for(let i=0;i<N;i++){ const d=Math.hypot(P1[i][0]-P0[i][0],P1[i][1]-P0[i][1],P1[i][2]-P0[i][2]); if(d>mv) mv=d; }
      const ratio=mv/(0.5*gE.g); if(ratio>st.maxRatio) st.maxRatio=ratio;
      const c21=cd2Gap(P1); if(c21<st.minCd2) st.minCd2=c21;
      if(c21<0.02*L0 || c20<0.02*L0) st.cd2below++;
      if(ratio>=1){ st.uncert++; const pm=pathMinGap(P0,P1,16); if(pm.m<st.minPathGap) st.minPathGap=pm.m;
        if(st.uncertList.length<5) st.uncertList.push({step:steps, mv:+(mv/L0).toFixed(4), gExact:+(gE.g/L0).toFixed(4), gFilt:+(gF/L0).toFixed(4), pathMin:+(pm.m/L0).toFixed(4), at:pm.at}); }
    }
    if(H.running()) H.play();
    st.maxRatio=+st.maxRatio.toFixed(3); st.minCd2=+(st.minCd2/L0).toFixed(3); st.minPathGap=st.minPathGap===1e9?null:+(st.minPathGap/L0).toFixed(4);
    return {name, lift, start, steps, settled:!running, detEnd:_detRobust(5), inflate:+_inflate.toFixed(3), run:st, status:document.getElementById('status').textContent.slice(0,70)};
  }
  const out=[];
  out.push(runOne('trefoil', ()=>H.clickPreset('trefoil'), 1500));
  out.push(runOne('figure8', ()=>H.clickPreset('figure8'), 1500));
  out.push(runOne('septafoil', ()=>H.clickPreset('septafoil'), 1500));
  for(const t of [8,30,60]) out.push(runOne('rand'+t, ()=>randomKnot(t), 2500));
  H.el('clear').onclick();
  out.push(runOne('unknotWrithe', ()=>H.drawCurve(u=>{ const t=u*2*Math.PI; const r=95+75*Math.cos(3*t+0.4); return {x:400+r*Math.cos(t)*0.95+25*Math.cos(2*t), y:300+r*Math.sin(t)*0.95+25*Math.sin(2*t)}; }, 300), 2500));
  return out;
})()
