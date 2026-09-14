// LENS 2.21 (iii): 1-try series on randomKnot(20) and randomKnot(30), sliders 5/2/9 — settled/det/steps, start feasibility
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget, tmax){ let o=null, st=0; const t0=Date.now(); while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget || Date.now()-t0>tmax) break; } return {steps:st, settled:!o.running, ms:Date.now()-t0}; }
  async function one(name, target, sl, budget){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',sl[0]); H.setSlider('repCoef',sl[1]); H.setSlider('bendCoef',sl[2]);
    let t=0; do{ randomKnot(target); }while(isUnknot && t++<30);
    const rec={cross:crossings.length, det2d:knotDet, N0:N};
    H.set({ms:1}); window.__msDebug=true; H.play(); window.__msDebug=false;
    const tr0=window.__knotTrace(); rec.start={N, L0:+L0.toFixed(4), inflate0:+_inflate.toFixed(4), unstick:_dbgUnstick, gminRep_L0:+tr0.gminRep.toFixed(3), sEff_L0:+tr0.sEff.toFixed(3), sNom_L0:+(sNominal()/L0).toFixed(3), runDet:_runDet, liftWarn:_liftWarn};
    const r=runToEnd(budget, 300000); const tr=window.__knotTrace();
    rec.run={...r, inflate:+_inflate.toFixed(4), inflStall:_inflStall, jammed:_inflJammed, detEnd:_dbgDetEnd, detNow:_detRobust(3), E:+(_ePrev).toPrecision(4), status:H.dbg().status.slice(0,160), ann:tr.ann, saddleN:tr.saddleN};
    out[name]=rec; console.error(name, JSON.stringify(rec)); }
  await one('rand20', 20, [5,2,9], 12000);
  await one('rand30', 30, [5,2,9], 12000);
  return out; })()
