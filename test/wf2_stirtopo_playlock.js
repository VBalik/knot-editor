// wf2 review: stir cancelled by a new diagram (preset click) — does #play stay disabled? plus adjacent-angle-sum growth during stir
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  function adjSum(){ const n=N; const th=[]; for(let i=0;i<n;i++){ const a=verts[(i-1+n)%n], b=verts[i], c=verts[(i+1)%n]; const u=b.clone().sub(a), v=c.clone().sub(b); th.push(u.angleTo(v)); } let m=0; for(let i=0;i<n;i++) m=Math.max(m, th[i]+th[(i+1)%n]); return m; }
  H.el('clear').onclick(); H.clickPreset('trefoil'); H.set({ms:1});
  if(!running) H.play(); out.run1=runToEnd(20000);
  out.playBefore=H.el('play').disabled; out.stirBtnBefore=H.el('stir').disabled;
  const s=stirStart(); out.stirStarted=s; out.playDuringStir=H.el('play').disabled;
  let mAdj=0; for(let k=0;k<150 && _stir;k++){ stirStep(); mAdj=Math.max(mAdj, adjSum()); }
  out.maxAdjAngleSum_deg=+(mAdj*180/Math.PI).toFixed(1); out.maxTh_deg=+(energyGrad(false).maxTh*180/Math.PI).toFixed(1);
  // cancel via preset click mid-stir
  H.clickPreset('figure8');
  out.afterPreset={stir:!!_stir, running, playDisabled:H.el('play').disabled, stirDisabled:H.el('stir').disabled, status:H.dbg().status.slice(0,80)};
  // now can the user pause? onclick guard is _stir only; but the DOM button is disabled → click impossible in browser.
  // second scenario: cancel via randomKnot
  if(running) stopPhysics(''); H.el('clear').onclick(); H.clickPreset('trefoil'); if(!running) H.play(); runToEnd(20000);
  stirStart(); for(let k=0;k<5;k++) stirStep(); randomKnot(10);
  out.afterRandom={stir:!!_stir, running, playDisabled:H.el('play').disabled, stirDisabled:H.el('stir').disabled};
  return out; })()
