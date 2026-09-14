// Stir button enable/disable through pause / resume / completion / Clear / flip / rerun paths
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const P=()=>H.el('play'), S=()=>H.el('stir'), pill=H.el('statusPill');
  const snap=(tag,extra)=>out.push(Object.assign({tag, stirDisabled:S().disabled, playDisabled:P().disabled, stir:!!_stir, running, msPaused:_msPaused, msK:_msK, round:_msRound, pill:{run:pill.classList.contains('run'), done:pill.classList.contains('done')}, status:H.dbg().status.slice(0,80)}, extra||{}));
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  H.el('msN').value='2'; H.el('msN').oninput();
  snap('initial');
  H.clickPreset('trefoil'); snap('preset');
  H.play(); snap('playing');
  { let st=0; while(_msRound<1 && st<40000 && H.running()){ H.step(50); st+=50; } }
  snap('round2 started');
  H.play(); snap('paused mid-series (stopPhysics(""))');
  H.play(); snap('resumed');
  snap('series done', runToEnd(40000));
  // Play after completion -> K=1 restart
  H.play(); snap('K=1 restart');
  H.play(); snap('K=1 paused');
  H.play(); snap('K=1 resumed');
  snap('K=1 done', runToEnd(40000));
  // stir -> new series -> done -> stir enabled again?
  S().onclick(); snap('stir started');
  window.__knotStir(300); snap('stir finished -> series running');
  snap('stirred series done', runToEnd(40000));
  // second stir: note duplicated?
  S().onclick(); window.__knotStir(300); snap('stir #2 -> running', {runNote:_runNote}); snap('stir #2 series done', Object.assign(runToEnd(40000), {runNote:_runNote}));
  // crossing flip after completion
  { const c=crossings[0]; tryToggleCrossing({x:c.x,y:c.y}); } snap('flip after done');
  H.play(); snap('after flip play'); snap('after flip done', runToEnd(40000));
  H.el('clear').onclick(); snap('clear');
  // stir failing E check: strands inside core (force) -> status + button state
  H.clickPreset('trefoil'); H.play(); runToEnd(40000); snap('done again');
  const sv=verts.map(v=>v.clone()); _inflate=1; H.setSlider('thick',10); H.setSlider('repCoef',10);
  return out; })()
