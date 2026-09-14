// 3.4: растеризатор синтетических картинок диаграмм узла для стенда распознавания (test/imgknot.js).
// raster({W,H, pts:[{x,y}] замкнутая ломаная в пикселях картинки, gaps:[{s0,s1}] — пропуски нижней пряди по длине дуги,
//   w — толщина штриха, wVar — относительная вариация толщины, bg/ink — [r,g,b], noise — σ шума, light — сила неравномерного света,
//   blur — радиус размытия, breaks — случайные разрывы пера (число), seed}) → {width,height,data:Uint8ClampedArray}
'use strict';
function rng(seed){ let s=(seed>>>0)||1; return ()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; }; }
function arcTable(pts){ const n=pts.length, cum=[0]; for(let i=1;i<=n;i++){ const a=pts[i-1], b=pts[i%n]; cum.push(cum[i-1]+Math.hypot(b.x-a.x,b.y-a.y)); } return cum; }
function inSpans(s, spans, total){ for(const g of spans){ let a=g.s0, b=g.s1; if(a<0){ a+=total; } if(b>total){ b-=total; }
  if(a<=b){ if(s>=a && s<=b) return true; } else if(s>=a || s<=b) return true; } return false; }
function raster(o){
  const W=o.W, H=o.H, pts=o.pts, n=pts.length, cum=arcTable(pts), total=cum[n], R=rng(o.seed||7);
  const spans=(o.gaps||[]).slice();
  for(let k=0;k<(o.breaks||0);k++){ const s=R()*total, h=1.5+R()*2.5; spans.push({s0:s-h, s1:s+h}); }   // разрывы пера (не на пересечениях)
  const cov=new Float32Array(W*H), ph=R()*6.28, w0=o.w||4, wv=o.wVar||0;
  for(let i=0;i<n;i++){ const a=pts[i], b=pts[(i+1)%n], segL=cum[i+1]-cum[i], m=Math.max(1, Math.ceil(segL/0.5));
    for(let k=0;k<m;k++){ const t0=k/m, t1=(k+1)/m, sm=cum[i]+(t0+t1)/2*segL; if(inSpans(sm, spans, total)) continue;
      const w=w0*(1+wv*Math.sin(sm/23+ph)*Math.sin(sm/61+2*ph)), r=w/2+0.5;
      const x0=a.x+(b.x-a.x)*t0, y0=a.y+(b.y-a.y)*t0, x1=a.x+(b.x-a.x)*t1, y1=a.y+(b.y-a.y)*t1, dx=x1-x0, dy=y1-y0, l2=dx*dx+dy*dy||1e-12;
      const px0=Math.max(0, Math.floor(Math.min(x0,x1)-r-1)), px1=Math.min(W-1, Math.ceil(Math.max(x0,x1)+r+1)), py0=Math.max(0, Math.floor(Math.min(y0,y1)-r-1)), py1=Math.min(H-1, Math.ceil(Math.max(y0,y1)+r+1));
      for(let py=py0; py<=py1; py++) for(let px=px0; px<=px1; px++){ const cx=px+0.5, cy=py+0.5; let t=((cx-x0)*dx+(cy-y0)*dy)/l2; t=t<0?0:t>1?1:t;
        const d=Math.hypot(cx-(x0+t*dx), cy-(y0+t*dy)), c=w/2+0.5-d; if(c>0){ const v=c>1?1:c, j=py*W+px; if(v>cov[j]) cov[j]=v; } } } }
  let C=cov; const br=o.blur|0;
  if(br>0){ const T=new Float32Array(W*H); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ let s=0,c=0; for(let dy=-br;dy<=br;dy++){ const yy=y+dy; if(yy<0||yy>=H) continue; for(let dx=-br;dx<=br;dx++){ const xx=x+dx; if(xx<0||xx>=W) continue; s+=cov[yy*W+xx]; c++; } } T[y*W+x]=s/c; } C=T; }
  const data=new Uint8ClampedArray(W*H*4), bg=o.bg||[255,255,255], ink=o.ink||[20,20,20], nz=o.noise||0, lt=o.light||0, gx=R()*2-1, gy=R()*2-1;
  const gauss=()=>{ let u=0,v=0; while(u===0) u=R(); v=R(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.2831853*v); };
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const j=y*W+x, c=C[j], L=1-lt*(0.5+0.5*((x/W-0.5)*gx+(y/H-0.5)*gy)*2)*0.5, e=nz? nz*gauss() : 0;
    for(let ch=0; ch<3; ch++) data[4*j+ch]=(bg[ch]*(1-c)+ink[ch]*c)*L+e;
    data[4*j+3]=255; }
  return {width:W, height:H, data};
}
// дрожание руки: гладкое поле смещений (сумма синусоид), амплитуда amp пикселей
function wobble(pts, amp, seed){ const R=rng(seed||11), modes=[]; for(let k=0;k<4;k++) modes.push({kx:(R()*2-1)*0.02, ky:(R()*2-1)*0.02, ph:R()*6.28, ax:(R()*2-1), ay:(R()*2-1)});
  const f=(x,y)=>{ let dx=0, dy=0; for(const m of modes){ const s=Math.sin(m.kx*x+m.ky*y+m.ph); dx+=m.ax*s; dy+=m.ay*s; } return {dx:dx*amp/2, dy:dy*amp/2}; };
  return {pts:pts.map(p=>{ const d=f(p.x,p.y); return {x:p.x+d.dx, y:p.y+d.dy}; }), field:f}; }
module.exports={raster, wobble, arcTable, rng};
