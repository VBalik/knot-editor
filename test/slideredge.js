// 2.31→2.40: крайние случаи смены ползунков (последовательный путь): те же значения, пауза, последние 350 мс.
// Критерий 2.40: все места заполнены, ничего не ставится в досчёт; попытка, посчитанная при нынешних значениях (ключ = нынешний), имеет
// энергию = истинной энергии своей формы при нынешних константах; законченные при прежних значениях — нетронуты (энергия и старый ключ).
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const trueE=(vs, t)=>{ const kv=verts, kn=N, kl=L0, ki=_inflate, kb=_kBmul, kr=_kRmul, kt=_thickFit; _setVertsFrom(vs); _inflate=1; _kBmul=null; _kRmul=null; _thickFit=(t>0? t : 1); updateGeomUnits();
    const E=energyGrad(false).E; verts=kv; N=kn; L0=kl; if(!_fx||_fx.length!==N) allocBuffers(); _thickFit=kt; updateGeomUnits(); _inflate=ki; _kBmul=kb; _kRmul=kr; return E; };
  const check=(key0)=>{ const cur=constsKey(); const rows=_msWins.slice().sort((a,b)=>a.k-b.k).map(w=>{ const i=w.k-1, r=_msEnergies[i], e=trueE(w.verts, _msThick[i]);
      return {k:w.k, key:_msKey[i]===cur? 'cur' : (_msKey[i]===key0? 'old' : _msKey[i]), shown:(r===undefined?'—':(isFinite(r)? +(+r).toPrecision(5) : 'jam')), rel:(r===undefined||!isFinite(r)||!isFinite(e))? null : +(Math.abs(e-r)/Math.abs(e)).toExponential(1)}; });
    const curRows=rows.filter(x=>x.key==='cur'); return {rows, maxRelCur:Math.max(0,...curRows.map(x=>x.rel===null?0:x.rel)), nCur:curRows.length, undef:_msEnergies.filter(e=>e===undefined).length, jams:_msEnergies.filter(e=>e!==undefined&&!isFinite(e)).length, stale:_msStale.length+(_msRedo?1:0)}; };
  const runEnd=(b=200000)=>{ let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=b) break; } return !o.running; };
  const start=(seed)=>{ H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',2); H.setSlider('bendCoef',8); H.setSlider('repCoef',2); seeded(seed, ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<30); }); H.set({ms:4}); H.play(); };
  const waitFinished=(n)=>{ let st=0; while(_msEnergies.filter(e=>e!==undefined).length<n && H.running() && st<80000){ H.step(100); st+=100; } };
  // (a) увели и вернули к прежнему значению в пределах задержки — ничего не должно измениться
  start(16001); waitFinished(1); const g0=constsKey();
  const b=document.getElementById('bendCoef'); for(const v of [12,15,10,8]){ b.value=String(v); b.oninput(); } window.__physFlush();
  out.sameValues={keyBefore:g0, keyAfter:constsKey(), applied:_physAppliedKey, stale:_msStale.length, mixed:_parMixed};
  out.sameValues.settled=runEnd(); out.sameValues.final=check(g0); out.sameValues.status=H.dbg().status.slice(0,120);
  out.sameValues.ok=out.sameValues.keyAfter===g0 && out.sameValues.stale===0 && !out.sameValues.mixed && out.sameValues.settled && out.sameValues.final.undef===0 && out.sameValues.final.nCur===4 && out.sameValues.final.maxRelCur<1e-2;
  // (b) пауза → смена → продолжение: законченные до паузы — нетронуты (старый ключ), остальные — при новых значениях
  start(16002); waitFinished(2); const gb=constsKey();
  H.play();                                               // пауза
  const beforeB=_msEnergies.slice(), nbB=beforeB.filter(e=>e!==undefined).length;
  out.paused={pausedFlag:_msPaused, running:H.running()};
  H.setSlider('repCoef',5); H.setSlider('bendCoef',13);   // смена на паузе (в покое — сразу; счёт не запускается)
  out.paused.afterChange={running:H.running(), stale:_msStale.length, redo:!!_msRedo, mixed:_parMixed, unchanged:beforeB.every((e,i)=>e===_msEnergies[i])};
  H.play();                                               // продолжить
  out.paused.resumed=H.running();
  out.paused.settled=runEnd(); out.paused.final=check(gb); out.paused.status=H.dbg().status.slice(0,170);
  out.paused.ok=out.paused.pausedFlag && !out.paused.running && !out.paused.afterChange.running && out.paused.afterChange.stale===0 && out.paused.afterChange.unchanged && out.paused.resumed && out.paused.settled
    && out.paused.final.undef===0 && out.paused.final.stale===0 && out.paused.final.rows.slice(0,nbB).every(x=>x.key==='old') && out.paused.final.rows.slice(nbB).every(x=>x.key==='cur') && out.paused.final.maxRelCur<1e-2
    && beforeB.slice(0,nbB).every((e,i)=>e===_msEnergies[i]) && /finished tries not recomputed/.test(out.paused.status);
  // (c) смена за миг до конца серии (отложенный таймер ещё не сработал): последняя попытка доигрывает с новыми (ключ нынешний), прежние — нетронуты
  start(16003); const gc=constsKey(); let st=0; while(_msRound<_msK-1 && H.running() && st<80000){ H.step(100); st+=100; }   // последний раунд
  const beforeC=_msEnergies.slice(), nbC=beforeC.filter(e=>e!==undefined).length;
  H.step(300); const r=document.getElementById('repCoef'); r.value='4'; r.oninput();          // таймер 350 мс взведён, но не сработал
  out.last={pending:!!_physChgT, keyBefore:constsKey(), stale:_msStale.length};
  out.last.settled=runEnd(); out.last.keyAfter=constsKey(); out.last.final=check(gc); out.last.status=H.dbg().status.slice(0,170);
  out.last.ok=out.last.pending && out.last.stale===0 && out.last.settled && out.last.final.undef===0 && out.last.final.stale===0 && nbC===3 && out.last.final.rows.slice(0,3).every(x=>x.key==='old')
    && out.last.final.rows[3].key==='cur' && out.last.final.maxRelCur<1e-2 && beforeC.slice(0,3).every((e,i)=>e===_msEnergies[i]) && /finished tries not recomputed/.test(out.last.status);
  out.ok=out.sameValues.ok && out.paused.ok && out.last.ok;
  return out; })()
