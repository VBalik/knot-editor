// сертификат ресэмплинга: сплюснутый лифт (z×0.12) должен отвергаться (cert/det), обычные узлы — приниматься
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  function probe(name, squash){
    const S=verts.map(v=>v.clone()); if(squash){ for(const v of verts) v.z*=squash; projectLengthsSafe(40); }
    _stirS0={verts:verts.map(v=>v.clone()), N, L0, det:_detRobust(3)}; _stirHoles=[]; const res=[];
    for(let seed=1; seed<=6; seed++){ const t0=Date.now(); const r=stirRemapOnce(seed); res.push({seed, ok:!!r, rej:r?'':_stirLastRej, ms:Date.now()-t0, disp_R:r&&r.disp_R, d_R:r&&r.d_R}); for(let i=0;i<N;i++) verts[i].copy(_stirS0.verts[i]); if(_stirLastRej==='centre') break; }
    out[name]={N, det:_stirS0.det, holes:_stirHoles.length, res}; _stirS0=null; _stirHoles=[]; for(let i=0;i<N;i++) verts[i].copy(S[i]); }
  H.el('clear').onclick(); H.setSlider('thick',3); H.setSlider('repCoef',1); H.setSlider('bendCoef',9);
  seeded(4343,()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); });
  probe('rand30_lift', 0); probe('rand30_squashed', 0.12);
  H.set({ms:1}); H.play(); { let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=60000) break; } }
  probe('rand30_relaxed', 0);
  H.el('clear').onclick(); H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2);
  H.set({ms:1}); H.play(); { let o=null, st=0; while(true){ o=H.step(200); st+=200; if(!o.running || st>=40000) break; } }
  probe('trefoil_relaxed', 0);
  return out; })()
