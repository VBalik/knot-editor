// _runNote ' · stirred ×' and stir warning across multi-start rounds (startPhysics resets _liftWarn/_runNote each round)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(const K of [1,2]){
    H.el('clear').onclick(); H.el('msN').value=String(K); H.el('msN').oninput();
    H.clickPreset('trefoil'); H.play(); const r1=runToEnd(40000);
    const rec={K, run1:r1, status1:H.dbg().status.slice(0,80)};
    const r=window.__knotStir(300); rec.stirRet={stir:r.stir, running:r.running, dbg:r.dbg};
    rec.afterStir={msK:_msK, round:_msRound, runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status.slice(0,120)};
    if(K>1){ let st=0; while(_msRound<1 && st<40000 && H.running()){ H.step(50); st+=50; }
      rec.round2={round:_msRound, running:H.running(), runNote:_runNote, liftWarn:_liftWarn, status:H.dbg().status.slice(0,120)}; }
    rec.run2=runToEnd(40000); rec.final={status:H.dbg().status, runNote:_runNote, hasStirred:/stirred/.test(H.dbg().status), E:_msEnergies.slice(), wins:_msWins.length, stirDisabled:H.el('stir').disabled};
    out['K'+K]=rec; }
  // Also: pause+resume inside a stirred series (K=2) resets note via _msContinue startPhysics
  H.el('clear').onclick(); H.el('msN').value='2'; H.el('msN').oninput();
  H.clickPreset('trefoil'); H.play(); runToEnd(40000); window.__knotStir(300);
  const before=_runNote; H.step(200); H.play(); const paused={running:H.running(), note:_runNote, status:H.dbg().status.slice(0,100)};
  H.play(); out.pauseResume={noteBefore:before, paused, noteAfterResume:_runNote, statusAfterResume:H.dbg().status.slice(0,100), K:_msK, round:_msRound};
  return out; })()
