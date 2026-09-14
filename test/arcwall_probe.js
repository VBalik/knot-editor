(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // --- построение замкнутой кривой из N=600 точек с точно равными рёбрами L0=1 ---
  function setCurve(pts){ // pts: массив [x,y,z] длины 600 с ребром 1
    window.__knotSetVerts(pts); window.__knotSetVertsRaw(pts); L0=1; updateGeomUnits(); _inflate=1; _energyDirty=true; }
  // стадион: два прямых плеча на расстоянии 2ρ, полукруги радиуса ρ; периметр 600
  function stadium(rho){ const n=600, per=n, leg=(per-2*Math.PI*rho)/2; const pts=[];
    for(let k=0;k<n;k++){ let s=k; // длина дуги от начала
      let p;
      if(s<leg) p=[s,0,0];
      else if(s<leg+Math.PI*rho){ const a=(s-leg)/rho; p=[leg+rho*Math.sin(a), rho-rho*Math.cos(a),0]; }
      else if(s<2*leg+Math.PI*rho){ const t=s-leg-Math.PI*rho; p=[leg-t, 2*rho,0]; }
      else { const a=(s-2*leg-Math.PI*rho)/rho; p=[-rho*Math.sin(a), rho+rho*Math.cos(a),0]; }
      pts.push(p); }
    return pts; }
  // разбор пар: какая пара даёт ∞ и по какому правилу
  function pairs(){ const n=N, S=sExcl(); let inf=[], nearLocal=[], gmin=Infinity;
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n;
      const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<gmin) gmin=x;
      const foreign = cd*L0/(2*x) > 1;
      if(foreign && x-S<=1e-9*L0) inf.push({i,j,cd,x:+x.toFixed(3), wall: cd*L0/2<S?'cd*L0/2':'S'});
      if(!foreign && x<S && cd<2*S/L0) nearLocal.push({cd,x:+x.toFixed(3)});
    }}
    return {gmin:+gmin.toFixed(3), nInf:inf.length, firstInf:inf.slice(0,3), minCdInf:inf.length?Math.min(...inf.map(p=>p.cd)):null, nLocalAllowedBelowS:nearLocal.length};
  }
  H.clickPreset('trefoil'); H.setSlider('thick',10); H.setSlider('repCoef',10);
  out.units={};
  // --- стадион (шпилька): допустимость по ρ ---
  out.stadium={};
  for(const rho of [1.6,1.8,1.9,2.0,2.05,2.1,2.2,2.5,3.0,3.04,3.2]){
    setCurve(stadium(rho)); const S=sExcl(), D=thickD();
    const eg=energyGrad(false); const pr=pairs();
    out.stadium['rho'+rho]={rho_S:+(rho/S).toFixed(3), S_L0:+(S/L0).toFixed(2), D2_L0:+(D/2/L0).toFixed(2), E:eg.E===Infinity?'INF':+eg.E.toFixed(4), gmin:+eg.gmin.toFixed(3), maxTh:+eg.maxTh.toFixed(3), pairs:pr};
  }
  // --- петля 217°+ на малом радиусе с уходом в 3-ю ось (винтовая петля): локальная стенка vs cd>=8 ---
  // спираль радиуса ρ, шаг p на виток, 2 витка, потом прямая замыкающая через большой круг
  function helixLoop(rho,pitch,turns){ const n=600; const pts=[]; const per=Math.sqrt((2*Math.PI*rho)**2+pitch**2); const hl=turns*per;
    // спираль по длине дуги, затем большой полукруг-возврат
    const rest=n-hl; // остаток пускаем большим кругом радиуса R в плоскости xz от конца спирали к началу (грубо: используем отдельную дугу)
    const R=rest/(2*Math.PI)+rho; // просто большая окружность, начало и конец спирали стыкуем через сплайн-ресэмпл
    for(let k=0;k<n;k++){ const s=k; if(s<hl){ const a=2*Math.PI*s/per; pts.push([rho*Math.cos(a), rho*Math.sin(a), pitch*s/per]); }
      else { const t=(s-hl)/rest; const a=2*Math.PI*t; pts.push([rho+ (R)*(1-Math.cos(a)) , 0, turns*pitch*(1-t) + 0*Math.sin(a)*R*0.0]); } }
    return pts; }
  // helixLoop не даёт равных рёбер — используем __knotSetVerts (ресэмпл сплайном), L0 берём фактический
  out.helix={};
  for(const [rho,pitch] of [[1.85,4.3],[1.5,4.3],[1.2,4.5],[1.0,4.6],[1.0,4.2],[1.85,3.5]]){
    const pts=helixLoop(rho,pitch,2); window.__knotSetVerts(pts); updateGeomUnits(); _inflate=1;
    const S=sExcl(); const eg=energyGrad(false); const pr=pairs();
    out.helix['rho'+rho+'_p'+pitch]={L0:+L0.toFixed(3), S_L0:+(S/L0).toFixed(2), rho_L0:+(rho/L0).toFixed(2), E:eg.E===Infinity?'INF':+eg.E.toFixed(4), pairs:pr};
  }
  // --- острый излом 60° (один стык) на кольце: труба радиуса D/2=1 L0, радиус излома 0.87 L0 — пары есть? ---
  function ringWithKink(){ const n=600; const pts=[]; // окружность большого радиуса с одним стыком 60°: строим ломаную с прямыми плечами и замыкаем через большую дугу
    const legLen=100; // два плеча по 100 рёбер с углом поворота 60° в стыке, остальное — большая дуга
    // плечо 1 вдоль +x, стык в (0,0), плечо 2 под углом 60° поворота
    for(let k=0;k<legLen;k++) pts.push([-legLen+k,0,0]);
    for(let k=0;k<legLen;k++) pts.push([k*Math.cos(Math.PI/3), k*Math.sin(Math.PI/3),0]);
    const a0=[legLen*Math.cos(Math.PI/3), legLen*Math.sin(Math.PI/3)], a1=[-legLen,0]; const rest=n-2*legLen;
    // замыкание большой дугой (не точно равные рёбра — но локально у излома ребра=1)
    const cx=(a0[0]+a1[0])/2, cy=(a0[1]+a1[1])/2; const dx=a1[0]-a0[0], dy=a1[1]-a0[1]; const ch=Math.hypot(dx,dy);
    const Rr=rest/Math.PI; // полуокружность-ish
    for(let k=0;k<rest;k++){ const t=k/rest; const ang=Math.PI*t; const ux=dx/ch, uy=dy/ch; const px=-uy, py=ux;
      pts.push([cx - (ch/2)*Math.cos(ang)*ux + Rr*Math.sin(ang)*px*(-1), cy - (ch/2)*Math.cos(ang)*uy + Rr*Math.sin(ang)*py*(-1), 0]); }
    return pts; }
  { const pts=ringWithKink(); window.__knotSetVertsRaw; window.__knotSetVerts(pts); window.__knotSetVertsRaw(pts.map(p=>p)); L0=1; updateGeomUnits(); _inflate=1;
    const eg=energyGrad(false); const pr=pairs();
    // локальные пары у излома (индексы 97..103)
    const S=sExcl(); const loc=[]; for(let i=94;i<100;i++) for(let j=100;j<106;j++){ const cd=j-i; if(cd<=2) continue; const x=_closestSeg(verts[i],verts[(i+1)%N],verts[j],verts[(j+1)%N]).dist; loc.push({cd,x:+x.toFixed(3),foreign:cd*L0/(2*x)>1}); }
    out.kink60={S_L0:+(S/L0).toFixed(2), D2_L0:+(thickD()/2/L0).toFixed(2), kinkRadius_L0:+(1/(2*Math.tan(Math.PI/6))).toFixed(3), E:eg.E===Infinity?'INF':+eg.E.toFixed(4), maxTh:+eg.maxTh.toFixed(3), localPairs:loc.slice(0,12), anyForeignLocal:loc.some(p=>p.foreign), pairs:{nInf:pr.nInf, minCdInf:pr.minCdInf, first:pr.firstInf}}; }
  return out; })()
