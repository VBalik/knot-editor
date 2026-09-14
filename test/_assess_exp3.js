(async()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs');
 const cases=JSON.parse(fs.readFileSync(process.env.CASES,'utf8')); const out=[]; const FT=+process.env.FTOL; const MAXST=+(process.env.MAXST||6000);
 for(const c of cases){
   H.clickPreset('trefoil'); if(H.running()) H.play();
   const r=window.__knotSetVerts(c.verts); H.setSlider('bendCoef',9); H.setSlider('thick',c.w); H.setSlider('repCoef',c.r);
   const cfg=H.set({ftol:FT}); const N=H.verts().length; const V0=H.verts();
   if(!H.running()) H.play();
   let o=null, st=0; const trace=[]; while(true){ o=H.step(200); st+=200; if(st%1000===0) trace.push(+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3)); if(!o.running||st>=MAXST) break; }
   const V=H.verts(); let mv=0; for(let k=0;k<N;k++) mv=Math.max(mv, Math.hypot(V[k][0]-V0[k][0],V[k][1]-V0[k][1],V[k][2]-V0[k][2]));
   const tr=window.__knotTrace?window.__knotTrace():{};
   out.push({name:c.name, N, cfg, ratio2c:+(H.bE()/(16*Math.PI*Math.PI/N)).toFixed(3), steps:st, settled:!o.running, status:o.status, fRel:tr.fRel, det3d:H.det3d(), moveL0:+(mv/r.L0).toFixed(2), trace});
   if(H.running()) H.play(); }
 fs.writeFileSync(process.env.OUT, JSON.stringify(out)); return out; })()
