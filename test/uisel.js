// 2.40: выбор окна в параллельной серии (стенд: фиктивные воркеры, сообщения шлём вручную). Три случая:
// (a) выбранный воркер падает — выбор снят, главный вид за наименьшей идущей, после серии показан лучший;
// (b) выбор попытки из очереди — главный вид сразу её verts (лифт), со первого снимка — слежение;
// (c) пауза при выбранной незавершённой попытке — показан лучший, выбор снят. Верdict — out.ok.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={}, checks={};
  const mkCls=()=>{ const s=new Set(); return {add:(...a)=>a.forEach(x=>s.add(x)), remove:(...a)=>a.forEach(x=>s.delete(x)),
    toggle:(x,f)=>{ if(f===undefined) f=!s.has(x); if(f) s.add(x); else s.delete(x); return f; }, contains:x=>s.has(x), list:()=>[...s]}; };
  function mkEl(tag){ const L={}; const el={tag, classList:mkCls(), dataset:{}, style:{}, children:[], parentNode:null, textContent:'', q:{},
    set className(v){ el.classList.add(v); }, get className(){ return el.classList.list().join(' '); },
    set innerHTML(v){ el._html=v; el.textContent=v.replace(/<[^>]+>/g,''); }, get innerHTML(){ return el._html||''; },
    querySelector:(sel)=>{ if(!el.q[sel]) el.q[sel]=mkEl('sub'); return el.q[sel]; }, querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:172,height:172,right:172,bottom:172}),
    addEventListener:(t,f)=>{ (L[t]=L[t]||[]).push(f); }, removeEventListener:()=>{}, dispatch:(t,ev)=>{ for(const f of (L[t]||[])) f(ev); },
    appendChild:(c)=>{ el.children.push(c); c.parentNode=el; }, removeChild:(c)=>{ el.children=el.children.filter(x=>x!==c); c.parentNode=null; }, insertBefore:(c)=>{ el.children.push(c); c.parentNode=el; } };
    return el; }
  document.createElement=(tag)=>mkEl(tag);
  const dock=H.el('msDock'); dock.querySelectorAll=()=>[]; dock.appendChild=(c)=>{ (dock.children=dock.children||[]).push(c); c.parentNode=dock; };
  dock.removeChild=(c)=>{ dock.children=(dock.children||[]).filter(x=>x!==c); c.parentNode=null; }; dock.insertBefore=dock.appendChild;
  // фиктивные воркеры: сообщения — через W[k].onmessage
  let W=[]; global.Worker=class{ constructor(){ this.msgs=[]; this.onmessage=null; this.onerror=null; this.dead=false; W.push(this); } postMessage(m){ this.msgs.push(m); } terminate(){ this.dead=true; } };
  parAvailable=()=>true; _parWorkerURL=()=>'fake';
  const cap=w=>w.el? w.el.querySelector('.msE').textContent : null, has=(w,c)=>!!(w.el && w.el.classList.contains(c));
  const winfo=w=>({k:w.k, E:isFinite(w.E)? +w.E.toPrecision(4) : String(w.E), cls:w.el.classList.list().sort(), cap:cap(w)});
  const flat=vs=>{ const f=new Float32Array(vs.length*3); for(let i=0;i<vs.length;i++){ f[3*i]=vs[i].x; f[3*i+1]=vs[i].y; f[3*i+2]=vs[i].z; } return f; };
  const cen=vs=>{ const c=new THREE.Vector3(); for(const v of vs) c.add(v); return c.multiplyScalar(1/vs.length); };
  const maxd=(a,b)=>{ if(!a || !b || a.length!==b.length) return Infinity; const ca=cen(a), cb=cen(b); let m=0; for(let i=0;i<a.length;i++) m=Math.max(m, a[i].clone().sub(ca).distanceTo(b[i].clone().sub(cb))); return m; };
  const snap=(lift,k,s)=>lift.map(v=>new THREE.Vector3(v.x*(1+0.1*(k+1)*s), v.y*(1-0.03*(k+1)*s), v.z+0.2*k*s*Math.sin(v.x)));   // масштаб/изгиб, не сдвиг — recenter не маскирует
  const prog=(k,vs,s)=>W[k].onmessage({data:{type:'progress', steps:100*s, E:1+k, inflate:1, stiff:false, thick:1, verts:flat(vs)}});
  const done=(k,vs,E)=>W[k].onmessage({data:{type:'done', E, verts:flat(vs), thick:1, steps:900, det:3, runDet:3, key:constsKey(), circle:false, jammed:false}});
  const start=(tries,hc)=>{ W=[]; navigator.hardwareConcurrency=hc; H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
    H.clickPreset('trefoil'); H.set({ms:tries}); H.play(); return _msLift.map(v=>v.clone()); };
  const pv=()=>_par && _par.preview? _par.preview.k : null, sh=()=>_msShown? _msShown.k : null, sl=()=>_msSel? _msSel.k : null;
  // (a) выбранный воркер падает
  { const lift=start(5, 9); out.a={start:{par:!!_par, K:_par&&_par.K, W:_par&&_par.W, active:_par&&[..._par.active.keys()]}};
    if(!_par || _par.W<5){ out.a.skip='not all 5 active'; }
    else { const S={}; for(let k=0;k<5;k++){ S[k]=snap(lift,k,1); prog(k,S[k],1); } parRender();
      msSelect(_par.wins[0]); out.a.sel={sel:sl(), preview:pv(), shown:sh(), mainIsS0:+maxd(verts,S[0]).toExponential(2)};
      checks.aSelFollows=_msSel===_par.wins[0] && pv()===0 && sh()===1 && maxd(verts,S[0])<1e-6;
      W[0].onmessage({data:{type:'error', message:'boom'}});   // воркер 0 падает
      const S1b=snap(lift,1,2); prog(1,S1b,2); prog(1,S1b,3); parRender();   // дважды один снимок — интерполяция кадра даёт его же
      out.a.failed={res0:_par.results[0], cap1:cap(_par.wins[0]), sel:sl(), preview:pv(), shown:sh(), active:[..._par.active.keys()], mainIsS1b:+maxd(verts,S1b).toExponential(2), mainIsS0:+maxd(verts,S[0]).toExponential(2), status:H.dbg().status.slice(0,120)};
      checks.aFailClearsSel=_msSel===null && pv()===1 && sh()===2 && _par.active.has(1);   // слежение — за наименьшей идущей
      checks.aMainFollowsLive=maxd(verts,S1b)<1e-6;
      const Ev={1:0.5, 2:0.4, 3:0.25, 4:0.6}, R={}; for(const k of [1,2,4,3]){ R[k]=snap(lift,k,5); done(k,R[k],Ev[k]); }
      const wins=_msWins.slice().sort((a,b)=>a.k-b.k), best=wins.find(w=>has(w,'best')), shown=wins.filter(w=>has(w,'shown'));
      out.a.end={par:!!_par, running:H.running(), sel:sl(), shown:sh(), bestE:_msBest&&_msBest.E, ePrev:_ePrev, mainIsBest:+maxd(verts,_msBest.verts).toExponential(2), mainIsW1:+maxd(verts,wins[0].verts).toExponential(2), wins:wins.map(winfo), status:H.dbg().status.slice(0,160)};
      checks.aEndBestShown=!_par && _msSel===null && !!best && best.k===4 && shown.length===1 && shown[0]===best && _msShown===best && maxd(verts,_msBest.verts)<1e-9 && _ePrev===0.25;
      checks.aFailedWinNotShown=!has(wins[0],'shown') && cap(wins[0])==='failed'; } }
  // (b) выбор попытки из очереди (Tries 5, W 3)
  { const lift=start(5, 4); out.b={start:{par:!!_par, K:_par&&_par.K, W:_par&&_par.W, active:_par&&[..._par.active.keys()], queue:_par&&[..._par.queue]}};
    if(!_par || _par.W!==3){ out.b.skip='W!=3'; }
    else { const S2=snap(lift,2,1); prog(2,S2,1); parRender(); out.b.follow3={preview:pv(), shown:sh(), mainIsS2:+maxd(verts,S2).toExponential(2)};
      const w5=_par.wins[4]; const ok=msSelect(w5); parRender();
      out.b.selQueued={ret:ok, sel:sl(), preview:pv(), shown:sh(), nShown:_msWins.filter(w=>has(w,'shown')).length, mainIsW5:+maxd(verts,w5.verts).toExponential(2), mainIsS2:+maxd(verts,S2).toExponential(2), N, L0:+L0.toPrecision(6)};
      checks.bQueuedShowsOwnVerts=ok && _msSel===w5 && pv()===null && _msShown===w5 && maxd(verts,w5.verts)<1e-9 && N===w5.verts.length;
      const S2b=snap(lift,2,2); prog(2,S2b,2); parRender();   // попытка 3 шлёт ещё — главный вид не возвращается
      out.b.moreSnaps3={preview:pv(), shown:sh(), mainIsW5:+maxd(verts,w5.verts).toExponential(2)}; checks.bStaysOnQueued=pv()===null && _msShown===w5 && maxd(verts,w5.verts)<1e-9;
      done(0, snap(lift,0,5), 0.5); done(1, snap(lift,1,5), 0.4);   // №1, №2 закончились — стартуют №4, №5
      out.b.launched={active:[..._par.active.keys()], queue:[..._par.queue], workers:W.length, preview:pv(), shown:sh()};
      const S5=snap(lift,4,1); prog(4,S5,1); parRender();
      out.b.snap5={preview:pv(), shown:sh(), mainIsS5:+maxd(verts,S5).toExponential(2), status:H.dbg().status.slice(0,120)};
      checks.bFollowsOnFirstSnap=pv()===4 && _msShown===w5 && maxd(verts,S5)<1e-6;
      const R5=snap(lift,4,5); done(4,R5,0.3); out.b.done5={sel:sl(), shown:sh(), mainIsR5:+maxd(verts,R5).toExponential(2), par:!!_par};
      checks.bDoneShowsResult=_msSel===w5 && _msShown===w5 && maxd(verts,R5)<1e-5 && !!_par;   // 1e-5: verts прошли через Float32
      done(2, snap(lift,2,5), 0.45); done(3, snap(lift,3,5), 0.35);
      out.b.end={par:!!_par, sel:sl(), shown:sh(), bestE:_msBest&&_msBest.E, mainIsR5:+maxd(verts,R5).toExponential(2)};
      checks.bSelSurvivesEnd=!_par && _msSel===w5 && _msShown===w5 && maxd(verts,R5)<1e-5 && _msBest.E===0.3; } }
  // (c) пауза при выбранной незавершённой попытке: она «stopped» без результата — показан лучший, выбор снят
  { const lift=start(3, 9); out.c={start:{par:!!_par, K:_par&&_par.K, W:_par&&_par.W}};
    if(!_par || _par.W<3){ out.c.skip='not all 3 active'; }
    else { for(let k=0;k<3;k++) prog(k,snap(lift,k,1),1); const R0=snap(lift,0,5); done(0,R0,0.3);
      msSelect(_par.wins[2]); out.c.sel={sel:sl(), preview:pv(), shown:sh()};
      H.play();   // пауза → parCancel
      const wins=_msWins.slice().sort((a,b)=>a.k-b.k);
      out.c.paused={par:!!_par, running:H.running(), sel:sl(), shown:sh(), cap3:cap(wins[2]), mainIsR0:+maxd(verts,R0).toExponential(2), wins:wins.map(winfo), status:H.dbg().status.slice(0,100)};
      checks.cPauseShowsBest=!_par && _msSel===null && _msShown===wins[0] && has(wins[0],'best') && has(wins[0],'shown') && !has(wins[2],'shown') && cap(wins[2])==='stopped' && maxd(verts,R0)<1e-5; } }
  out.checks=checks; out.ok=Object.values(checks).every(Boolean);
  return out; })()
