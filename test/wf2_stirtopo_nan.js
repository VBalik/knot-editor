// wf2 review: stirField NaN/degeneracy probe across N (incl. tiny N via __knotSetVerts) and repeated fields
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function chk(tag){ let bad=0, mx=0; for(let i=0;i<N;i++){ const a=_stirUx[i], b=_stirUy[i], c=_stirUz[i]; if(!isFinite(a)||!isFinite(b)||!isFinite(c)) bad++; else mx=Math.max(mx,Math.hypot(a,b,c)); } out[tag]={N, nonFinite:bad, maxField:+mx.toFixed(4)}; }
  H.el('clear').onclick(); H.clickPreset('trefoil'); if(running) stopPhysics('');
  for(let k=0;k<200;k++){ stirField(); const a=_stirUx; for(let i=0;i<N;i++) if(!isFinite(a[i])||!isFinite(_stirUy[i])||!isFinite(_stirUz[i])){ out.nanAt={k,i}; break; } }
  chk('trefoil200');
  for(const n of [8,9,12,16,33]){ const arr=[]; for(let i=0;i<n;i++){ const t=2*Math.PI*i/n; arr.push([100*Math.cos(t),100*Math.sin(t),10*Math.sin(3*t)]); }
    const r=window.__knotSetVerts(arr); stirField(); chk('N'+n+'_'+(r&&r.N)); 
    // run a few stir steps too
    const s=stirStart(); let steps=0; if(s){ while(_stir && steps<20){ stirStep(); steps++; } }
    let nanV=0; for(const v of verts) if(!isFinite(v.x)||!isFinite(v.y)||!isFinite(v.z)) nanV++;
    out['N'+n+'_steps']={started:s, steps, nanVerts:nanV, rejected:_stir?_stir.rejected:null, running};
    if(_stir){ _stir=null; } if(running) stopPhysics(''); }
  return out; })()
