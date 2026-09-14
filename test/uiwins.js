// 2.40: окна попыток — маркеры shown/best («Min» в подписи), выбор кликом (попытка в главном виде), ползунок Thick. без счёта,
// новый запуск снимает выбор; выбор окна ставит L0 попытки (трубка/ядро её длины); на паузе серии выбор не применяется, ▶ продолжает серию.
// Последовательная серия из 3 попыток на трилистнике (стенд: воркеров нет). Верdict — out.ok.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={};
  // DOM-мок побогаче: msResultAdd создаёт окно только при querySelector/querySelectorAll (стендовые элементы их не имеют — окна без el)
  const mkCls=()=>{ const s=new Set(); return {add:(...a)=>a.forEach(x=>s.add(x)), remove:(...a)=>a.forEach(x=>s.delete(x)),
    toggle:(x,f)=>{ if(f===undefined) f=!s.has(x); if(f) s.add(x); else s.delete(x); return f; }, contains:x=>s.has(x), list:()=>[...s]}; };
  function mkEl(tag){ const L={}; const el={tag, classList:mkCls(), dataset:{}, style:{}, children:[], parentNode:null, textContent:'', q:{},
    set className(v){ el.classList.add(v); }, get className(){ return el.classList.list().join(' '); },
    set innerHTML(v){ el._html=v; el.textContent=v.replace(/<[^>]+>/g,''); }, get innerHTML(){ return el._html||''; },   // textContent — без разметки (<b> у Min)
    querySelector:(sel)=>{ if(!el.q[sel]) el.q[sel]=mkEl('sub'); return el.q[sel]; }, querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:172,height:172,right:172,bottom:172}),
    addEventListener:(t,f)=>{ (L[t]=L[t]||[]).push(f); }, removeEventListener:()=>{}, dispatch:(t,ev)=>{ for(const f of (L[t]||[])) f(ev); },
    appendChild:(c)=>{ el.children.push(c); c.parentNode=el; }, removeChild:(c)=>{ el.children=el.children.filter(x=>x!==c); c.parentNode=null; }, insertBefore:(c)=>{ el.children.push(c); c.parentNode=el; } };
    return el; }
  document.createElement=(tag)=>mkEl(tag);
  const dock=H.el('msDock'); dock.querySelectorAll=()=>[]; dock.appendChild=(c)=>{ (dock.children=dock.children||[]).push(c); c.parentNode=dock; };
  dock.removeChild=(c)=>{ dock.children=(dock.children||[]).filter(x=>x!==c); c.parentNode=null; }; dock.insertBefore=dock.appendChild;
  const runEnd=(budget)=>{ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; };
  const has=(w,c)=>!!(w.el && w.el.classList.contains(c)), cap=w=>w.el? w.el.querySelector('.msE').textContent : null;
  const wins=()=>_msWins.slice().sort((a,b)=>a.k-b.k).map(w=>({k:w.k, E:isFinite(w.E)? +w.E.toPrecision(4) : String(w.E), N:w.verts.length, cls:w.el.classList.list().sort(), cap:cap(w)}));
  const shownList=()=>_msWins.filter(w=>has(w,'shown')), bestList=()=>_msWins.filter(w=>has(w,'best'));
  const cen=vs=>{ const c=new THREE.Vector3(); for(const v of vs) c.add(v); return c.multiplyScalar(1/vs.length); };
  const sameShape=(a,b)=>{ if(a.length!==b.length) return {same:false, N:[a.length,b.length]}; const ca=cen(a), cb=cen(b); let raw=0, rel=0;
    for(let i=0;i<a.length;i++){ raw=Math.max(raw, a[i].distanceTo(b[i])); rel=Math.max(rel, a[i].clone().sub(ca).distanceTo(b[i].clone().sub(cb))); }
    return {same:rel<1e-9, N:[a.length,b.length], maxDiffCentred:+rel.toExponential(2), maxDiffRaw:+raw.toExponential(2)}; };
  const click=w=>{ w.el.dispatch('pointerdown', {clientX:50, clientY:50, target:w.el}); w.el.dispatch('pointerup', {clientX:50, clientY:50, target:w.el}); };
  const checks={};
  // серия: трилистник, 3 попытки
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.clickPreset('trefoil'); H.set({ms:3}); H.play(); out.run=runEnd(60000);
  { const sh=shownList(), bs=bestList(), b=bs[0]||null;
    out.after={wins:wins(), nShown:sh.length, nBest:bs.length, bestE:_msBest? +_msBest.E.toPrecision(5) : null, bestWinE:b? +b.E.toPrecision(5) : null, bestCap:b? cap(b) : null,
      sel:_msSel? _msSel.k : null, shownVar:_msShown? _msShown.k : null, max:_msMax? _msMax.k : null, main:_msBest? sameShape(verts, _msBest.verts) : null, status:H.dbg().status.slice(0,140)};
    checks.threeWins=_msWins.length===3 && _msWins.every(w=>!!w.el);
    checks.oneShown=sh.length===1; checks.oneBest=bs.length===1; checks.shownIsBest=sh.length===1 && sh[0]===b;   // после серии показана лучшая
    checks.bestIsMsBest=!!b && !!_msBest && b.E===_msBest.E;
    checks.bestCapMin=!!b && / Min$/.test(cap(b).split(' · ')[0]) && /^E \d/.test(cap(b));   // «E 0.259 Min» — до пометки о толщине
    checks.othersNoMin=_msWins.filter(w=>w!==b).every(w=>!/Min/.test(cap(w)));
    checks.mainIsBest=!!out.after.main && out.after.main.same; }
  // выбор КАЖДОГО окна: L0 = ребро попытки (лифты различаются L0 и при равном N), трубка — от длины нити окна и его толщины
  { const meanEdge=vs=>{ let t=0; for(let i=0;i<vs.length;i++) t+=vs[i].distanceTo(vs[(i+1)%vs.length]); return t/vs.length; };
    out.l0=[]; let ok=true;
    for(const w of _msWins.slice().sort((a,b)=>b.k-a.k)){ msSelect(w);   // порядок 3,2,1 — заканчиваем не на №2 (клик по №2 ниже должен перестроить трубку)
      const r={k:w.k, N, L0:+L0.toPrecision(6), edge_L0:+(meanEdge(verts)/L0).toPrecision(8), tube:+tubeRadius.toPrecision(6), tubeWin:+(0.5*thickCoef*(N*L0/UNIT_DIV)*thickOf(w)).toPrecision(6)};
      r.ok=N===w.verts.length && Math.abs(meanEdge(verts)/L0-1)<1e-9 && Math.abs(tubeRadius-0.5*thickCoef*(N*L0/UNIT_DIV)*thickOf(w))<1e-12; ok=ok&&r.ok; out.l0.push(r); }
    checks.selSetsL0=ok && _msSel===_msWins.find(w=>w.k===1); }
  // клик по окну №2: выбор, главный вид — её форма, shown переехал, best прежний, раскрытия нет
  { const w2=_msWins.find(w=>w.k===2), b0=bestList()[0], cap0=cap(b0), geo0=tubeMesh.geometry; click(w2);
    const sh=shownList(), bs=bestList();
    out.click={sel:_msSel? _msSel.k : null, shownVar:_msShown? _msShown.k : null, main:sameShape(verts, w2.verts), N, thickFit:+_thickFit.toFixed(3), ePrev:+_ePrev.toPrecision(5), wins:wins(), max:_msMax? _msMax.k : null,
      tubeRebuilt:tubeMesh.geometry!==geo0, running:H.running(), par:!!_par, status:H.dbg().status.slice(0,120)};
    checks.selIs2=_msSel===w2; checks.shownMoved=sh.length===1 && sh[0]===w2 && _msShown===w2;
    checks.mainIs2=out.click.main.same && N===w2.verts.length; checks.bestUnchanged=bs.length===1 && bs[0]===b0 && cap(b0)===cap0;
    checks.noMaximise=_msMax===null; checks.tubeRebuilt=tubeMesh.geometry!==geo0; checks.noRunOnClick=!H.running() && !_par;
    // повторный клик — ничего не меняет
    const geo1=tubeMesh.geometry; click(w2); checks.reclickIdempotent=_msSel===w2 && tubeMesh.geometry===geo1;
    // двойной клик по заголовку — раскрытие (одиночный не раскрывает), выбор прежний
    w2.el.querySelector('.msHead').dispatch('dblclick', {stopPropagation(){}}); out.click.dblMax=_msMax? _msMax.k : null; checks.dblclickExpands=_msMax===w2 && _msSel===w2;
    w2.el.querySelector('.msClose').onclick({stopPropagation(){}}); }   // крестик — свернуть (завершается по таймеру/transitionend)
  // ползунок Thick.: счёт не запускается, главная трубка перестроена, выбор и маркеры прежние
  { const w2=_msWins.find(w=>w.k===2), geo0=tubeMesh.geometry, r0=tubeRadius; H.setSlider('thick', 3);
    out.thick={running:H.running(), par:!!_par, redo:!!_msRedo, stale:_msStale.length, pending:!!_physChgT, tubeRebuilt:tubeMesh.geometry!==geo0, radius:[+r0.toFixed(4), +tubeRadius.toFixed(4)],
      sel:_msSel? _msSel.k : null, shownVar:_msShown? _msShown.k : null, wins:wins(), status:H.dbg().status.slice(0,100)};
    checks.thickNoRun=!H.running() && !_par && !_msRedo && !_msStale.length && !_physChgT;
    checks.thickTubeRebuilt=tubeMesh.geometry!==geo0 && Math.abs(tubeRadius-r0*3/5)<1e-9;   // радиус ∝ ползунку (толщина попытки та же)
    checks.thickKeepsSel=_msSel===w2 && _msShown===w2 && shownList().length===1 && bestList().length===1; }
  // кнопка Physics (после серии кнопка — Stir; вернуть режим Physics): новый запуск снимает выбор, окна не «shown» (считаемая попытка окна не имеет)
  { stirEnable(false); H.play();
    out.physics={sel:_msSel? _msSel.k : null, shownVar:_msShown? _msShown.k : null, running:H.running(), nShown:shownList().length, play:H.el('play').textContent};
    checks.physicsClearsSel=_msSel===null && _msShown===null && H.running() && shownList().length===0;
    const w2=_msWins.find(w=>w.k===2); click(w2); out.physics.clickWhileRunning={sel:_msSel? _msSel.k : null, N};   // на ходу (последовательно) выбор не применяется
    checks.clickIgnoredWhileRunning=_msSel===null;
    H.play(); out.physics.stopped=!H.running(); }
  // пауза серии: клик по окну не применяется (форма попытки цела), ▶ продолжает серию с той же попытки, все 3 слота заполнены
  { H.el('clear').onclick(); if(H.running()) H.play(); H.clickPreset('trefoil'); H.set({ms:3}); H.play();
    let st=0; while(_msEnergies.length<1 && H.running() && st<60000){ H.step(100); st+=100; }
    H.step(300); const before=verts.map(v=>v.clone()), N0=N, L00=L0; H.play();   // середина попытки 2 — пауза
    const w1=_msWins.find(w=>w.k===1), ok=msSelect(w1);
    const maxd=(a,b)=>{ if(a.length!==b.length) return Infinity; let m=0; for(let i=0;i<a.length;i++) m=Math.max(m, a[i].distanceTo(b[i])); return m; };
    out.pause={paused:_msPaused, running:H.running(), round:_msRound, energies:_msEnergies.length, selRet:ok, sel:_msSel? _msSel.k : null, N:[N0,N], shapeKept:maxd(verts,before), L0Kept:L0===L00, shownVar:_msShown? _msShown.k : null};
    checks.pauseRefusesSel=_msPaused && !H.running() && ok===false && _msSel===null && N===N0 && maxd(verts,before)===0 && L0===L00;
    H.play(); out.pause.resume={running:H.running(), round:_msRound, K:_msK, status:H.dbg().status.slice(0,80)};
    checks.pauseResumes=H.running() && / try 2\/3/.test(H.dbg().status) && _msRound===1;
    const r=runEnd(60000); out.pause.final={...r, energies:_msEnergies.map(e=>+e.toPrecision(6)), wins:_msWins.length, status:H.dbg().status.slice(0,80)};
    checks.pauseSeriesCompletes=r.settled && _msEnergies.length===3 && _msEnergies.every(isFinite) && _msWins.length===3;
    // Physics от выбранной попытки (L0 — её ребро): длина нити не меняется
    const w3=_msWins.find(w=>w.k===3); msSelect(w3); const len=vs=>{ let t=0; for(let i=0;i<vs.length;i++) t+=vs[i].distanceTo(vs[(i+1)%vs.length]); return t; };
    const len0=len(verts); stirEnable(false); H.play(); H.step(200); const len1=len(verts); H.play();
    out.pause.physFromSel={sel3:_msSel===null, len0:+len0.toFixed(6), len1:+len1.toFixed(6), rel:+Math.abs(len1/len0-1).toExponential(2)};
    checks.physFromSelKeepsLength=Math.abs(len1/len0-1)<1e-6; }
  out.checks=checks; out.ok=Object.values(checks).every(Boolean);
  return out; })()
