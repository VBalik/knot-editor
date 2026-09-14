(async()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
 const cases=JSON.parse(fs.readFileSync(process.env.CASES,'utf8')); const out=[];
 const names=(process.env.ONLY||'').split(',').filter(Boolean);
 for(const c of cases){ if(names.length && !names.includes(c.name)) continue;
   H.clickPreset('trefoil');
   if(H.running()) H.play();
   const r=window.__knotSetVerts(c.verts);
   H.setSlider('bendCoef',9); H.setSlider('thick',c.w); H.setSlider('repCoef',c.r);
   const N=H.verts().length; const bE0=H.bE();
   if(!H.running()) H.play();
   let o=null, st=0; const trace=[]; while(true){ o=H.step(100); st+=100; if(st%1000===0) trace.push(+H.bE().toFixed(4)); if(!o.running||st>=20000) break; }
   const d=H.dbg(); const tr=window.__knotTrace?window.__knotTrace():{};
   out.push({name:c.name, N, L0:r.L0, bE0:+bE0.toFixed(4), bE:+H.bE().toFixed(4), ratio2c:+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3), steps:st, settled:!o.running, status:o.status, fRel:tr.fRel, rvar:o.rvar, trace});
   if(H.running()) H.play(); }
 return out; })()
