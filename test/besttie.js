// 3.7: рекорд серии «липкий»: попытка с той же в показанных цифрах энергией, что у рекордной, рекорд не отбирает — зелёная рамка и «Min» не перескакивают,
// главный вид остаётся на той же попытке. Окна по порядку и вразнобой (как у параллельной серии), толщина важнее энергии, пауза (parBest) — попытка помеченного окна,
// сквозной прогон: серия из 5 попыток на трилистнике и Stir после неё — каждый перескок рамки только к меньшей показанной энергии. Вердикт — out.ok.
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWorkers=true; const out={}, checks={};
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
  const cen=vs=>{ const c=new THREE.Vector3(); for(const v of vs) c.add(v); return c.multiplyScalar(1/vs.length); };
  const sameShape=(a,b)=>{ if(a.length!==b.length) return {same:false, N:[a.length,b.length]}; const ca=cen(a), cb=cen(b); let raw=0, rel=0;
    for(let i=0;i<a.length;i++){ raw=Math.max(raw, a[i].distanceTo(b[i])); rel=Math.max(rel, a[i].clone().sub(ca).distanceTo(b[i].clone().sub(cb))); }
    return {same:rel<1e-9, N:[a.length,b.length], maxDiffCentred:+rel.toExponential(2), maxDiffRaw:+raw.toExponential(2)}; };
  const bestK=()=>{ const b=_msWins.filter(w=>w.el && w.el.classList.contains('best')); return b.length===1? b[0].k : (b.length? 'many' : null); };
  H.el('clear').onclick(); H.clickPreset('trefoil');
  // A: окна по порядку завершения
  msWinsClear(); const seqA=[]; for(const [k,E] of [[1,0.16312],[2,0.16305],[3,0.1624],[4,0.16238]]){ msResultAdd(k, E, verts, ''); msMarkBest(); seqA.push(bestK()); }
  out.A=seqA; checks.orderTieKeeps=JSON.stringify(seqA)==='[1,1,3,3]';
  // B: вразнобой — окна созданы заранее (running), попытки завершаются в порядке 2, 1, 4, 3
  msWinsClear(); const WB=[1,2,3,4].map(k=>msResultAdd(k, NaN, verts, ' · running')); msMarkBest(); const seqB=[];
  for(const [i,E] of [[1,0.16311],[0,0.16301],[3,0.1630],[2,0.1621]]){ msWinUpdate(WB[i], verts, E, '', 1); msMarkBest(); seqB.push(bestK()); }
  out.B={seq:seqB, E:WB.map(w=>w.E)}; checks.outOfOrderTieKeeps=JSON.stringify(seqB)==='[2,2,2,3]';
  // C: толщина по-прежнему важнее энергии; при равной толщине — показанные цифры
  checks.thickFirst=betterRes(0.30, 1, 0.16, 0.8)===true && betterRes(0.16, 0.8, 0.30, 1)===false;
  checks.displayTie=betterRes(0.16305, 1, 0.16312, 1)===false && betterRes(0.16312, 1, 0.16305, 1)===false && betterRes(0.1624, 1, 0.16312, 1)===true;
  // D: пауза параллельной серии — parBest берёт попытку окна с зелёной рамкой
  msWinsClear(); const WD=[1,2,3].map(k=>msResultAdd(k, NaN, verts, ''));
  msWinUpdate(WD[1], verts, 0.16311, '', 1); msMarkBest(); msWinUpdate(WD[0], verts, 0.16301, '', 1); msMarkBest(); msWinUpdate(WD[2], verts, 0.1631, '', 1); msMarkBest();
  const PD={jobs:WD.map((w,i)=>({slot:i, win:w})), results:[{E:0.16301, verts, note:'a'}, {E:0.16311, verts, note:'b'}, {E:0.1631, verts, note:'c'}]};
  const pb=parBest(PD); out.D={bestK:bestK(), parBest:pb && pb.msg}; checks.pauseFollowsMarked=bestK()===2 && !!pb && pb.msg==='b';
  // E: сквозной прогон — каждый перескок рамки фиксируется
  const tr=[]; let last=null; const origMark=msMarkBest;
  globalThis.msMarkBest=function(){ const b=origMark(); if(b!==last){ if(last && b && _msWins.indexOf(last)>=0 && isFinite(last.E)){ const dt=Math.abs(thickOf(b)-thickOf(last))>0.005;
        tr.push({to:b.k, Ef:fmtE(last.E), Et:fmtE(b.E), ok:dt? thickOf(b)>thickOf(last) : (+fmtE(b.E) < +fmtE(last.E))}); } last=b; } return b; };
  const endCheck=()=>{ const b=_msWins.filter(w=>w.el && w.el.classList.contains('best')), sh=_msWins.filter(w=>w.el && w.el.classList.contains('shown'));
    let first=null; for(const w of _msWins.slice().sort((p,q)=>p.k-q.k)) if(isFinite(w.E) && (!first || betterRes(w.E, thickOf(w), first.E, thickOf(first)))) first=w;   // последовательная серия: порядок окон = порядок завершения
    const ties=_msWins.filter(w=>isFinite(w.E) && first && w!==first && fmtE(w.E)===fmtE(first.E) && Math.abs(thickOf(w)-thickOf(first))<=0.005).map(w=>w.k);
    return {E:_msWins.slice().sort((p,q)=>p.k-q.k).map(w=>[w.k, isFinite(w.E)? +w.E.toPrecision(6) : String(w.E)]), best:b.map(w=>w.k), shown:sh.map(w=>w.k), expected:first && first.k, ties,
      bestIsMsBest:b.length===1 && !!_msBest && b[0].E===_msBest.E, mainIsBest:!!_msBest && sameShape(verts, _msBest.verts).same, status:H.dbg().status.slice(0,120)}; };
  H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  H.clickPreset('trefoil'); H.set({ms:5}); H.play(); out.run1=runEnd(120000); out.end1=endCheck();
  const rr=window.__knotStir(); out.stirRunning=!!(rr && rr.running); if(rr && rr.running) out.run2=runEnd(150000); out.end2=endCheck();
  globalThis.msMarkBest=origMark; out.switches=tr;
  for(const [tag,e] of [['series',out.end1],['stir',out.end2]]) checks[tag+'Consistent']=e.best.length===1 && e.best[0]===e.expected && e.shown.length===1 && e.shown[0]===e.best[0] && e.bestIsMsBest && e.mainIsBest;
  checks.switchesOnlyToLower=tr.every(t=>t.ok);
  out.checks=checks; out.ok=Object.values(checks).every(Boolean);
  return out; })()
