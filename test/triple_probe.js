(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const R=200, cx=400, cy=300;
  const P=(deg,r)=>({x:cx+(r||R)*Math.cos(deg*Math.PI/180), y:cy+(r||R)*Math.sin(deg*Math.PI/180)});
  function arc(a0,a1,n){ const o=[]; for(let i=1;i<n;i++) o.push(P(a0+(a1-a0)*i/n)); return o; }
  // замкнутая ломаная: три диаметра через центр (тройная точка) + маленький «крест» на последней дуге
  function makeCurve(shift){ const pts=[];
    pts.push(P(0)); pts.push(P(180));            // диаметр 1
    pts.push(...arc(180,230,10)); pts.push(P(230)); pts.push(P(50+shift)); // диаметр 2 (shift сдвигает его мимо центра)
    pts.push(...arc(50+shift,100,10)); pts.push(P(100)); pts.push(P(280)); // диаметр 3
    pts.push(...arc(280,310,6)); pts.push(P(310)); pts.push(P(330,1.3*R)); pts.push(P(310,1.3*R)); pts.push(P(330)); // крест
    pts.push(...arc(330,360,6));
    return pts; }
  function load(pts){ smooth=pts.map(p=>({x:p.x,y:p.y})); closedCurve=true;
    cumLen=[0]; totalLen2D=0; for(let i=1;i<smooth.length;i++){ totalLen2D+=Math.hypot(smooth[i].x-smooth[i-1].x,smooth[i].y-smooth[i-1].y); cumLen.push(totalLen2D); }
    totalLen2D+=Math.hypot(smooth[0].x-smooth[smooth.length-1].x, smooth[0].y-smooth[smooth.length-1].y);
    findCrossings(); }
  function analyse(label){
    const ok=buildKnot3D();
    // якоря по дуге как в buildKnot3D
    const anchors=[]; for(const c of crossings){ anchors.push(c.sA); anchors.push(c.sB); }
    const aPos=anchors.map(s=>((s%totalLen2D)+totalLen2D)%totalLen2D).sort((a,b)=>a-b);
    const gaps=[]; for(let i=1;i<aPos.length;i++) gaps.push(aPos[i]-aPos[i-1]);
    // сколько вершин 3D-ломаной совпадают по xy с каждым пересечением (сдвиг recenter компенсируем по центроиду)
    let mx=0,my=0; for(const v of verts){mx+=v.x;my+=v.y;} mx/=N; my/=N;
    // мировые координаты пересечений до recenter, центроид тех же вершин до recenter неизвестен → сравниваем ПАРЫ вершин
    const perCross=crossings.map(c=>{ const wx=(c.x-worldCx)*worldScale, wy=-(c.y-worldCy)*worldScale;
      // ищем пары вершин с одинаковым xy и далёкими индексами
      return null; });
    let pairs=[]; for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){ if(Math.min(j-i,N-(j-i))>2 && Math.hypot(verts[i].x-verts[j].x, verts[i].y-verts[j].y)<1e-6*L0) pairs.push([i,j]); }
    // где сидит крест: его пересечение — единственное с c.x > cx (правая нижняя часть)
    const kink=crossings.find(c=>c.x>cx+50);
    // перевод вершин обратно: worldXY(vert)=vert - shift; shift оценим как (mean vert) - (mean of pre-recenter) — вместо этого сравним расстояние
    // от вершин до пересечения по ИНВАРИАНТУ: минимальное расстояние вершины до КАКОЙ-ЛИБО вершины другой пряди в xy около креста
    const kw=[(kink.x-worldCx)*worldScale, -(kink.y-worldCy)*worldScale];
    // shift = centroid(after) - centroid(before) — centroid(before) вычислим сами через __liftStages? он после recenter. Используем pre из buildKnot3D: нет. Считаем через сопоставление: verts[0] лежит на кривой; берём shift как медиану по всем вершинам расстояния к ближайшей точке ломаной? проще: recenter вычитает центроид; центроид до recenter = mean over verts of world coords, неизвестен. Оценим shift подбором: min over shift? Вместо этого — проверка пар выше достаточна.
    return {label, ok, nCross:crossings.length, N, minAnchorGap:Math.min(...gaps), gapsSmall:gaps.filter(g=>g<1e-9).length,
      coincidentPairs:pairs.length, pairs:pairs.slice(0,10), kinkAt:[Math.round(kink.x),Math.round(kink.y)], det2D:computeDeterminant()};
  }
  load(makeCurve(0)); out.triple=analyse('triple point exact');
  load(makeCurve(3)); out.control=analyse('perturbed (no triple point)');
  // прямое воспроизведение цикла сопоставления якорей на данных тройной точки
  load(makeCurve(0));
  { const anchors=[]; for(const c of crossings){ anchors.push(c.sA); anchors.push(c.sB); }
    const aPos=anchors.map(s=>((s%totalLen2D)+totalLen2D)%totalLen2D).sort((a,b)=>a-b);
    const fineS=cumLen.slice(); for(const a of aPos) fineS.push(a); fineS.sort((x,y)=>x-y);
    for(let i=fineS.length-1;i>0;i--) if(fineS[i]-fineS[i-1]<1e-9) fineS.splice(i,1);
    let k=0, matched=[]; for(let i=0;i<fineS.length && k<aPos.length;i++){ if(Math.abs(fineS[i]-aPos[k])<1e-9){ matched.push({i,k,s:aPos[k]}); k++; } }
    out.loop={aPos, fineSLen:fineS.length, cumLenLen:cumLen.length, matched, kFinal:k, anchorsTotal:aPos.length}; }
  return out; })()
