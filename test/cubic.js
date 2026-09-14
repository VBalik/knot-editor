// объёмный лифт: габариты x/y/z базового лифта и попыток; тип узла лифта = тип диаграммы
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function ext(){ const v=H.verts(); let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const p of v) for(let c=0;c<3;c++){ mn[c]=Math.min(mn[c],p[c]); mx[c]=Math.max(mx[c],p[c]); } return mx.map((x,c)=>+(x-mn[c]).toFixed(2)); }
  for(const [name, prep] of [['trefoil', ()=>H.clickPreset('trefoil')], ['rand20', ()=>{ let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); }], ['rand50', ()=>randomKnot(50)]]){
    H.el('clear').onclick(); if(H.running()) H.play(); prep();
    const rec={det2d:knotDet, N, baseExt:ext(), liftDet:_detRobust(3), tries:[]};
    for(let k=0;k<4;k++){ liftFromDiagram(Math.random); rec.tries.push({N, ext:ext(), det:_detRobust(3)}); }
    out[name]=rec; }
  return out; })()
