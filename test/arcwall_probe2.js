(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // плотный путь -> 600 точек с шагом дуги ровно 1
  function sampleUnit(dense){ const pts=[]; let acc=0, next=0; pts.push(dense[0]);
    for(let k=1;k<dense.length && pts.length<600;k++){ const a=dense[k-1], b=dense[k]; const d=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
      while(acc+d>=pts.length && pts.length<600){ const t=(pts.length-acc)/d; pts.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2])]); }
      acc+=d; }
    return pts; }
  function setRaw(pts){ window.__knotSetVerts(pts); window.__knotSetVertsRaw(pts); L0=1; updateGeomUnits(); _inflate=1; _energyDirty=true; }
  function pairs(lim){ const n=N, S=sExcl(); let inf=[], gmin=Infinity;
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n;
      const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<gmin) gmin=x;
      if(cd*L0/(2*x)>1 && x-S<=1e-9*L0) inf.push({i,j,cd,x:+x.toFixed(3), wall: cd*L0/2<S?'cd*L0/2':'S'});
    }}
    const localOnly=inf.filter(p=>p.wall==='cd*L0/2'), sOnly=inf.filter(p=>p.wall==='S');
    return {gmin:+gmin.toFixed(3), nInf:inf.length, nLocalWall:localOnly.length, nSWall:sOnly.length, firstLocal:localOnly.slice(0,2), firstS:sOnly.slice(0,2)}; }
  H.clickPreset('trefoil'); H.setSlider('thick',10); H.setSlider('repCoef',10);
  // ---- капля с изломом θ: два плеча A, дуга 360°-θ радиуса Rr, касательная к плечам
  function drop(thetaDeg){ const th=thetaDeg*Math.PI/180, half=(Math.PI-th)/2; // половина внутреннего угла
    const T=600; // 2A + (2π-th)·Rr, Rr = A·tan(half)... касательная длина A = Rr/tan(half)
    const tanH=Math.tan(half); // Rr = A*tanH
    const A=T/(2+(2*Math.PI-th)*tanH), Rr=A*tanH;
    const a1=Math.PI/2+half, a2=Math.PI/2-half; // направления плеч от излома
    const P1=[A*Math.cos(a1),A*Math.sin(a1),0], P2=[A*Math.cos(a2),A*Math.sin(a2),0];
    const C=[0, A*Math.sin(a2)+Rr*Math.cos(a2)*1, 0]; // центр на биссектрисе: P2 + Rr·n, n=(-sin a2, cos a2)
    C[0]=P2[0]-Rr*Math.sin(a2); C[1]=P2[1]+Rr*Math.cos(a2);
    const dense=[]; const st=0.02;
    for(let s=0;s<=A;s+=st) dense.push([P1[0]*(1-s/A),P1[1]*(1-s/A),0]);
    for(let s=0;s<=A;s+=st) dense.push([P2[0]*(s/A),P2[1]*(s/A),0]);
    const b0=Math.atan2(P2[1]-C[1],P2[0]-C[0]); const sweep=2*Math.PI-th;
    for(let s=0;s<=sweep*Rr;s+=st){ const a=b0+s/Rr; dense.push([C[0]+Rr*Math.cos(a),C[1]+Rr*Math.sin(a),0]); }
    dense.push(P1);
    return {pts:sampleUnit(dense), Rr:+Rr.toFixed(1), kinkR:+(1/(2*Math.tan(th/2))).toFixed(3)}; }
  out.kink={};
  for(const th of [40,60,75,82,84,90,100,120]){ const d=drop(th); setRaw(d.pts); const eg=energyGrad(false); const pr=pairs();
    // фактический угол в изломе (макс. θ)
    out.kink['th'+th]={kinkRadius_L0:d.kinkR, D2_L0:+(thickD()/2/L0).toFixed(2), S_L0:+(sExcl()/L0).toFixed(2), tubeOverlap:d.kinkR<thickD()/2, E:eg.E===Infinity?'INF':+eg.E.toFixed(3), maxTh_deg:+(eg.maxTh*180/Math.PI).toFixed(1), pairs:pr}; }
  // ---- спираль радиуса ρ, шаг p, витков tn; замыкание большими гладкими дугами
  function helix(rho,p,tn){ const per=Math.sqrt((2*Math.PI*rho)**2+p**2); const hl=tn*per; const Rc=40; const U=(600-hl-tn*p-2*Math.PI*Rc)/4;
    const dense=[]; const st=0.02;
    for(let s=0;s<=hl;s+=st){ const a=2*Math.PI*s/per; dense.push([rho*Math.cos(a), rho*Math.sin(a), p*s/per]); }
    const zt=tn*p; // конец спирали (rho,0,zt)
    for(let s=0;s<=U;s+=st) dense.push([rho,0,zt+s]);
    for(let s=0;s<=Math.PI*Rc;s+=st){ const a=s/Rc; dense.push([rho+Rc-Rc*Math.cos(a),0,zt+U+Rc*Math.sin(a)]); }
    for(let s=0;s<=zt+2*U;s+=st) dense.push([rho+2*Rc,0,zt+U-s]);
    for(let s=0;s<=Math.PI*Rc;s+=st){ const a=s/Rc; dense.push([rho+Rc+Rc*Math.cos(a),0,-U-Rc*Math.sin(a)]); }
    for(let s=0;s<=U;s+=st) dense.push([rho,0,-U+s]);
    dense.push([rho,0,0]);
    return sampleUnit(dense); }
  out.helix={};
  for(const [rho,p] of [[2.5,4.5],[1.85,4.3],[1.85,4.6],[1.5,4.5],[1.2,4.6],[1.0,4.6],[1.0,4.3],[0.8,4.8]]){
    setRaw(helix(rho,p,2)); const eg=energyGrad(false); const pr=pairs();
    const hl=2*Math.sqrt((2*Math.PI*rho)**2+p**2);
    out.helix['rho'+rho+'_p'+p]={helixEdges:+hl.toFixed(1), rho_over_D2:+(rho/(thickD()/2)).toFixed(2), E:eg.E===Infinity?'INF':+eg.E.toFixed(3), maxTh_deg:+(eg.maxTh*180/Math.PI).toFixed(1), pairs:pr}; }
  return out; })()
