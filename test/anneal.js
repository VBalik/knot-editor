// отжиг профилей (2.19): размах ×R должен убывать 32→1 за фазу A, фаза B — истинная энергия; одна попытка на восьмёрке и случайном узле
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  async function one(name, prep){
    H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
    await prep(); H.set({ms:1}); H.play();
    const tr0=window.__knotTrace(); const trace=[]; let o=null, st=0, endA=-1;
    while(true){ o=H.step(50); st+=50; const t=window.__knotTrace();
      if(st%250===0 || (!t.ann.on && endA<0)) trace.push({st, on:t.ann.on, step:t.ann.step, range:t.ann.range, E:+H.dbg().status.replace(/.*E ([0-9.—]+).*/,'$1'), status:H.dbg().status.slice(0,90)});
      if(!t.ann.on && endA<0) endA=st;
      if(!o.running || st>=20000) break; }
    const t=window.__knotTrace();
    out[name]={ann0:tr0.ann, endA, steps:st, settled:!o.running, ck:t.ck, final:H.dbg().status.slice(0,80), trace};
    console.error(name, JSON.stringify(out[name]).slice(0,600)); }
  await one('figure8', async()=>H.clickPreset('figure8'));
  await one('rand14', async()=>{ let t=0; do{ randomKnot(14); }while(isUnknot && t++<30); });
  return out; })()
