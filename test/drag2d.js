// 4.4: режим редактирования — узел берут «ладошкой» и тянут. Проверяем курсоры, что кривая идёт за рукой,
// что она почти не удлиняется, что тип узла при аккуратном перетаскивании сохраняется,
// и что выбранные проходы переносятся на пересчитанные пересечения.
// 4.6: порог ухода длины поднят с 5 до 8 %. Прежние «3.3 %» были обманом: на отпускании кривая
// пересобиралась сплайном по прорежённым точкам и тот срезал углы, укорачивая её. Пересборку убрали
// (из-за неё узел дёргался в момент, когда руку уже убрали), и тест стал показывать настоящую цифру:
// проекция длин отрезков — диффузия, на тысяче точек слабина не успевает притечь к руке за один кадр,
// и на быстром ходе в 60 px верёвка идёт на 5–6 % длиннее. Локального излома при этом нет (stretch).
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const out={}, cv=H.el('draw');
  const scr=(q)=>({x:q.x*_v2.s+_v2.tx, y:q.y*_v2.s+_v2.ty});
  const seg=()=>{ const n=smooth.length; let mx=0, s=0; for(let i=0;i<n;i++){ const a=smooth[i], b=smooth[(i+1)%n], d=Math.hypot(b.x-a.x,b.y-a.y); s+=d; if(d>mx) mx=d; } return {max:mx, mean:s/n}; };
  H.clickPreset('trefoil');
  const L0=totalLen2D, nc0=crossings.length, det0=knotDet, s0=seg(), over0=crossings.map(c=>c.over);
  out.start={len:Math.round(L0), crossings:nc0, det:det0, segMax:+s0.max.toFixed(2)};

  // курсоры: ладошка над верёвочкой, указатель над кольцом, обычный вдали
  const onCurve=scr(smooth[Math.floor(smooth.length*0.25)]);
  H.pointer('pointermove', onCurve.x, onCurve.y); out.cursorOnRope=cv.style.cursor;
  const onCross=scr(crossings[0]); H.pointer('pointermove', onCross.x, onCross.y); out.cursorOnCrossing=cv.style.cursor;
  H.pointer('pointermove', 5, 5); out.cursorAway=cv.style.cursor;

  // берём верёвочку и тянем на 60 px вбок
  H.pointer('pointermove', onCurve.x, onCurve.y);
  H.pointer('pointerdown', onCurve.x, onCurve.y); out.cursorGrabbing=cv.style.cursor;
  const before=smooth.map(q=>({x:q.x,y:q.y}));
  for(let k=1;k<=12;k++) H.pointer('pointermove', onCurve.x+5*k, onCurve.y+2.5*k);
  H.pointer('pointerup', onCurve.x+60, onCurve.y+30);
  out.cursorAfter=cv.style.cursor;

  let mv=0; for(let i=0;i<Math.min(before.length, smooth.length);i++) mv=Math.max(mv, Math.hypot(smooth[i].x-before[i].x, smooth[i].y-before[i].y));
  const s1=seg();
  out.after={len:Math.round(totalLen2D), crossings:crossings.length, det:knotDet, segMax:+s1.max.toFixed(2), moved:+mv.toFixed(1),
    lenDrift:+(100*Math.abs(totalLen2D-L0)/L0).toFixed(2), stretch:+(s1.max/s0.max).toFixed(2), closed:closedCurve, pending:pendingCount()};
  out.oversKept = crossings.length===nc0 && crossings.every((c,i)=>c.over===over0[i]);

  // клик по кольцу пересечения по-прежнему переключает проход
  const c0=crossings[0], was=c0.over, sc=scr(c0);
  H.pointer('pointerdown', sc.x, sc.y); H.pointer('pointerup', sc.x, sc.y);
  out.toggleWorks = crossings[0].over!==was;

  out.ok = out.cursorOnRope==='grab' && out.cursorOnCrossing==='pointer' && out.cursorAway==='default'
    && out.cursorGrabbing==='grabbing' && out.cursorAfter==='grab'
    && out.after.moved>20 && out.after.lenDrift<8 && out.after.stretch<1.6
    && out.after.closed && out.after.crossings===nc0 && out.after.det===det0 && out.toggleWorks;
  return out; })()
