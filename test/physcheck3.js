// Зонд 3: является ли «равновесие достигнуто» СИЛОВЫМ равновесием?
// После остановки снова включаем физику и смотрим ПЕРВЫЕ 100 шагов (до
// того, как детектор покоя успеет запустить продувку): настоящий минимум
// энергии не двигается; состояние, «доставленное» морфом к лучшему снимку,
// поедет сразу. Запуск: node harness.js physcheck3.js
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={ tag:window.__buildTag };
  function settle(prep){
    prep();
    if(!H.running()) H.play();
    let o=null;
    for(let b=0;b<400;b++){ o=H.step(25); if(!o.running) break; }
    if(H.running()) H.play();
    return !(o&&o.running);
  }
  function resumeProbe(){
    const V0=H.verts().map(p=>p.slice()), bE0=H.bE(), L0=H.dbg().L0;
    H.play();                                   // физика снова включена
    const rows=[];
    for(let k=0;k<10;k++){
      const o=H.step(10);
      const V=H.verts(); let mv=0;
      for(let i=0;i<V0.length;i++){ const dx=V[i][0]-V0[i][0], dy=V[i][1]-V0[i][1], dz=V[i][2]-V0[i][2];
        mv=Math.max(mv, Math.sqrt(dx*dx+dy*dy+dz*dz)); }
      const d=H.dbg();
      rows.push({step:(k+1)*10, maxMoveL0:+(mv/L0).toFixed(3), bE:+H.bE().toFixed(3), tD:d.tD, gd:d.gd,
                 status:d.status.slice(0,28)});
      if(!o.running) break;
    }
    if(H.running()) H.play();
    return { bE0:+bE0.toFixed(3), rows };
  }
  for(const key of ['trefoil','figure8','cinquefoil']){
    const ok=settle(()=>H.clickPreset(key));
    out[key]={ settled:ok, resume: ok? resumeProbe() : null };
  }
  return out;
})()
