(async()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
 const cases=JSON.parse(fs.readFileSync(process.env.CASES,'utf8')); const out=[];
 const names=(process.env.ONLY||'').split(',').filter(Boolean);
 for(const c of cases){ if(names.length && !names.includes(c.name)) continue;
   H.clickPreset('trefoil'); if(H.running()) H.play();
   let r=null; if(c.preset){ H.clickPreset(c.preset); r={N:H.verts().length}; } else r=window.__knotSetVerts(c.verts);
   H.setSlider('bendCoef',9); H.setSlider('thick',c.w); H.setSlider('repCoef',c.r);
   const N=H.verts().length; const bE0=H.bE();
   if(!H.running()) H.play();
   let o=null, st=0; const trace=[]; while(true){ o=H.step(100); st+=100; if(st%1000===0) trace.push(+H.bE().toFixed(4)); if(!o.running||st>=20000) break; }
   const tr=window.__knotTrace?window.__knotTrace():{}; const det=H.det3d();
   out.push({name:c.name, N, bE0:+bE0.toFixed(4), bE:+H.bE().toFixed(4), ratio2c:+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3), steps:st, settled:!o.running, status:o.status, fRel:tr.fRel, det3d:det, rvar:o.rvar, trace, verts:H.verts().map(p=>p.map(x=>+x.toFixed(4)))});
   if(H.running()) H.play(); }
 fs.writeFileSync(process.env.OUT, JSON.stringify(out)); return out.map(o=>({name:o.name,N:o.N,bE0:o.bE0,bE:o.bE,ratio2c:o.ratio2c,steps:o.steps,settled:o.settled,det3d:o.det3d,trace:o.trace})); })()
