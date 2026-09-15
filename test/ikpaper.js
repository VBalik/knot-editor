// 4.0: скетчи узлов «как на снимке листа» для стенда распознавания (test/sketchgen.js).
// sketch({W,H, pts, gaps, style, seed}) → {width,height,data RGBA}: бумага (клетка, линейка, точки,
// крафт, мятая, грязная, тёмная доска), перо (гель, шарик, карандаш с двойным следом, маркер, мел),
// съёмка (неровный свет, виньетка, тень, зерно, размытие). Перспектива — отдельно, в точках (persp).
// Штрихи считает coverage() из ikraster.js, поэтому толщина и разрывы — те же, что в imgknot.js.
'use strict';
const RS=require('./ikraster.js');
const rng=RS.rng;

function vnoise(W,H,cell,R){   // гладкий шум значений: решётка cell px, бикубическое сглаживание (smoothstep)
  const gw=Math.ceil(W/cell)+2, gh=Math.ceil(H/cell)+2, g=new Float32Array(gw*gh);
  for(let i=0;i<g.length;i++) g[i]=R()*2-1;
  const out=new Float32Array(W*H);
  for(let y=0;y<H;y++){ const fy=y/cell, y0=Math.floor(fy), ty=fy-y0, sy=ty*ty*(3-2*ty), r0=y0*gw, r1=(y0+1)*gw;
    for(let x=0;x<W;x++){ const fx=x/cell, x0=Math.floor(fx), tx=fx-x0, sx=tx*tx*(3-2*tx);
      out[y*W+x]=(g[r0+x0]*(1-sx)+g[r0+x0+1]*sx)*(1-sy)+(g[r1+x0]*(1-sx)+g[r1+x0+1]*sx)*sy; } }
  return out;
}
function fbm(W,H,cell,oct,R){   // сумма октав: волокна бумаги
  const n=W*H, out=new Float32Array(n); let a=1, c=cell, s=0;
  for(let k=0;k<oct;k++){ const N=vnoise(W,H,Math.max(1.5,c),R); for(let i=0;i<n;i++) out[i]+=a*N[i]; s+=a; a*=0.5; c/=2; }
  for(let i=0;i<n;i++) out[i]/=s;
  return out;
}
// перспектива съёмки: гомография единичного квадрата в слегка сдвинутые углы; fwd — точка, jac — направление
function solve8(A, b){   // метод Гаусса с выбором главного элемента
  const n=8; for(let c=0;c<n;c++){ let p=c; for(let r=c+1;r<n;r++) if(Math.abs(A[r][c])>Math.abs(A[p][c])) p=r;
    const t=A[c]; A[c]=A[p]; A[p]=t; const tb=b[c]; b[c]=b[p]; b[p]=tb;
    const d=A[c][c]||1e-12; for(let r=0;r<n;r++){ if(r===c) continue; const f=A[r][c]/d; if(!f) continue; for(let k=c;k<n;k++) A[r][k]-=f*A[c][k]; b[r]-=f*b[c]; } }
  const x=new Array(n); for(let c=0;c<n;c++) x[c]=b[c]/(A[c][c]||1e-12); return x;
}
function persp(amt, R){   // точки в [0,1]²; amt — сдвиг углов (доля стороны). amt=0 → тождество
  if(!(amt>0)) return {fwd:(x,y)=>[x,y], jac:()=>[1,0,0,1]};
  const src=[[0,0],[1,0],[1,1],[0,1]], dst=src.map(p=>[p[0]+(R()*2-1)*amt, p[1]+(R()*2-1)*amt]);
  const A=[], b=[];
  for(let i=0;i<4;i++){ const [x,y]=src[i], [u,v]=dst[i];
    A.push([x,y,1,0,0,0,-x*u,-y*u]); b.push(u);
    A.push([0,0,0,x,y,1,-x*v,-y*v]); b.push(v); }
  const h=solve8(A,b), fwd=(x,y)=>{ const w=h[6]*x+h[7]*y+1; return [(h[0]*x+h[1]*y+h[2])/w, (h[3]*x+h[4]*y+h[5])/w]; };
  const jac=(x,y)=>{ const e=1e-3, a=fwd(x-e,y), b2=fwd(x+e,y), c=fwd(x,y-e), d=fwd(x,y+e);
    return [(b2[0]-a[0])/(2*e), (d[0]-c[0])/(2*e), (b2[1]-a[1])/(2*e), (d[1]-c[1])/(2*e)]; };
  return {fwd, jac};
}
// дрожание руки: смещение точек как функция длины дуги (замкнутое: длины волн — доли периметра)
function shake(pts, o, seed){
  const R=rng(seed||13), cum=RS.arcTable(pts), n=pts.length, total=cum[n], amp=o.amp||0, M=o.modes||5;
  if(!(amp>0)) return pts;
  const md=[]; for(let k=0;k<M;k++){ const lam=(o.wl0||18)*Math.pow((o.wl1||140)/(o.wl0||18), R()), m=Math.max(1, Math.round(total/lam));
    md.push({m, px:R()*6.283, py:R()*6.283, a:1/Math.sqrt(1+k)}); }
  let sA=0; for(const d of md) sA+=d.a; const g=amp/Math.max(1e-6,sA);
  return pts.map((p,i)=>{ const t=6.283185*cum[i]/total; let dx=0, dy=0;
    for(const d of md){ dx+=d.a*Math.sin(d.m*t+d.px); dy+=d.a*Math.sin(d.m*t+d.py); }
    return {x:p.x+g*dx, y:p.y+g*dy}; });
}
function mix(base, i, col, a){ if(a<=0) return; if(a>1) a=1; base[0][i]=base[0][i]*(1-a)+col[0]*a; base[1][i]=base[1][i]*(1-a)+col[1]*a; base[2][i]=base[2][i]*(1-a)+col[2]*a; }
function lines(base, W, H, o, vert){   // линейка/клетка: полосы шага step под углом angle, с лёгким дрожанием печати
  const ca=Math.cos(o.angle||0), sa=Math.sin(o.angle||0), st=o.step, hw=(o.w||1)/2, col=o.color, a=o.a;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const u=vert? (x*ca+y*sa) : (-x*sa+y*ca), du=((u%st)+st)%st, d=Math.min(du, st-du);
    const g=Math.max(0, Math.min(1, hw+0.5-d))*a; if(g>0) mix(base, y*W+x, col, g); }
}
function dotgrid(base, W, H, o){
  const st=o.step, r=o.r||1.1, col=o.color, a=o.a;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const du=((x%st)+st)%st, dv=((y%st)+st)%st, dx=Math.min(du, st-du), dy=Math.min(dv, st-dv), d=Math.hypot(dx,dy);
    const g=Math.max(0, Math.min(1, r+0.5-d))*a; if(g>0) mix(base, y*W+x, col, g); }
}
function stains(base, W, H, R, o){   // пятна: разводы кофе (кольцо) и грязные размывы, с неровным краем
  for(let k=0;k<(o.n||0);k++){ const cx=R()*W, cy=R()*H, rr=(0.04+0.11*R())*Math.min(W,H), ring=R()<0.45, a0=(o.a||0.3)*(0.6+0.8*R());
    const col=o.col||[140,105,70], ang=R()*6.283, ca=Math.cos(ang), sa=Math.sin(ang), ex=1+0.5*(R()-0.5), ph=R()*6.283, wv=1+2*Math.floor(R()*3);
    const x0=Math.max(0,Math.floor(cx-2.2*rr)), x1=Math.min(W-1,Math.ceil(cx+2.2*rr)), y0=Math.max(0,Math.floor(cy-2.2*rr)), y1=Math.min(H-1,Math.ceil(cy+2.2*rr));
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const px=(x-cx)*ca+(y-cy)*sa, py=(-(x-cx)*sa+(y-cy)*ca)*ex, th=Math.atan2(py,px);
      const d=Math.hypot(px,py)/(rr*(1+0.16*Math.sin(wv*th+ph)));
      const a=ring? a0*Math.exp(-16*(d-1)*(d-1))+0.3*a0*Math.max(0,1-d*d) : a0*Math.exp(-1.8*d*d);
      if(a>0.004) mix(base, y*W+x, col, a); } }
}
function specks(base, W, H, R, o){   // соринки и пыль: тёмные точки 1…3 px по всему листу
  for(let k=0;k<(o.n||0);k++){ const cx=R()*W, cy=R()*H, r=0.6+1.8*R(), a0=(o.a||0.75)*(0.4+0.6*R()), col=o.col||[70,65,60];
    const x0=Math.max(0,Math.floor(cx-r-1)), x1=Math.min(W-1,Math.ceil(cx+r+1)), y0=Math.max(0,Math.floor(cy-r-1)), y1=Math.min(H-1,Math.ceil(cy+r+1));
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){ const d=Math.hypot(x+0.5-cx, y+0.5-cy), g=Math.max(0, Math.min(1, r+0.5-d))*a0; if(g>0) mix(base, y*W+x, col, g); } }
}
function marks(base, W, H, R, o){   // посторонние пометки: короткие росчерки в стороне от рисунка (прямоугольник keep не трогаем)
  const K=o.keep||[0,0,0,0];
  for(let k=0;k<(o.n||0);k++){ let cx=0, cy=0, tries=0;
    do{ cx=R()*W; cy=R()*H; tries++; } while(tries<40 && cx>K[0] && cx<K[2] && cy>K[1] && cy<K[3]);
    const len=(0.03+0.07*R())*Math.min(W,H), ang=R()*6.283, w=(o.w||3), col=o.col||[80,80,90], a=o.a||0.8, seg=Math.ceil(len);
    for(let s=0;s<=seg;s++){ const t=s/seg, x=cx+Math.cos(ang)*len*(t-0.5)+3*Math.sin(6*t+k), y=cy+Math.sin(ang)*len*(t-0.5)+3*Math.cos(5*t+k);
      const x0=Math.max(0,Math.floor(x-w)), x1=Math.min(W-1,Math.ceil(x+w)), y0=Math.max(0,Math.floor(y-w)), y1=Math.min(H-1,Math.ceil(y+w));
      for(let yy=y0;yy<=y1;yy++) for(let xx=x0;xx<=x1;xx++){ const d=Math.hypot(xx+0.5-x, yy+0.5-y), g=Math.max(0, Math.min(1, w/2+0.5-d))*a; if(g>0) mix(base, yy*W+xx, col, g); } } }
}
function crumple(L, W, H, R, o){   // мятая бумага: мягкие складки (|шум|) и резкие сгибы (светлый гребень / тёмная ложбина)
  const amp=o.amp||0.12, cell=Math.max(40, (o.cell||0.3)*Math.min(W,H)), N=fbm(W,H,cell,3,R);
  for(let i=0;i<W*H;i++) L[i]*=1+0.55*amp*(1-2*Math.abs(N[i]));
  for(let k=0;k<(o.folds||0);k++){ const ang=R()*Math.PI, ca=Math.cos(ang), sa=Math.sin(ang), x0=R()*W, y0=R()*H, wf=5+16*R(), aa=amp*(0.7+0.8*R());
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const d=((x-x0)*sa-(y-y0)*ca)/wf; if(d>4||d<-4) continue; L[y*W+x]*=1+aa*d*Math.exp(0.5-d*d/2); } }
}
function blurRGB(base, W, H, br){ if(!(br>0)) return; for(let ch=0; ch<3; ch++) base[ch]=RS.blurBox(base[ch], W, H, br); }

// style: {paper, fiber, ink, alpha, w, wVar, breaks, dbl:{dx,dy,a}, grid, rules, margin, dotgrid, stains, specks, marks,
//         crumple, light, vignette, shadow, noise, blur}
function sketch(o){
  const W=o.W, H=o.H, n=W*H, S=o.style||{}, R=rng(o.seed||7), pts=o.pts, cum=RS.arcTable(pts), total=cum[pts.length];
  const base=[new Float32Array(n), new Float32Array(n), new Float32Array(n)], pc=S.paper||[248,246,240], fa=(S.fiber===undefined? 6 : S.fiber);
  const fib=fbm(W,H,Math.max(24,0.07*Math.min(W,H)),3,R), grain=vnoise(W,H,2.2,R);
  for(let i=0;i<n;i++){ const v=fa*fib[i]+0.55*fa*grain[i]; base[0][i]=pc[0]+v; base[1][i]=pc[1]+v*1.03; base[2][i]=pc[2]+v*1.07; }
  if(S.grid){ lines(base, W, H, S.grid, true); lines(base, W, H, S.grid, false); }
  if(S.rules) lines(base, W, H, S.rules, false);
  if(S.margin) vline(base, W, H, S.margin);   // поля тетради
  if(S.dotgrid) dotgrid(base, W, H, S.dotgrid);
  if(S.stains) stains(base, W, H, R, S.stains);
  // штрихи пера: разрывы нижней пряди + случайные разрывы пера
  const spans=(o.gaps||[]).slice();
  for(let k=0;k<(S.breaks||0);k++){ const s=R()*total, h=1.2+2.2*R(); spans.push({s0:s-h, s1:s+h}); }
  const ph=R()*6.283, br=S.blur|0, ink=S.ink||[30,32,40], al=(S.alpha===undefined? 0.95 : S.alpha);
  const C=RS.blurBox(RS.coverage(W, H, pts, cum, spans, S.w||5, S.wVar||0, ph, 0, 0), W, H, br);
  if(S.dbl){ const C2=RS.blurBox(RS.coverage(W, H, pts, cum, spans, (S.dbl.w||S.w*0.55), S.wVar||0, ph+1.7, S.dbl.dx||0, S.dbl.dy||0), W, H, br);
    for(let i=0;i<n;i++) mix(base, i, ink, C2[i]*al*(S.dbl.a||0.5)); }   // двойной след карандаша/пера: вторая, более слабая линия рядом
  if(S.ghost){ const CG=RS.blurBox(RS.coverage(W, H, pts, cum, [], S.ghost.w||1.4, 0, ph, S.ghost.dx||0, S.ghost.dy||0), W, H, br);
    for(let i=0;i<n;i++) mix(base, i, S.ghost.color||[120,120,125], CG[i]*(S.ghost.a||0.35)); }   // карандашный набросок под чистовиком — идёт и через разрывы
  for(let i=0;i<n;i++) mix(base, i, ink, C[i]*al);
  if(S.specks) specks(base, W, H, R, S.specks);
  if(S.marks) marks(base, W, H, R, S.marks);
  if(br) blurRGB(base, W, H, br);
  // свет: неровное освещение, виньетка, тень у края, складки
  const L=new Float32Array(n).fill(1), lt=S.light||0, gx=R()*2-1, gy=R()*2-1, vg=S.vignette||0, sh=S.shadow||0;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x; let v=1;
    if(lt) v*=1-lt*0.5*((x/W-0.5)*gx+(y/H-0.5)*gy);
    if(vg) v*=1-vg*((x/W-0.5)*(x/W-0.5)+(y/H-0.5)*(y/H-0.5))*1.2;
    if(sh) v*=1-sh*Math.max(0, (y/H-0.86)/0.14);
    L[i]=v; }
  if(S.crumple) crumple(L, W, H, R, S.crumple);
  const nz=S.noise||0, data=new Uint8ClampedArray(n*4);
  const gauss=()=>{ let u=0,v=0; while(u===0) u=R(); v=R(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.2831853*v); };
  for(let i=0;i<n;i++){ const e=nz? nz*gauss() : 0, l=L[i];
    data[4*i]=base[0][i]*l+e; data[4*i+1]=base[1][i]*l+e; data[4*i+2]=base[2][i]*l+e; data[4*i+3]=255; }
  return {width:W, height:H, data};
}
function vline(base, W, H, o){   // поля тетради: одна вертикальная черта
  const x0=o.x*W, hw=(o.w||1.5)/2;
  for(let y=0;y<H;y++) for(let x=Math.max(0,Math.floor(x0-hw-1)); x<=Math.min(W-1,Math.ceil(x0+hw+1)); x++){
    const g=Math.max(0, Math.min(1, hw+0.5-Math.abs(x+0.5-x0)))*o.a; if(g>0) mix(base, y*W+x, o.color, g); }
}
module.exports={sketch, persp, shake, fbm, vnoise};
