// ЛАБОРАТОРИЯ STIR (stir.html, spec v2 §8.2): диаграммы seed 1000+idx (как stirexp.js), серия Physics (TRIES попыток, seed PHYS_SEED+idx) → снимок S0 →
// для каждой ветви из MODES (loops | invert | stretch): восстановить S0 → ход (Stir loops | Stir invert | applyStretch(0.7,0.7) на каждую попытку
// от S0, честная «встряска S0»; (0.4,2.2) из spec §8.2 на релаксированном S0 при W=3 заклинивает — ядро утончается, попытка не сходится) →
// серия (TRIES−1 новых + лучшая) → минимум; контроль — ещё TRIES−1 свежих попыток с той же диаграммы без Stir.
// Все ветви стартуют с ОДНОГО S0 (проверяется хешем) и с одним seed Math.random (seeded(7000+idx)). Идентичность бассейна каждой попытки:
// d_ICP — средняя дистанция до ближайшей точки S0 после ICP до сходимости (Кабш по ближайшим точкам, кватернион Хорна; старт — из главных
// осей инерции, 4 собственных комбинации знаков + тождество, берётся минимум) / Rk; dE=|E−E_S0|/E_S0; sameBasin ⇔ d_ICP < 0.05 и dE < 0.005.
// Выигрыш ветви — только по НОВЫМ попыткам (без перенесённой S0), как у контроля; jam — ветвь не сошлась / ядро утончено (не считать «нет выигрыша»).
// Ветвь loops — веер + пины (STIR_PIN=true: фаза 1 с пинами шапок, фаза 2 — свободный отжиг), loops:nopin — веер без пинов (STIR_PIN=false); в записи ветви — pin, pins (вершин на петлю),
// tries — по попыткам серии {round, pins (пиновых вершин), phase2, stepsP1 (до снятия), stepsP2 (снятие → конец)}.
// MODES="loops,loops:nopin,invert,stretch" W=3 R=1 B=9 TRIES=5 IDX="0,1,2" NCS="20,36,52" BUDGET=200000 PHYS_SEED=9000 KNOT_PAGE=stir.html node harness.js stirlab.js
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const W=+(process.env.W||3), R=+(process.env.R||1), B=+(process.env.B||9), TRIES=+(process.env.TRIES||5), BUDGET=+(process.env.BUDGET||200000);
  const IDX=(process.env.IDX||'0').split(',').map(Number), NCS=(process.env.NCS||'20').split(',').map(Number), MODES=(process.env.MODES||'loops,invert').split(','), PHYS_SEED=+(process.env.PHYS_SEED||9000);
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  function runToEnd(){ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=BUDGET) break; } return {steps:st, settled:!o.running}; }
  function runArm(){ let o=null, st=0; const tries=[]; let cur=null;   // серия ветви: по попыткам — пины (вершин), была ли фаза 2, фаза 3 (ok|cert|'' — поправка F), N попытки (N') и после фазы 3, шаги фаз 1/2/3; батч 50 шагов
    const tick=()=>{ const T=window.__knotTrace(), r=_msRound; if(!cur || cur.round!==r){ if(cur) cur.tEnd=st; cur={round:r, pins:0, phase2:false, phase3:'', N1:T.N, N:T.N, t0:st, tRel:null, tP3:null, tEnd:null}; tries.push(cur); }
      if(T.pins.on && T.pins.n>cur.pins) cur.pins=T.pins.n; if(T.pins.phase2 && cur.tRel===null){ cur.phase2=true; cur.tRel=st; } if(T.pins.phase3 && cur.tP3===null){ cur.phase3=T.pins.phase3; cur.tP3=st; } cur.N=T.N; };
    while(true){ o=H.step(50); st+=50; if(o.running) tick(); if(!o.running || st>=BUDGET) break; }
    if(cur) cur.tEnd=st; for(const t of tries){ t.stepsP1=t.tRel!==null? t.tRel-t.t0 : null; t.stepsP2=t.tRel!==null? (t.tP3!==null? t.tP3 : t.tEnd)-t.tRel : null; t.stepsP3=t.tP3!==null? t.tEnd-t.tP3 : null; t.steps=t.tEnd-t.t0; delete t.t0; delete t.tRel; delete t.tP3; delete t.tEnd; }
    for(const w of _msWins) if(/N' vertices/.test(w.note||'')){ const t=tries.find(x=>x.round===w.k-1-_msOffset); if(t && !t.phase3) t.phase3='cert'; }   // 'cert' кончает попытку сразу — виден по пометке окна
    return {steps:st, settled:!o.running, tries, N0:_stirN0, finalN:N, winsN:_msWins.map(w=>w.verts.length)}; }
  const es=()=>_msEnergies.filter(e=>e!==undefined && isFinite(e)).map(e=>+e.toPrecision(5));
  const mn=a=>a.length? Math.min(...a) : null;
  const hash=vs=>{ let h=0; for(const v of vs){ h=(h*31+Math.round(v.x*1e3))|0; h=(h*31+Math.round(v.y*1e3))|0; h=(h*31+Math.round(v.z*1e3))|0; } return h; };
  function snapshot(){ return {verts:verts.map(v=>v.clone()), N, L0, thick:_thickFit, runDet:_runDet, knotDet, isUnknot, energies:_msEnergies.slice(),
    best:_msBest? {..._msBest, verts:_msBest.verts.map(v=>v.clone())} : null,
    wins:_msWins.map(w=>({k:w.k, E:w.E, verts:w.verts.map(v=>v.clone()), note:w.note, thick:w.thick, key:w.key}))}; }
  function restore(S){ if(H.running()) H.play(); if(typeof stirCancel==='function') stirCancel();
    msWinsClear(); for(const w of S.wins){ msResultAdd(w.k, w.E, w.verts, w.note, w.thick); }
    _setVertsFrom(S.verts); L0=S.L0; _thickFit=S.thick; updateGeomUnits(); _runDet=S.runDet; knotDet=S.knotDet; isUnknot=S.isUnknot;
    _msEnergies=S.energies.slice(); _msBest=S.best? {...S.best, verts:S.best.verts.map(v=>v.clone())} : null;
    _stirS0=null; _stirHoles=[]; _inflate=1; _energyDirty=true; _ePrev=-1; if(typeof stirEnable==='function') stirEnable(true); }
  // ---- идентичность бассейна: ICP (Кабш по ближайшим точкам; кватернион Хорна через Якоби 4×4 — только собственные вращения) ----
  function maxEig4(A){ const a=A.map(r=>r.slice()), V=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]; let dg=0; for(let i=0;i<4;i++) dg+=a[i][i]*a[i][i];
    for(let sw=0; sw<60; sw++){ let off=0; for(let p=0;p<4;p++) for(let q=p+1;q<4;q++) off+=a[p][q]*a[p][q]; if(off<=1e-26*(dg+1e-300)) break;
      for(let p=0;p<4;p++) for(let q=p+1;q<4;q++){ if(a[p][q]===0) continue; const th=(a[q][q]-a[p][p])/(2*a[p][q]); const t=(th>=0?1:-1)/(Math.abs(th)+Math.sqrt(th*th+1)); const c=1/Math.sqrt(t*t+1), s=t*c;
        for(let k=0;k<4;k++){ const kp=a[k][p], kq=a[k][q]; a[k][p]=c*kp-s*kq; a[k][q]=s*kp+c*kq; }
        for(let k=0;k<4;k++){ const pk=a[p][k], qk=a[q][k]; a[p][k]=c*pk-s*qk; a[q][k]=s*pk+c*qk; }
        for(let k=0;k<4;k++){ const vp=V[k][p], vq=V[k][q]; V[k][p]=c*vp-s*vq; V[k][q]=s*vp+c*vq; } } }
    let bi=0; for(let i=1;i<4;i++) if(a[i][i]>a[bi][bi]) bi=i; return [V[0][bi],V[1][bi],V[2][bi],V[3][bi]]; }
  function kabsch(A,B){   // R,t: min Σ|R·a+t−b|² по парам (A[i],B[i]); собственное вращение
    const n=A.length, ca=[0,0,0], cb=[0,0,0]; for(let i=0;i<n;i++) for(let k=0;k<3;k++){ ca[k]+=A[i][k]/n; cb[k]+=B[i][k]/n; }
    const S=[[0,0,0],[0,0,0],[0,0,0]]; for(let i=0;i<n;i++){ const a=A[i], b=B[i]; for(let p=0;p<3;p++) for(let q=0;q<3;q++) S[p][q]+=(a[p]-ca[p])*(b[q]-cb[q]); }
    const [[Sxx,Sxy,Sxz],[Syx,Syy,Syz],[Szx,Szy,Szz]]=S;
    const Nm=[[Sxx+Syy+Szz, Syz-Szy, Szx-Sxz, Sxy-Syx],[Syz-Szy, Sxx-Syy-Szz, Sxy+Syx, Szx+Sxz],[Szx-Sxz, Sxy+Syx, -Sxx+Syy-Szz, Syz+Szy],[Sxy-Syx, Szx+Sxz, Syz+Szy, -Sxx-Syy+Szz]];
    const [w,x,y,z]=maxEig4(Nm);
    const Rm=[[w*w+x*x-y*y-z*z, 2*(x*y-w*z), 2*(x*z+w*y)],[2*(x*y+w*z), w*w-x*x+y*y-z*z, 2*(y*z-w*x)],[2*(x*z-w*y), 2*(y*z+w*x), w*w-x*x-y*y+z*z]];
    const t=[0,1,2].map(r=>cb[r]-(Rm[r][0]*ca[0]+Rm[r][1]*ca[1]+Rm[r][2]*ca[2])); return {R:Rm, t}; }
  function eig3(C){   // Якоби 3×3: собственные векторы (столбцы) по убыванию собственных значений
    const a=C.map(r=>r.slice()), V=[[1,0,0],[0,1,0],[0,0,1]];
    for(let sw=0; sw<50; sw++){ let off=0; for(let p=0;p<3;p++) for(let q=p+1;q<3;q++) off+=a[p][q]*a[p][q]; if(off<1e-24) break;
      for(let p=0;p<3;p++) for(let q=p+1;q<3;q++){ if(a[p][q]===0) continue; const th=(a[q][q]-a[p][p])/(2*a[p][q]); const t=(th>=0?1:-1)/(Math.abs(th)+Math.sqrt(th*th+1)); const c=1/Math.sqrt(t*t+1), s=t*c;
        for(let k=0;k<3;k++){ const kp=a[k][p], kq=a[k][q]; a[k][p]=c*kp-s*kq; a[k][q]=s*kp+c*kq; }
        for(let k=0;k<3;k++){ const pk=a[p][k], qk=a[q][k]; a[p][k]=c*pk-s*qk; a[q][k]=s*pk+c*qk; }
        for(let k=0;k<3;k++){ const vp=V[k][p], vq=V[k][q]; V[k][p]=c*vp-s*vq; V[k][q]=s*vp+c*vq; } } }
    const ord=[0,1,2].sort((i,j)=>a[j][j]-a[i][i]); return ord.map(i=>[V[0][i],V[1][i],V[2][i]]); }
  const frameOf=P=>{ const n=P.length, c=[0,0,0]; for(const p of P) for(let k=0;k<3;k++) c[k]+=p[k]/n; const C=[[0,0,0],[0,0,0],[0,0,0]];   // центроид и правая тройка главных осей
    for(const p of P) for(let i=0;i<3;i++) for(let j=0;j<3;j++) C[i][j]+=(p[i]-c[i])*(p[j]-c[j]); const [v1,v2]=eig3(C); const v3=[v1[1]*v2[2]-v1[2]*v2[1], v1[2]*v2[0]-v1[0]*v2[2], v1[0]*v2[1]-v1[1]*v2[0]]; return {c, ax:[v1,v2,v3]}; };
  function dICP(Av, Bv, Rk){   // min по стартам (тождество + 4 собственных совмещения главных осей) средней дистанции A→ближайшие B после ICP до сходимости, / Rk
    const A0=Av.map(v=>[v.x,v.y,v.z]), Bp=Bv.map(v=>[v.x,v.y,v.z]), nA=A0.length, nB=Bp.length;
    const nearest=A=>{ const P=new Array(nA); let sum=0; for(let i=0;i<nA;i++){ const a=A[i]; let bd=Infinity, bj=0; for(let j=0;j<nB;j++){ const b=Bp[j]; const d=(a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])+(a[2]-b[2])*(a[2]-b[2]); if(d<bd){ bd=d; bj=j; } } P[i]=Bp[bj]; sum+=Math.sqrt(bd); } return {P, mean:sum/nA}; };
    const icp=A=>{ let r=nearest(A), prev=Infinity; for(let it=0; it<50 && Math.abs(prev-r.mean)>=1e-4*Rk; it++){ prev=r.mean; const {R:Rm,t}=kabsch(A, r.P); A=A.map(a=>[0,1,2].map(k=>Rm[k][0]*a[0]+Rm[k][1]*a[1]+Rm[k][2]*a[2]+t[k])); r=nearest(A); } return r.mean; };
    const fa=frameOf(A0), fb=frameOf(Bp); let best=icp(A0);
    for(const [s1,s2] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const sg=[s1,s2,s1*s2];   // R=FB·diag(s)·FAᵀ — собственное вращение осей A на оси B
      const A=A0.map(a=>{ const d=[a[0]-fa.c[0],a[1]-fa.c[1],a[2]-fa.c[2]]; const q=[0,1,2].map(k=>sg[k]*(fa.ax[k][0]*d[0]+fa.ax[k][1]*d[1]+fa.ax[k][2]*d[2]));
        return [0,1,2].map(r=>fb.c[r]+fb.ax[0][r]*q[0]+fb.ax[1][r]*q[1]+fb.ax[2][r]*q[2]); }); const m=icp(A); if(m<best) best=m; }
    return best/Rk; }
  const RkOf=vs=>{ const c=[0,0,0]; for(const v of vs){ c[0]+=v.x/vs.length; c[1]+=v.y/vs.length; c[2]+=v.z/vs.length; } let r=0; for(const v of vs) r=Math.max(r, Math.hypot(v.x-c[0],v.y-c[1],v.z-c[2])); return r; };
  function basin(S0, E0){   // по окнам попыток серии (кроме перенесённой №1): d_ICP и dE к S0 (раздельно — виден источник «другого бассейна») и доля «тот же бассейн»
    const Rk=RkOf(S0.verts), d=[], dE=[], same=[]; for(const w of _msWins){ if(w.k===1 && _msOffset>0) continue; if(!w.verts || !w.verts.length) continue;
      const di=dICP(w.verts, S0.verts, Rk), de=isFinite(w.E)? Math.abs(w.E-E0)/E0 : null; d.push(+di.toFixed(4)); dE.push(de===null? null : +de.toFixed(4)); same.push(de!==null && di<0.05 && de<0.005); }
    return {dICP:d, dE, sameBasin: same.length? +(same.filter(x=>x).length/same.length).toFixed(2) : null}; }
  for(let q=0;q<IDX.length;q++){ const idx=IDX[q], nc=NCS[q];
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',W); H.setSlider('repCoef',R); H.setSlider('bendCoef',B);
    seeded(1000+idx, ()=>{ let t=0; do{ randomKnot(nc); }while(isUnknot && t++<30); });
    const rawPts=raw.map(p=>({x:p.x,y:p.y})), overs=crossings.map(c=>c.over);
    const d=H.dbg(); const rec={idx, ncWanted:nc, nc:d.crossings.length, det:d.knotDet, N:d.N, W, R, B, TRIES};
    let t0=Date.now(); const r1=seeded(PHYS_SEED+idx, ()=>{ H.set({ms:TRIES}); H.play(); return runToEnd(); }); rec.phys={...r1, sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), status:H.dbg().status.slice(0,100)};
    if(!r1.settled || rec.phys.E.length===0){ rec.skip='physics not settled / jam'; out.push(rec); console.error(JSON.stringify(rec)); continue; }
    rec.physMin=rec.phys.min; const S0=snapshot(); rec.h0=hash(S0.verts); rec.modes={};
    for(const mode of MODES){ const [base, ...opts]=mode.split(':'); const nopin=opts.includes('nopin');   // имя ветви: режим[:nopin]
      seeded(7000+idx, ()=>{ restore(S0); const hs=hash(verts); let dbg=null, rr=null, r2; t0=Date.now();
      if(base==='stretch'){   // ветвь «встряска S0»: серия как после Stir (лучшая переносится), но лифт каждой попытки — S0 после applyStretch(0.4,2.2)
        const kept=msWinsKeepBest(); _msCarry = kept ? {E:kept.E, verts:kept.verts.map(v=>v.clone()), note:kept.note||'', key:(kept.key!==undefined? kept.key : constsKey()), thick:thickOf(kept)} : null;
        _msEnergies = kept ? [kept.E] : []; _msBest=null; _msRound=0; _msK=1; _msPaused=false; _stirS0=null; _stirHoles=[];
        applyStretch(0.7,0.7); _fromLift=true; _liftFromDiagram=false; startPhysics();   // попытка 1 — растянутый S0 (мягко: (0.4,2.2) на релаксированном S0 при W=3 заклинивает, см. stir.html _msStretchMild)
        _msLift=S0.verts.map(v=>v.clone()); _msStretchMild=true;   // следующие попытки: msNextLift берёт S0, startPhysics растягивает (0.7, 0.7)
        r2=runToEnd(); }
      else { window.__stirMode(base); window.__stirPin(base==='loops' && !nopin); if(base==='inflate' && opts[0]) window.__stirInfl(+opts[0]); rr=window.__knotStir(); dbg=_dbgStir; r2=rr.running? runArm() : {steps:0, settled:false, tries:[]}; }   // пины до __knotStir
      const bs=basin(S0, rec.phys.min);
      const M=rec.modes[mode]={sameS0:hs===rec.h0, pin:(base==='loops')? window.__stirPin() : null, pins:(dbg&&dbg.remap&&dbg.remap.pins)||null, dbg:dbg && {mode:dbg.mode, remap:dbg.remap, rej:dbg.rej, det0:dbg.det0, det1:dbg.det1, tooTight:dbg.tooTight, disp_R:dbg.disp_R}, ...r2,
        sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), status:H.dbg().status.slice(0,140),
        loops:(dbg&&dbg.remap&&dbg.remap.loops)? dbg.remap.loops.length : 0, H_rho:(dbg&&dbg.remap&&dbg.remap.loops)? dbg.remap.loops.map(l=>l.H_rho) : null, nOld:(dbg&&dbg.remap)? dbg.remap.nOld : null, nNew:(dbg&&dbg.remap)? dbg.remap.nNew : null, scale:(dbg&&dbg.remap)? dbg.remap.scale : null, fallback:!!(dbg && dbg.mode==='pull'), rej:dbg? dbg.rej : null, ...bs};   // E попыток (min, gain) — записанные, при N0 (фаза 3) или нормированные E·N/N0 (cert)
      const newE=(M.E.length && M.E[0]===rec.phys.min)? M.E.slice(1) : M.E;   // без перенесённой S0 (№1) — как у контроля, только новые попытки
      M.newE=newE; M.armMin=mn(newE); M.armMinAll=M.min;   // armMinAll — с учётом S0 (≤ physMin по построению, для справки)
      M.gain=M.gainArm= M.armMin!==null? +((rec.phys.min-M.armMin)/rec.phys.min).toFixed(4) : null;
      M.jam=(r2.steps>0 && !r2.settled) || /thinned to/.test(M.status);   // ветвь не сошлась / ядро утончено — не «нет выигрыша» (steps=0 — ремап отклонён, это fallback)
      console.error('  arm', mode, 'idx', idx, 'mode', dbg&&dbg.mode, 'pin', M.pin, 'pins', JSON.stringify(M.pins), 'tries', JSON.stringify(M.tries||null), 'loops', M.loops, 'H_rho', JSON.stringify(M.H_rho), 'nOld/nNew', M.nOld, M.nNew, 'N0/finalN', M.N0, M.finalN, 'winsN', JSON.stringify(M.winsN||null), 'scale', M.scale, 'rej', JSON.stringify(M.rej), 'armMin', M.armMin, 'gain', M.gain, 'jam', M.jam, 'sameBasin', M.sameBasin, 'dICP', JSON.stringify(M.dICP), 'dE', JSON.stringify(M.dE), 'sec', M.sec); }); }
    // контроль: та же диаграмма, ещё TRIES−1 свежих попыток без Stir
    seeded(7000+idx, ()=>{ H.el('clear').onclick(); if(H.running()) H.play();
      raw=rawPts.map(p=>({x:p.x,y:p.y})); closedCurve=false; drawing=false; finishCurve(true); crossings.forEach((c,i)=>c.over=overs[i]); updateKnotType(); syncKnot3D();
      t0=Date.now(); H.set({ms:Math.max(1,TRIES-1)}); H.play(); const r3=runToEnd(); rec.ctrl={...r3, sec:+((Date.now()-t0)/1000).toFixed(0), E:es(), min:mn(es()), det:H.dbg().knotDet, ...basin(S0, rec.phys.min)}; });
    rec.ctrlMin=rec.ctrl.min; rec.gainCtrl = rec.ctrl.min!==null? +((rec.phys.min-rec.ctrl.min)/rec.phys.min).toFixed(4) : null; rec.ctrl.jam=!rec.ctrl.settled || /thinned to/.test(H.dbg().status);
    for(const mode of MODES){ const M=rec.modes[mode]; M.win= (M.gainArm!==null && rec.gainCtrl!==null && !M.jam)? M.gainArm>rec.gainCtrl : null; }   // парный выигрыш: обе стороны по TRIES−1 новым попыткам
    out.push(rec); console.error(JSON.stringify(rec).slice(0,900)); }
  return out; })()
