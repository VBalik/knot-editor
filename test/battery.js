// Батарея пресетов: осадка, канон-энергия, инвариант, монотонность E (допуск —
// проектный потолок ползучести 2%), плавность после разворачивания.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={ tag:window.__buildTag };
  const run=(name, click)=>{
    click();
    if(!H.running()) H.play();
    if(!H.running()) return {err:'PLAY FAILED'};
    let o=null;
    for(let b=0;b<220;b++){ o=H.step(150); if(!o.running) break; }
    if(H.running()) H.play();
    const L=H.log(), d=H.dbg();
    let eViol=0, eMax=0, prevE=null;
    for(const r of (L.series||[])){
      if(r.E==null){ prevE=null; continue; }
      if(prevE!=null && r.E>prevE*1.02+1e-6){ eViol++; if(r.E-prevE>eMax) eMax=r.E-prevE; }
      prevE=r.E;
    }
    let mvLate=0;
    for(const r of (L.series||[])){
      if(r.st>400 && (r.tD||0)<2.0 && r.maxMove>mvLate) mvLate=r.maxMove;
    }
    return { settled:!(o&&o.running), steps:L.stepsTotal,
      bE:+H.bE().toFixed(2), det:H.det3d(),
      eViol, eMax:+eMax.toFixed(3), mvLateL0:+mvLate.toFixed(2) };
  };
  out.trefoil    = run('trefoil',    ()=>H.clickPreset('trefoil'));
  out.figure8    = run('figure8',    ()=>H.clickPreset('figure8'));
  out.cinquefoil = run('cinquefoil', ()=>H.clickPreset('cinquefoil'));
  out.septafoil  = run('septafoil',  ()=>H.clickPreset('septafoil'));
  // рисованный тривиальный узел: пара волн, без пересечений над/под сложных
  document.getElementById('clear').onclick();
  H.drawCurve((t)=>{ const a=t*2*Math.PI;
    return { x:400+150*Math.cos(a)+25*Math.cos(3*a), y:300+150*Math.sin(a)+25*Math.sin(4*a) }; }, 200);
  out.drawnUnknot = run('drawnUnknot', ()=>{});
  return out;
})()
