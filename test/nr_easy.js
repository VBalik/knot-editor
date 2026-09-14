(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const isBad=(v)=>typeof v==='number' && !isFinite(v);
  const run=(prep,w,r,max)=>{ prep(); H.setSlider('bendCoef',9); H.setSlider('thick',w); H.setSlider('repCoef',r); if(!H.running()) H.play();
    const sN=sNominal(); const res={N, sN_L0:+(sN/L0).toFixed(4), inflate0:_inflate, gap0_sN:+(minSegGap()/sN).toFixed(3), E0:energyGrad(false).E};
    let o=null, st=0, bad=[]; while(true){ o=H.step(50); st+=50; const tr=window.__knotTrace(); for(const k of ['fRel','E','moved','gmin','eta']) if(isBad(tr[k])) bad.push({st,k}); if(!o.running||st>=(max||4000)) break; }
    const s=(H.log().series||[]); let nan=0, eInf=0, eViol=0, pe=null; for(const r of s){ for(const k in r) if(isBad(r[k])) nan++; if(r.E==null){pe=null;continue;} if(!isFinite(r.E)) eInf++; if(pe!=null&&r.E>pe*1.001+1e-9) eViol++; pe=r.E; }
    Object.assign(res,{settled:!o.running, steps:st, status:H.dbg().status.slice(0,90), inflateEnd:_inflate, jam:_inflJammed, gapEnd_sN:+(minSegGap()/sN).toFixed(3), E:_ePrev, fRel:window.__knotTrace().fRel, bad:bad.slice(0,5), seriesNaN:nan, eInf, eViol, det3d:H.det3d(), runDet:_runDet});
    if(H.running()) H.play(); return res; };
  out.trefoil_11=run(()=>H.clickPreset('trefoil'),1,1);
  out.fig8_11=run(()=>H.clickPreset('figure8'),1,1);
  out.trefoil_1010=run(()=>H.clickPreset('trefoil'),10,10,6000);
  out.sept_1010=run(()=>H.clickPreset('septafoil'),10,10,6000);
  return out; })()
