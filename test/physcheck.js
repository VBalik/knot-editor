// Зонд ФИЗИЧНОСТИ модели (аудит 2026-09-02): не «прошёл/не прошёл», а
// сколько НЕфизических механизмов потребовалось, чтобы дойти до покоя, и
// является ли финал настоящим силовым равновесием.
// Запуск: node harness.js physcheck.js
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={ tag:window.__buildTag, cases:{} };
  function probe(name, prep){
    prep();
    if(!H.running()) H.play();
    if(!H.running()) return {err:'PLAY FAILED'};
    const d0=H.dbg();
    const tr=[];                     // трасса: bE (истинная Σθ²), gd, cap, tD, status
    let bEprev=H.bE(), rises=0, riseMax=0, gdMin=1, capMin=1, tDmax=0, blows=0, statuses=new Set();
    let o=null, steps=0;
    for(let b=0;b<400;b++){
      o=H.step(25); steps+=25;
      const d=H.dbg(), bE=H.bE();
      if(bE>bEprev*1.02+1e-6){ rises++; riseMax=Math.max(riseMax, bE-bEprev); }
      bEprev=bE;
      gdMin=Math.min(gdMin, d.gd); capMin=Math.min(capMin, d.cap); tDmax=Math.max(tDmax, d.tD);
      statuses.add(d.status.replace(/\d+/g,'#').slice(0,60));
      if(b%8===0) tr.push([steps, +bE.toFixed(3), d.gd, d.cap, d.tD]);
      if(!o.running) break;
    }
    const settled=!(o&&o.running);
    const L=H.log(), dEnd=H.dbg();
    const anneal=(L&&L.anneal)||[];
    const bEsettled=H.bE(), detS=H.det3d();
    // ПРОВЕРКА РАВНОВЕСИЯ: снова включаем физику и даём 300 шагов —
    // настоящее равновесие не уходит (bE и форма стоят)
    let drift=null;
    if(settled){
      const V0=H.verts().map(p=>p.slice());
      H.play(); const o2=H.step(300); if(H.running()) H.play();
      const V1=H.verts(); let mv=0;
      for(let i=0;i<V0.length;i++){ const dx=V1[i][0]-V0[i][0], dy=V1[i][1]-V0[i][1], dz=V1[i][2]-V0[i][2];
        mv=Math.max(mv, Math.sqrt(dx*dx+dy*dy+dz*dz)); }
      drift={ bEafter:+H.bE().toFixed(3), maxMoveL0:+(mv/dEnd.L0).toFixed(3), stoppedAgain:!o2.running };
    }
    return { settled, steps, N:dEnd.N, runDet:dEnd.runDet, det3d:detS, runUnknot:dEnd.runUnknot,
      bE:+bEsettled.toFixed(3), bEcircle:+(4*Math.PI*Math.PI/dEnd.N).toFixed(3),
      minSegL0:o&&o.minSegL0, maxCurv:o&&o.maxCurv,
      bEriseEvents:rises, bEriseMax:+riseMax.toFixed(3),
      gdMin, capMin, tDmax, thicknessInflated: tDmax>1.05*d0.tD,
      annealRounds:anneal.length, annealKinds:anneal.map(a=>a.r).slice(0,8),
      detReverts:dEnd.detReverts, statuses:[...statuses], drift, trace:tr };
  }
  out.cases.trefoil   = probe('trefoil',   ()=>H.clickPreset('trefoil'));
  out.cases.figure8   = probe('figure8',   ()=>H.clickPreset('figure8'));
  out.cases.cinquefoil= probe('cinquefoil',()=>H.clickPreset('cinquefoil'));
  // тривиальная закрученная петля (рисуется штатным вводом)
  out.cases.drawnUnknot = probe('unknot', ()=>{
    H.el('clear').onclick();
    H.drawCurve(u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t);
      return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; }, 240);
  });
  // самопересекающийся рисунок (Лиссажу 2:3, 5 пересечений), проходы по умолчанию
  out.cases.lissajous = probe('lissajous', ()=>{
    H.el('clear').onclick();
    H.drawCurve(u=>{ const t=u*2*Math.PI;
      return {x:400+230*Math.sin(2*t), y:300+170*Math.sin(3*t+0.3)}; }, 300);
  });
  return out;
})()
