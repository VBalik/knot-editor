(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={};
  try{ H.clickPreset('trefoil'); }catch(e){ out.clickErr=String(e && e.stack || e).slice(0,300); }
  const d=H.dbg();
  out.after={ nc:(d.crossings||[]).length, N:d.N, running:d.running, status:d.status.slice(0,80), knotDet:d.knotDet };
  try{ H.play(); }catch(e){ out.playErr=String(e && e.stack || e).slice(0,300); }
  out.after2={ running:H.dbg().running, status:H.dbg().status.slice(0,80) };
  return out;
})()
