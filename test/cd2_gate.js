// Зонд: принимает ли гейт relaxStep (E↓, gmin-фильтр cd>=3, mvT<0.5·gmin)
// шаг, при котором отрезки cd=2 (арки шпильки) проходят друг сквозь друга,
// а через петлю продета третья прядь. Проверяем изменение det Александера.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  H.clickPreset('trefoil'); if(H.running()) H.play();
  const dlt=0.03, sq=Math.sqrt(1-dlt*dlt);
  const A=[0,-0.5,0], B=[0,0.5,0];
  const P=[A[0]-0.6*sq, A[1]+0.8*sq, dlt], Q=[B[0]-0.6*sq, B[1]-0.8*sq, -dlt];
  const TX=-0.17;                      // продевающая прядь — вертикаль через (TX,0)
  const K=[[TX,0,-1.5],[TX,0,-0.5],[TX,0,0.5],[TX,0,1.5]];
  // соединители входят в P и Q с наклоном eps по z: после флипа изгиб в P и Q УМЕНЬШАЕТСЯ (E↓ без сторонних правок)
  const eps=0.25, sq2=Math.sqrt(1-eps*eps);
  const R1=[Q[0],Q[1]-sq2,Q[2]+eps], R3=[TX,0,-2.5];
  const S2=[P[0],P[1]+sq2,P[2]-eps], S0=[TX,0,2.5];
  // средняя точка: |from-p|=3, |p-to|=2, перпендикулярная составляющая — в −x
  const mid3=(from,to)=>{ const w=[to[0]-from[0],to[1]-from[1],to[2]-from[2]], wl=Math.hypot(...w), wh=w.map(x=>x/wl);
    const along=(9+wl*wl-4)/(6*wl), perp=Math.sqrt(1-along*along);
    let v0=[-1,0,0]; const dd=v0[0]*wh[0]+v0[1]*wh[1]+v0[2]*wh[2]; v0=v0.map((x,k)=>x-dd*wh[k]); const vl=Math.hypot(...v0); v0=v0.map(x=>x/vl);
    return from.map((x,k)=>x+3*(along*wh[k]+perp*v0[k])); };
  const R2=mid3(R1,R3), S1=mid3(S2,S0);
  const W=[P,A,B,Q,R1,R2,R3,K[0],K[1],K[2],K[3],S0,S1,S2];
  // обход единичным шагом
  const pts=[]; let acc=0, cur=W[0].slice(); pts.push(cur.slice());
  let need=1;
  for(let w=0;w<W.length;w++){ const a=W[w], b=W[(w+1)%W.length];
    let seg=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]), pos=0;
    while(seg-pos>need-1e-9){ pos+=need; const t=pos/seg; const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; pts.push(p); need=1; }
    need-=(seg-pos); }
  if(Math.hypot(pts[pts.length-1][0]-W[0][0],pts[pts.length-1][1]-W[0][1],pts[pts.length-1][2]-W[0][2])<1e-6) pts.pop();
  const n=pts.length;
  const edges=[]; for(let i=0;i<n;i++){ const a=pts[i],b=pts[(i+1)%n]; edges.push(+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]).toFixed(4)); }
  window.__knotSetVerts(pts); L0=1; _thickScale=0.3/1.6; _inflate=1; window.__knotSetVertsRaw(pts);
  const snap=()=>verts.map(v=>[v.x,v.y,v.z]);
  const idx=(p)=>pts.findIndex(q=>Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2])<1e-6);
  const iP=idx(P), iA=idx(A), iB=idx(B), iQ=idx(Q), iR2=0;
  const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
  const segd=(Pp,i,j)=>_closestSeg(V3(Pp[i]),V3(Pp[(i+1)%n]),V3(Pp[j]),V3(Pp[(j+1)%n])).dist;
  const exactGap=(Pp,cdMin)=>{ let m=Infinity,mi=-1,mj=-1; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){ const cd=Math.min(j-i,n-(j-i)); if(cd<cdMin) continue; const d=segd(Pp,i,j); if(d<m){m=d;mi=i;mj=j;} } return {g:+m.toFixed(4),i:mi,j:mj}; };
  // смешанное произведение для пары арок (P→A, B→Q): [A−P, Q−B, B−P]
  const triple=(Pp)=>{ const p=Pp[iP],a=Pp[iA],b=Pp[iB],q=Pp[iQ];
    const u=[a[0]-p[0],a[1]-p[1],a[2]-p[2]], v=[q[0]-b[0],q[1]-b[1],q[2]-b[2]], w=[b[0]-p[0],b[1]-p[1],b[2]-p[2]];
    return u[0]*(v[1]*w[2]-v[2]*w[1])-u[1]*(v[0]*w[2]-v[2]*w[0])+u[2]*(v[0]*w[1]-v[1]*w[0]); };
  if([iP,iA,iB,iQ,iR2].some(x=>x<0)) return {bad:[iP,iA,iB,iQ,iR2], n, pts:pts.map(p=>p.map(x=>+x.toFixed(3)))};
  const P0=snap();
  const D=thickD();
  const g0=energyGrad(true);
  const det0=_detRobust(9);
  const out={ N:n, L0, D:+D.toFixed(3), edges:[...new Set(edges)], iP,iA,iB,iQ,
    P0:{E:+g0.E.toFixed(6), gminFilt:+g0.gmin.toFixed(4), gapExact3:exactGap(P0,3), gapCd2_PA_BQ:+segd(P0,iP,iB).toFixed(4), triple:+triple(P0).toFixed(5), det:det0} };
  // P1: флип z у P и Q (±0.06) + далёкий угол R2 к середине соседей на 0.02 (E↓)
  const P1=P0.map(p=>p.slice());
  P1[iP][2]=-dlt; P1[iQ][2]=+dlt;
  const evalP=(Pp,label)=>{ window.__knotSetVertsRaw(Pp); const e1=energyGrad(false); const P=snap();
    let mvT=0; for(let i=0;i<n;i++){ const m=Math.hypot(P[i][0]-P0[i][0],P[i][1]-P0[i][1],P[i][2]-P0[i][2]); if(m>mvT) mvT=m; }
    const gate={ Edown: e1.E<g0.E-1e-12, gminOk: e1.gmin>0.55*Math.min(g0.gmin,D), mvOk: mvT<0.5*g0.gmin };
    // путь P0→P: минимум расстояния арок cd=2 и знак смешанного произведения
    let minCd2=Infinity, lAt=null; for(let k=0;k<=200;k++){ const l=k/200; const Pl=P0.map((p,i)=>[p[0]+(P[i][0]-p[0])*l,p[1]+(P[i][1]-p[1])*l,p[2]+(P[i][2]-p[2])*l]); const d=segd(Pl,iP,iB); if(d<minCd2){minCd2=d;lAt=l;} }
    let emax=0; for(let i=0;i<n;i++){ const e=Math.hypot(P[i][0]-P[(i+1)%n][0],P[i][1]-P[(i+1)%n][1],P[i][2]-P[(i+1)%n][2]); emax=Math.max(emax,Math.abs(e-1)); }
    return {label, E:+e1.E.toFixed(6), dE:+(e1.E-g0.E).toExponential(3), gminFilt:+e1.gmin.toFixed(4), gapExact3:exactGap(P,3), mvT:+mvT.toFixed(4), gate, gateAll:gate.Edown&&gate.gminOk&&gate.mvOk,
      gapCd2_PA_BQ:+segd(P,iP,iB).toFixed(4), triple:+triple(P).toFixed(5), pathMinCd2:+minCd2.toFixed(5), pathMinAt:lAt, edgeErrMax:+emax.toExponential(2), det:_detRobust(9)}; };
  out.P1=evalP(P1,'raw');
  // как в relaxStep: после смещения — projectLengths(6), затем гейт
  window.__knotSetVertsRaw(P1); projectLengths(6); const P1p=snap();
  out.P1proj=evalP(P1p,'after projectLengths(6)');
  // проверка, что продевающая прядь проходит через треугольник {X,A,B} в момент прохождения (компланарность)
  { const l=out.P1.pathMinAt; const Pl=P0.map((p,i)=>[p[0]+(P1[i][0]-p[0])*l,p[1]+(P1[i][1]-p[1])*l,p[2]+(P1[i][2]-p[2])*l]);
    const r=_closestSeg(V3(Pl[iP]),V3(Pl[iA]),V3(Pl[iB]),V3(Pl[iQ])); const X=[Pl[iP][0]+(Pl[iA][0]-Pl[iP][0])*r.s, Pl[iP][1]+(Pl[iA][1]-Pl[iP][1])*r.s, Pl[iP][2]+(Pl[iA][2]-Pl[iP][2])*r.s];
    // точка пересечения нити K1K2 (вертикаль x=TX,y=0) с плоскостью z≈0 → барицентрические координаты в треугольнике X,A,B (xy)
    const T=[TX,0]; const bary=(p,a,b,c)=>{ const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]); const l1=((b[1]-c[1])*(p[0]-c[0])+(c[0]-b[0])*(p[1]-c[1]))/d; const l2=((c[1]-a[1])*(p[0]-c[0])+(a[0]-c[0])*(p[1]-c[1]))/d; return [l1,l2,1-l1-l2]; };
    const bc=bary(T,X,Pl[iA],Pl[iB]);
    out.threading={ X:X.map(x=>+x.toFixed(4)), crossDist:+r.dist.toExponential(2), bary:bc.map(x=>+x.toFixed(3)), inside:bc.every(x=>x>0),
      threadClearanceToAB:+segd(Pl,idx(K[1]),iA).toFixed(4), threadClearanceToPA:+segd(Pl,idx(K[1]),iP).toFixed(4), threadClearanceToBQ:+segd(Pl,idx(K[1]),iB).toFixed(4) }; }
  return out;
})()
