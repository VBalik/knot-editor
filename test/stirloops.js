// STIR «ПЕТЛИ НАРУЖУ» (stir.html, spec v3 + поправки E/F: веер, H=U(1.5,6)·ρ, передискретизация N', пины, фазы 1–3): 4 узла (как stir8.js) в режиме loops, затем invert; серия после Stir до конца.
// По пресету: петли (число, H/ρ и что ограничило высоту — cap, tipW/w — раствор веера), nOld→nNew и масштаб sc (≈1), раскрытие ядра на старте попытки (inflate0), пины (вершин на петлю),
// шаги фазы 1 (до снятия пинов), фазы 2 (снятие → фаза 3) и фазы 3 (возврат к N0 → конец попытки), статус фазы 3 (ok | cert), сдвиг пинов за фазу 1 (max |Δ|/L0 — должен быть 0)
// и ошибка длин рёбер (max |edge−L0|/L0), список E (при N0), det; высоты пальцев по материалу (stirFingerBlocks) каждые 25 шагов первой попытки до фазы 3: h — высота пальца над
// своим основанием (L0), gap — выступ над остальным узлом (L0); t_r — шаг после снятия, где h упала до 20 % от высоты при снятии. Пины проверяются НЕЗАВИСИМО: правило шапки
// h ≥ h_top − max(w·s(H), 0.15·H) по материалу пальца (pinsCapOk; допуск 0.05·L0 — старт попытки шумит вершины); при PIN=0 — пинов и фаз нет (отрицательная проверка).
// После серии: все окна с фазой 3 'ok' имеют N0 вершин, финальный N=N0, |Σрёбер − N·L0| < 1e-6·N·L0 (asserts3).
// Перебор изотопии (ISO) веера на всех построениях серий пресетов и на rand30 при Stiff.=1: каждая точка дуги движется линейно по λ (векторы смещений D из _stirLoopsLast, fine до
// пальца — F0); для всех пар под-рёбер без общей вершины (дуга—дуга, ближняя цепь, готовые пальцы — всё в F0) выборка по λ с липшицевой оценкой |Δd| ≤ V·|Δλ| (V — макс.
// относительная скорость концов), сгущение до сертифицированной нижней оценки ≥ tol=0.02·L0 (bbox-отсев: оболочки заметания дальше tol — пара безопасна). Отчёт: lb* — сертифицированные
// нижние оценки, обрезанные у tol (НЕ зазор); minNearS/minFarS — выборочные минимумы только по неотсечённым парам; tight* — K худших пар (по lb, включая отсечённые) досчитаны до предела — сертифицированный зазор.
// Вся попытка (лифт, серия, Stir) — под seed PHYS_SEED (по умолчанию 9001). Итог: out.ok, out.fallback.
// PART=loops,invert,iso (по умолчанию все)  PHYS_SEED=9001  PIN=1 (0 — веер без пинов и фаз)  KNOT_PAGE=stir.html node harness.js stirloops.js
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const builds={}; let curName=''; const origLI=stirLoopsImage;   // все построения петель (ремап Stir и ремапы следующих попыток) по имени прогона — перебор изотопии каждого (spec D: и пресеты, и rand30)
  stirLoopsImage=function(){ const r=origLI.apply(this, arguments); if(r && _stirLoopsLast && window.__stirDebug){ (builds[curName]=builds[curName]||[]).push(_stirLoopsLast); } return r; };
  const PART=(process.env.PART||'loops,invert,iso').split(','); const want=p=>PART.includes(p); const PHYS_SEED=+(process.env.PHYS_SEED||9001); const PIN=(process.env.PIN||'1')!=='0';
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const es=()=>_msEnergies.map(e=>(e!==undefined && isFinite(e))?+e.toPrecision(4):'jam');
  const edgeSum=()=>{ let t=0; for(let i=0;i<N;i++) t+=verts[i].distanceTo(verts[(i+1)%N]); return t; };
  const edgeErr=()=>{ let e=0; for(let i=0;i<N;i++){ const q=Math.abs(verts[i].distanceTo(verts[(i+1)%N])-L0); if(q>e) e=q; } return e; };
  const centroid=vs=>{ const c=[0,0,0]; for(const v of vs){ c[0]+=v.x/vs.length; c[1]+=v.y/vs.length; c[2]+=v.z/vs.length; } return c; };
  const prep={ trefoil:()=>H.clickPreset('trefoil'), figure8:()=>H.clickPreset('figure8'),
    rand12:()=>seeded(4242,()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }), rand30:()=>seeded(4343,()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }) };
  const sliders={trefoil:[5,2,9], figure8:[5,2,9], rand12:[5,2,9], rand30:[3,1,9]};
  function physics(name, sl){ H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    prep[name.replace(/_.*$/,'')](); H.set({ms:3}); H.play(); const r1=runToEnd(60000); return {r1, E1:es(), det:knotDet}; }   // имя прогона может нести суффикс (rand30_b1 — rand30 при Stiff.=1)
  function fingerBlocks(LL){   // материал пальцев — общей функцией страницы stirFingerBlocks (та же, что даёт материал для пинов): fv — в исходных n вершинах, Y — N=nNew вершин
    const F=LL.fine, FV=LL.fv, n=LL.X.length; if(!FV || (LL.nNew && LL.nNew!==N)) return null;
    return stirFingerBlocks(F, FV, LL.loops, n, N).map(p=>{ const b=new Uint8Array(N); for(const j of p.idx) b[j]=1; return {mask:b, cnt:p.idx.length, idx:p.idx}; }); }
  function pinsCapCheck(LL, blocks, sc){   // независимая проверка правила шапки: пин ⇔ вершина материала с высотой вдоль u ≥ h_top − max(w·s(H), 0.15·H)·sc (допуск 0.05·L0 — старт попытки шумит вершины)
    if(!_stirPins || _stirPins.length!==blocks.length) return {ok:false, why:'pins/loops count '+(_stirPins? _stirPins.length : null)+'/'+blocks.length};
    let bad=0, tot=0; const tol=0.05*L0;
    LL.loops.forEach((l,k)=>{ const u=l.u, mg=Math.max(l.tipW, 0.15*l.H)*sc, pin=new Uint8Array(N); for(const j of _stirPins[k].idx) pin[j]=1;
      const h=new Float64Array(N); let ht=-Infinity; for(const j of blocks[k].idx){ h[j]=verts[j].x*u[0]+verts[j].y*u[1]+verts[j].z*u[2]; if(h[j]>ht) ht=h[j]; }
      for(const j of blocks[k].idx){ tot++; if(pin[j] && h[j]<ht-mg-tol) bad++; if(!pin[j] && h[j]>=ht-mg+tol) bad++; }
      for(const j of _stirPins[k].idx) if(!blocks[k].mask[j]) bad++; });   // пин вне материала пальца
    return {ok:bad===0, bad, tot}; }
  function one(name, mode, sl){ return seeded(PHYS_SEED, ()=>{   // весь прогон (лифт, серия, Stir, серия после Stir) под одним seed — воспроизводимо
    const ph=physics(name, sl||sliders[name]); const N0=N;
    window.__stirMode(mode); window.__stirPin(PIN); const dbgPrev=window.__stirDebug; if(mode==='loops') window.__stirDebug=true; curName=name;   // нужен _stirLoopsLast (материал пальцев; все построения серии — в builds)
    const t0=Date.now(); const rr=window.__knotStir(); const ms=Date.now()-t0; const dbg=_dbgStir; const g=energyGrad(false); const LL=_stirLoopsLast; const inflate0=_inflate;
    const rec={det:ph.det, N0, N, nNew:dbg&&dbg.remap&&dbg.remap.nNew, nOld:dbg&&dbg.remap&&dbg.remap.nOld, inflate0:+inflate0.toFixed(3), L0:+L0.toFixed(4), phys:ph.r1, E1:ph.E1, stirMs:ms, mode:dbg&&dbg.mode, remap:dbg&&dbg.remap, rej:dbg&&dbg.rej, det01:[dbg&&dbg.det0, dbg&&dbg.det1],
      gmin_L0:+(g.gmin/L0).toFixed(4), holes:_stirHoles.length, s0N:_stirS0? _stirS0.N : null, pin:window.__stirPin(), pins:(dbg&&dbg.remap&&dbg.remap.pins)||null};
    if(_stirS0 && dbg && dbg.mode==='loops'){ const A={}; const tl=edgeSum(); A.len=Math.abs(N*L0-tl)<1e-6*N*L0; A.gmin=g.gmin>0; A.L0=Math.abs(L0-_stirS0.L0)<1e-9*L0;   // при N' рёбра ровно L0, L0 как у S0
      A.n=(dbg.remap.nOld===_stirS0.N && dbg.remap.nNew===N && N>=4 && N<=(1+STIR_LEN)*_stirS0.N);   // передискретизация: N=nNew, nOld=N0, кап n' ≤ (1+STIR_LEN)·n
      A.det=dbg.remap.detChecked? (dbg.det0===dbg.det1) : 'unchecked'; A.detNow=_detRobust(3)===dbg.det0; A.ok=A.len && A.gmin && A.L0 && A.n && A.det!==false && A.detNow; rec.asserts=A; }
    else rec.asserts={skipped: !_stirS0? 'no S0 (fallback '+(dbg&&dbg.mode)+')' : 'mode '+(dbg&&dbg.mode)};   // почему проверок нет — видно в JSON
    let pers=null;   // первая попытка серии: фазы, пины, высоты пальцев
    const blocks=(rr.running && dbg && dbg.mode==='loops' && dbg.remap && dbg.remap.loops.length && _stirS0 && LL && LL.loops.length===dbg.remap.loops.length)? fingerBlocks(LL) : null;
    rec.persSkipped = blocks? null : (dbg && dbg.mode!=='loops')? 'mode '+(dbg&&dbg.mode) : !rr.running? 'not running' : !LL? 'no _stirLoopsLast' : (dbg.remap && LL.loops.length!==dbg.remap.loops.length)? 'LL/remap loops mismatch' : 'no blocks (N '+N+' vs nNew '+(LL&&LL.nNew)+')';   // почему нет проверки пинов/фаз
    if(blocks){ const us=LL.loops.map(l=>l.u), sc=(dbg.remap.scale||1);
      const pinsCap=PIN? pinsCapCheck(LL, blocks, sc) : {ok:_stirPins===null, why:_stirPins===null? null : 'pins with PIN=0'};   // независимая проверка правила шапки (PIN=0: пинов быть не должно)
      const meas=()=>{ const c=centroid(verts); return us.map((u,k)=>{ const mk=blocks[k].mask; let ef=-Infinity, eb=-Infinity, base=Infinity; for(let j=0;j<N;j++){ const v=verts[j]; const e=(v.x-c[0])*u[0]+(v.y-c[1])*u[1]+(v.z-c[2])*u[2]; if(mk[j]){ if(e>ef) ef=e; if(e<base) base=e; } else if(e>eb) eb=e; } return {h:(ef-base)/L0, gap:(ef-eb)/L0}; }); };
      const m0=meas(), h0=m0.map(x=>+x.h.toFixed(1)), gap0=m0.map(x=>+x.gap.toFixed(1)); let st=0, maxPin=0, maxEdge=0, tRel=null, hRel=null, pinsN=null, tEnd=null, tP3=null, p3='', nP3=null, inflP3=null; const log=[], tr=us.map(()=>null); let hEnd=null, gapEnd=null;
      while(running && st<90000){ H.step(25); if(_msRound!==0){ tEnd=st; break; }   // раунд проверяем после шага: конец попытки внутри батча
        st+=25; const T=window.__knotTrace();
        if(T.pins.phase3 && tP3===null){ tP3=st; p3=T.pins.phase3; nP3=T.N; inflP3=+T.inflate.toFixed(3); }   // фаза 3: N изменился — материал пальцев дальше не измерим
        const mm=tP3===null? meas() : null;
        if(T.pins.on && _pinPos){ if(pinsN===null) pinsN=T.pins.n; const P=_pinPos; for(let q=0;q<P.idx.length;q++){ const v=verts[P.idx[q]]; const d=Math.hypot(v.x-P.x[q], v.y-P.y[q], v.z-P.z[q]); if(d>maxPin) maxPin=d; } const ee=edgeErr(); if(ee>maxEdge) maxEdge=ee; }
        if(T.pins.phase2 && tRel===null){ tRel=st; hRel=(mm||m0).map(x=>+x.h.toFixed(1)); }
        if(mm && tRel!==null) us.forEach((u,k)=>{ if(tr[k]===null && hRel[k]>0 && mm[k].h<0.2*hRel[k]) tr[k]=st-tRel; });
        if(st%250===0 && log.length<80) log.push([st, T.pins.on?1:0, T.pins.phase2?1:0, T.pins.phase3||'', T.N, T.ann.on? +T.ann.sig.toFixed(2) : -1, +T.E.toPrecision(4)].concat(mm? mm.map(x=>[+x.h.toFixed(1), +x.gap.toFixed(1)]) : []));   // [шаг, пины, фаза 2, фаза 3, N, σ отжига (−1 вне фазы A), E, по пальцам [h, gap]]
        if(mm){ hEnd=mm.map(x=>+x.h.toFixed(1)); gapEnd=mm.map(x=>+x.gap.toFixed(1)); } }
      const first=_msSteps.length? _msSteps[0] : st; const w1=_msWins.find(w=>w.k===1+_msOffset); if(!p3 && w1 && /N' vertices/.test(w1.note||'')) p3='cert';   // 'cert' кончает попытку сразу — виден только по пометке окна
      pers={block:blocks.map(b=>b.cnt), pinsCapOk:pinsCap.ok, pinsCap, pinsN, maxPin_L0:maxPin/L0, maxEdge_L0:maxEdge/L0, phase2:tRel!==null, phase3:p3, nAfterP3:nP3, inflateP3:inflP3, stepsPhase1:tRel, stepsPhase2:tRel!==null? (tP3!==null? tP3 : first)-tRel : null, stepsPhase3:tP3!==null? first-tP3 : null, firstTrySteps:first,
        h0, gap0, hRel, hEnd, gapEnd, t_r:tr, log}; }
    const t1=Date.now(); const r2=(running||rr.running)? runToEnd(90000) : null; rec.seriesMs=Date.now()-t1; window.__stirDebug=dbgPrev;
    rec.r2=r2; rec.E2=es(); rec.holesEnd=_stirHoles.length; rec.pers=pers; rec.status=H.dbg().status.slice(0,160);
    rec.wins=_msWins.map(w=>({k:w.k, E:isFinite(w.E)? +w.E.toPrecision(5) : 'jam', n:w.verts.length, note:w.note})); rec.finalN=N;
    if(dbg && dbg.mode==='loops' && _stirS0){ const A3={}; const okW=rec.wins.filter(w=>w.E!=='jam' && !/N' vertices/.test(w.note||''));   // после серии: окна с фазой 3 'ok' (или перенесённое №1) — при N0, финал — N0, рёбра ровные
      A3.winsN0=okW.length>0 && okW.every(w=>w.n===N0); A3.finalN0=(N===N0) || /N' vertices/.test((_msBest&&_msBest.msg)||''); A3.len=Math.abs(edgeSum()-N*L0)<1e-6*N*L0; A3.p3=!pers || pers.phase3==='ok' || pers.phase3==='cert';
      A3.ok=A3.winsN0 && A3.finalN0 && A3.len && A3.p3; rec.asserts3=A3; }
    const lp=(rec.remap&&rec.remap.loops)||[];
    console.error(mode, name, 'N0', N0, 'N\'', rec.nNew, 'mode', rec.mode, 'stirMs', ms, 'loops', lp.length, 'H/rho', lp.map(l=>l.H_rho).join(','), 'cap', lp.map(l=>l.cap||'-').join(','), 'rho/Rk', lp.map(l=>l.rho_R).join(','), 'tipW/w', lp.map(l=>l.tipW_w).join(','), 'dL/NL0', rec.remap&&rec.remap.dL_NL0, 'nc', lp.map(l=>l.nc).join(','),
      'scale', rec.remap&&rec.remap.scale, 'inflate0', rec.inflate0, 'cand/valid', rec.remap&&rec.remap.cand, rec.remap&&rec.remap.valid, 'rejc', JSON.stringify(rec.remap&&rec.remap.rejc), 'rej', JSON.stringify(rec.rej), 'det', JSON.stringify(rec.det01),
      'asserts', JSON.stringify(rec.asserts||null), 'asserts3', JSON.stringify(rec.asserts3||null), 'E1', JSON.stringify(rec.E1), 'E2', JSON.stringify(rec.E2), 'wins', JSON.stringify(rec.wins), 'finalN', rec.finalN, 'seriesMs', rec.seriesMs,
      'pin', rec.pin, 'pins', JSON.stringify(rec.pins), 'persSkipped', rec.persSkipped, 'pinsCapOk', pers&&pers.pinsCapOk, 'pinsN', pers&&pers.pinsN, 'maxPin_L0', pers&&pers.maxPin_L0, 'maxEdge_L0', pers&&pers.maxEdge_L0, 'phase2', pers&&pers.phase2, 'phase3', pers&&pers.phase3, 'nAfterP3', pers&&pers.nAfterP3, 'inflateP3', pers&&pers.inflateP3,
      'stepsP1', pers&&pers.stepsPhase1, 'stepsP2', pers&&pers.stepsPhase2, 'stepsP3', pers&&pers.stepsPhase3, 'firstTry', pers&&pers.firstTrySteps, 'h0', pers&&JSON.stringify(pers.h0), 'hRel', pers&&JSON.stringify(pers.hRel), 'hEnd', pers&&JSON.stringify(pers.hEnd), 't_r', pers&&JSON.stringify(pers.t_r), 'r2', JSON.stringify(rec.r2));
    return rec; }); }
  // ISO: перебор изотопии веера — каждая пара под-рёбер (движущееся под-ребро дуги против любого другого без общей вершины) по λ∈[0,1]
  function segseg(p1,q1,p2,q2){ const d1x=q1[0]-p1[0],d1y=q1[1]-p1[1],d1z=q1[2]-p1[2], d2x=q2[0]-p2[0],d2y=q2[1]-p2[1],d2z=q2[2]-p2[2]; const rx=p1[0]-p2[0],ry=p1[1]-p2[1],rz=p1[2]-p2[2];
    const a=d1x*d1x+d1y*d1y+d1z*d1z, e=d2x*d2x+d2y*d2y+d2z*d2z, f=d2x*rx+d2y*ry+d2z*rz; let s,t; const E=1e-14, cl=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
    if(a<=E&&e<=E){ s=0;t=0; } else if(a<=E){ s=0; t=cl(f/e,0,1); } else { const c=d1x*rx+d1y*ry+d1z*rz; if(e<=E){ t=0; s=cl(-c/a,0,1); } else { const b=d1x*d2x+d1y*d2y+d1z*d2z, dn=a*e-b*b; s=dn>E?cl((b*f-c*e)/dn,0,1):0; t=(b*s+f)/e; if(t<0){ t=0; s=cl(-c/a,0,1); } else if(t>1){ t=1; s=cl((b-c)/a,0,1); } } }
    const ax=p1[0]+d1x*s-(p2[0]+d2x*t), ay=p1[1]+d1y*s-(p2[1]+d2y*t), az=p1[2]+d1z*s-(p2[2]+d2z*t); return Math.sqrt(ax*ax+ay*ay+az*az); }
  function isoCheck(LL, L0v, KT){ const {loops, m}=LL; const SUB=STIR_SUB, tol=0.02*L0v, Z=[0,0,0]; KT=KT===undefined? 5 : KT;   // KT — худших пар (по lb, включая отсечённые) на палец и класс, досчитываемых до предела (tight*)
    let minNear=Infinity, minFar=Infinity, minNearS=Infinity, minFarS=Infinity, worstNear=null, worstFar=null, pairs=0, pruned=0, refined=0, prunedNear=0, prunedFar=0, tightNear=Infinity, tightFar=Infinity, worstTightNear=null, worstTightFar=null; const perFinger=[];
    const segBox=(a,b,x0,x1,pad)=>{ let t0=0,t1=1; for(let c=0;c<3;c++){ const d=b[c]-a[c], lo=x0[c]-pad, hi=x1[c]+pad; if(Math.abs(d)<1e-15){ if(a[c]<lo||a[c]>hi) return false; continue; }   // отрезок vs box (slab)
      let ta=(lo-a[c])/d, tb=(hi-a[c])/d; if(ta>tb){ const q=ta; ta=tb; tb=q; } if(ta>t0) t0=ta; if(tb<t1) t1=tb; if(t0>t1) return false; } return true; };
    const mv=(p,d,lam)=>[p[0]+lam*d[0], p[1]+lam*d[1], p[2]+lam*d[2]], rv=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
    const pairMin=(a0,a1,da0,da1,b0,b1,db0,db1,full)=>{   // {lb — сертифицированная нижняя оценка min_λ dist (обрезана у tol, если !full), smp — выборочный min, lam, refined, pruned}; full — досчитать до NLmax (tight)
      let gap=-Infinity; for(let k=0;k<3;k++){ const alo=Math.min(a0[k],a1[k],a0[k]+da0[k],a1[k]+da1[k]), ahi=Math.max(a0[k],a1[k],a0[k]+da0[k],a1[k]+da1[k]), blo=Math.min(b0[k],b1[k],b0[k]+db0[k],b1[k]+db1[k]), bhi=Math.max(b0[k],b1[k],b0[k]+db0[k],b1[k]+db1[k]); const g=Math.max(blo-ahi, alo-bhi); if(g>gap) gap=g; }
      if(gap>=tol && !full) return {lb:gap, smp:null, lam:null, refined:false, pruned:true};   // оболочки заметания дальше tol — пара безопасна при всех λ
      const V=Math.max(rv(da0,db0),rv(da0,db1),rv(da1,db0),rv(da1,db1));
      if(!(V>0)){ const d=segseg(a0,a1,b0,b1); return {lb:d, smp:d, lam:0, refined:false, pruned:false}; }   // взаимно неподвижны
      let NL=12, lb=Math.max(0,gap), smp=Infinity, lam=0, ref=false; const NLmax=Math.min(40000, Math.ceil(V/(0.2*tol))+1);
      while(true){ let mn=Infinity, ml=0; for(let s=0;s<=NL;s++){ const lm=s/NL; const d=segseg(mv(a0,da0,lm),mv(a1,da1,lm),mv(b0,db0,lm),mv(b1,db1,lm)); if(d<mn){ mn=d; ml=lm; } }
        if(mn<smp){ smp=mn; lam=ml; } const bnd=mn-0.5*V/NL; if(bnd>lb) lb=bnd;   // липшицева оценка: |d(λ)−d(λ')| ≤ V·|λ−λ'|
        if((lb>=tol && !full) || NL>=NLmax) break; NL=Math.min(NLmax, NL*8); ref=true; }
      return {lb:Math.max(0,lb), smp, lam, refined:ref, pruned:false}; };
    const topK=(arr, item)=>{ let p=arr.length; while(p>0 && arr[p-1].lb>item.lb) p--; arr.splice(p,0,item); if(arr.length>KT) arr.length=KT; };   // K пар с наименьшей lb (по возрастанию)
    for(let fi=0; fi<loops.length; fi++){ const l=loops[fi]; const F=l.F0, D=l.D; if(!F || !D) return {err:'loops['+fi+'] without F0/D (window.__stirDebug at build time?)'};
      const M=F.length, na=l.na, ka=l.ka; const arcQ=new Map(); for(let q=0;q<na;q++) arcQ.set((ka+q)%M, q);
      let x0=[Infinity,Infinity,Infinity], x1=[-Infinity,-Infinity,-Infinity]; for(let q=0;q<na;q++){ const p=F[(ka+q)%M], d=D[q]; for(let c=0;c<3;c++){ const lo=Math.min(p[c], p[c]+d[c]), hi=Math.max(p[c], p[c]+d[c]); if(lo<x0[c]) x0[c]=lo; if(hi>x1[c]) x1[c]=hi; } }
      const others=[]; for(let k=0;k<M;k++) if(segBox(F[k], F[(k+1)%M], x0, x1, 2*L0v)) others.push(k);
      let fnear=Infinity, ffar=Infinity, fnearS=Infinity, ffarS=Infinity, fwn=null, fwf=null, fref=0, fpr=0, fp=0, fprN=0, fprF=0; const topN=[], topF=[];
      for(let q=0;q<na-1;q++){ const k=(ka+q)%M, k1=(k+1)%M, a0=F[k], a1=F[k1], da0=D[q], da1=D[q+1];
        for(const kg of others){ let cd=Math.abs(kg-k); cd=Math.min(cd, M-cd); if(cd<2) continue; const qg=arcQ.get(kg); if(qg!==undefined && qg<q) continue;   // пара дуга—дуга считается один раз
          const b0=F[kg], b1=F[(kg+1)%M], db0=qg!==undefined? D[qg] : Z, db1=(qg!==undefined && qg+1<na)? D[qg+1] : Z;
          const r=pairMin(a0,a1,da0,da1,b0,b1,db0,db1); fp++; if(r.pruned) fpr++; if(r.refined) fref++;
          const w={lam:r.lam, k, kg, arc:qg!==undefined, cd, pruned:r.pruned, lb_L0:+(r.lb/L0v).toFixed(4), smp_L0:r.smp===null? null : +(r.smp/L0v).toFixed(4)};
          const it={lb:r.lb, w, args:[a0,a1,da0,da1,b0,b1,db0,db1]};
          if(cd<2*SUB){ if(r.pruned) fprN++; topK(topN, it); if(r.lb<fnear){ fnear=r.lb; fwn=w; } if(r.smp!==null && r.smp<fnearS) fnearS=r.smp; } else { if(r.pruned) fprF++; topK(topF, it); if(r.lb<ffar){ ffar=r.lb; fwf=w; } if(r.smp!==null && r.smp<ffarS) ffarS=r.smp; } } }
      let tN=Infinity, tF=Infinity, twN=null, twF=null;   // tight: K худших пар каждого класса досчитаны до предела — сертифицированный зазор (не обрезан у tol)
      for(const it of topN){ const r=pairMin(...it.args, true); if(r.lb<tN){ tN=r.lb; twN=Object.assign({}, it.w, {tight_L0:+(r.lb/L0v).toFixed(4), smp_L0:r.smp===null? null : +(r.smp/L0v).toFixed(4), lam:r.lam}); } }
      for(const it of topF){ const r=pairMin(...it.args, true); if(r.lb<tF){ tF=r.lb; twF=Object.assign({}, it.w, {tight_L0:+(r.lb/L0v).toFixed(4), smp_L0:r.smp===null? null : +(r.smp/L0v).toFixed(4), lam:r.lam}); } }
      perFinger.push({i:l.i, H_L0:+(l.H/L0v).toFixed(2), H_rho:+(l.H_rho||0).toFixed(2), w_L0:+(l.w/L0v).toFixed(2), tipW_w:+(l.sTop||1).toFixed(2), others:others.length, pairs:fp, pruned:fpr, prunedNear:fprN, prunedFar:fprF, refined:fref,
        lbNear_L0:+(fnear/L0v).toFixed(4), minNearS_L0:+(fnearS/L0v).toFixed(4), worstLbNear:fwn, tightNear_L0:+(tN/L0v).toFixed(4), worstTightNear:twN, lbFar_L0:+(ffar/L0v).toFixed(4), minFarS_L0:+(ffarS/L0v).toFixed(4), worstLbFar:fwf, tightFar_L0:+(tF/L0v).toFixed(4), worstTightFar:twF});
      pairs+=fp; pruned+=fpr; refined+=fref; prunedNear+=fprN; prunedFar+=fprF; if(fnear<minNear){ minNear=fnear; worstNear=Object.assign({finger:fi}, fwn); } if(ffar<minFar){ minFar=ffar; worstFar=Object.assign({finger:fi}, fwf); } minNearS=Math.min(minNearS,fnearS); minFarS=Math.min(minFarS,ffarS);
      if(tN<tightNear){ tightNear=tN; worstTightNear=Object.assign({finger:fi}, twN); } if(tF<tightFar){ tightFar=tF; worstTightFar=Object.assign({finger:fi}, twF); } }
    return {fingers:loops.length, m, tol_L0:0.02, ok:minNear>tol && minFar>tol, lbNear_L0:+(minNear/L0v).toFixed(4), lbFar_L0:+(minFar/L0v).toFixed(4), lbMin_L0:+(Math.min(minNear,minFar)/L0v).toFixed(4),   // lb* — сертифицированные оценки, обрезанные у tol (вердикт), не зазор
      minNearS_L0:+(minNearS/L0v).toFixed(4), minFarS_L0:+(minFarS/L0v).toFixed(4), tightNear_L0:+(tightNear/L0v).toFixed(4), tightFar_L0:+(tightFar/L0v).toFixed(4), worstLbNear:worstNear, worstLbFar:worstFar, worstTightNear, worstTightFar, pairs, pruned, prunedNear, prunedFar, refined, perFinger}; }
  if(want('loops')){ out.loops={}; for(const k of ['trefoil','figure8','rand12','rand30']) out.loops[k]=one(k,'loops'); }
  if(want('invert')){ out.invert={}; for(const k of ['trefoil','figure8','rand12','rand30']) out.invert[k]=one(k,'invert'); }
  if(want('iso')){ if(!want('loops')) one('trefoil','loops');   // ISO без части loops: хотя бы один пресет плюс rand30 при Stiff.=1 (spec D: пресеты и rand30)
    const rec=one('rand30_b1','loops',[3,1,1]); stirLoopsImage=origLI;   // rand30 при bendCoef=1 (имя прогона — ключ builds; prep — rand30)
    const t0=Date.now(); const L0of=X=>{ let t=0; const n=X.length; for(let j=0;j<n;j++){ const a=X[j], b=X[(j+1)%n]; t+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]); } return t/n; };
    const byKnot={}; let all=[];   // перебор изотопии каждого построения каждого прогона (пресеты части loops + rand30_b1)
    for(const nm of Object.keys(builds)){ const isos=builds[nm].map(bld=>isoCheck(bld, L0of(bld.X))); all=all.concat(isos);
      byKnot[nm]={builds:isos.length, allOk:isos.length>0 && isos.every(x=>x.ok), err:isos.map(x=>x.err).filter(Boolean), lbMin_L0:Math.min(...isos.map(x=>x.lbMin_L0)), tightNear_L0:Math.min(...isos.map(x=>x.tightNear_L0)), tightFar_L0:Math.min(...isos.map(x=>x.tightFar_L0)), isos}; }
    const mn=f=>all.length? Math.min(...all.map(f)) : null;
    out.iso={mode:rec.mode, loops:rec.remap&&rec.remap.loops, rej:rec.rej, rejc:rec.remap&&rec.remap.rejc, builds:all.length, knots:Object.keys(byKnot), allOk:all.length>0 && all.every(x=>x.ok) && Object.keys(byKnot).length>=(want('loops')? 5 : 2), err:all.map(x=>x.err).filter(Boolean),
      lbNear_L0:mn(x=>x.lbNear_L0), lbFar_L0:mn(x=>x.lbFar_L0), lbMin_L0:mn(x=>x.lbMin_L0), minNearS_L0:mn(x=>x.minNearS_L0), minFarS_L0:mn(x=>x.minFarS_L0), tightNear_L0:mn(x=>x.tightNear_L0), tightFar_L0:mn(x=>x.tightFar_L0), byKnot, isoMs:Date.now()-t0};
    console.error('iso builds', all.length, 'knots', JSON.stringify(Object.fromEntries(Object.entries(byKnot).map(([k,v])=>[k,[v.builds,v.allOk,v.tightNear_L0,v.tightFar_L0]]))), 'allOk', out.iso.allOk, 'lbNear_L0', out.iso.lbNear_L0, 'lbFar_L0', out.iso.lbFar_L0, '(certified bounds cut at tol) sampled minNearS/minFarS', out.iso.minNearS_L0, out.iso.minFarS_L0, 'tightNear_L0', out.iso.tightNear_L0, 'tightFar_L0', out.iso.tightFar_L0, 'isoMs', out.iso.isoMs,
      JSON.stringify(all.map(x=>({fingers:x.fingers, m:x.m, ok:x.ok, err:x.err, lbNear:x.lbNear_L0, lbFar:x.lbFar_L0, minNearS:x.minNearS_L0, minFarS:x.minFarS_L0, tightNear:x.tightNear_L0, tightFar:x.tightFar_L0, worstTightNear:x.worstTightNear, worstTightFar:x.worstTightFar, pairs:x.pairs, pruned:x.pruned, refined:x.refined}))).slice(0,2400)); }
  stirLoopsImage=origLI;
  const lr=Object.values(out.loops||{}); out.fallback=lr.filter(r=>r.mode!=='loops').length;   // общий вердикт: все loops-записи с asserts.ok и asserts3.ok (N0 после фазы 3), пины: при PIN — pers есть, пинов > 0 (по петле), правило шапки, на месте (< 1e-9·L0), рёбра ровные (< 1e-6·L0), фаза 2 была; при PIN=0 — пинов и фаз нет; и (если было) iso.allOk
  out.pin=PIN; const pinsOk=lr.every(r=> r.mode!=='loops' || (PIN
    ? !!(r.pers && r.pers.pinsN>0 && r.pins && r.pins.length===((r.remap&&r.remap.loops)||[]).length && r.pers.pinsN===r.pins.reduce((a,b)=>a+b,0) && r.pers.pinsCapOk && r.pers.maxPin_L0<1e-9 && r.pers.maxEdge_L0<1e-6 && r.pers.phase2)
    : !!(r.pers && r.pers.pinsN===null && !r.pers.phase2 && r.pers.pinsCapOk && r.pins===null && r.pin===false)));
  const p3Ok=lr.every(r=>r.mode!=='loops' || (r.asserts3 && r.asserts3.ok===true));
  out.ok=lr.every(r=>r.mode!=='loops' || (r.asserts && r.asserts.ok===true)) && pinsOk && p3Ok && (!out.iso || out.iso.allOk); console.error('VERDICT ok', out.ok, 'fallback', out.fallback, 'pin', PIN, 'pinsOk', pinsOk, 'phase3Ok', p3Ok, 'iso', out.iso? out.iso.allOk : 'n/a');
  return out; })()
