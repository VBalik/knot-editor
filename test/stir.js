// Stir: разрыхление финала под сертификатами → тип узла тот же, зазоры целы, форма выросла; затем новая серия попыток
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function runToEnd(budget){ let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; } return {steps:st, settled:!o.running}; }
  for(const [name, prep] of [['trefoil', ()=>H.clickPreset('trefoil')], ['unknot5', ()=>{ let t=0; while(t++<50){ randomKnot(5); if(isUnknot) break; } }], ['rand12', ()=>randomKnot(12)]]){
    H.el('clear').onclick(); prep(); H.set({ms:2});
    const d0=H.dbg(); const rec={nc:d0.crossings.length, det2d:d0.knotDet, N:d0.N};
    H.play(); rec.run1=runToEnd(40000); rec.status1=H.dbg().status.slice(0,90); rec.E1=_msEnergies.slice(); rec.det1=H.det3d();
    const R0=knotRadius(), bE0=H.bE();
    const r=window.__knotStir(700); rec.stir=r.dbg; rec.stirRet={stir:r.stir, running:r.running};
    rec.after={R:+(knotRadius()/R0).toFixed(3), bE:+(H.bE()/bE0).toFixed(3), det3d:H.det3d(), msK:_msK, status:H.dbg().status.slice(0,90)};
    rec.run2=runToEnd(40000); rec.status2=H.dbg().status.slice(0,120); rec.E2=_msEnergies.slice(); rec.det2=H.det3d(); rec.wins=_msWins.length;
    out[name]=rec; }
  return out; })()
