// 4.1: настоящая растеризация 2D-холста для стенда (harness.js с KNOT_CANVAS=canvas2d.js).
// makeCanvas(w, h [, el]) → контекст с подмножеством CanvasRenderingContext2D, которым пользуется
// 2D-редактор index.html: пути (moveTo/lineTo/arc/rect), stroke/fill с антиалиасингом (покрытие
// дробное, не 1 бит), clearRect/fillRect, линейные градиенты, пунктир, тень, 'destination-out'.
// Пиксели: ctx.__pixels() → {width, height, data} (RGBA, НЕ премультиплицированные, 0..255).
// Буфер внутри — премультиплицированный float RGBA: source-over и destination-out считаются точно.
'use strict';

/* ---------- цвета ---------- */
const NAMED = { transparent:[0,0,0,0], white:[255,255,255,1], black:[0,0,0,1], red:[255,0,0,1], lime:[0,255,0,1],
  green:[0,128,0,1], blue:[0,0,255,1], yellow:[255,255,0,1], cyan:[0,255,255,1], magenta:[255,0,255,1],
  gray:[128,128,128,1], grey:[128,128,128,1], silver:[192,192,192,1], orange:[255,165,0,1] };
const _cc = new Map();
function parseColor(s){                      // '#rgb' | '#rrggbb' | '#rrggbbaa' | 'rgb()' | 'rgba()' | имя → [r,g,b,a]
  if(Array.isArray(s)) return s;
  if(typeof s!=='string') return null;
  const k = s.trim().toLowerCase();
  if(_cc.has(k)) return _cc.get(k);
  let o = null;
  if(k[0]==='#'){
    const h = k.slice(1);
    if(h.length===3 || h.length===4){ o=[parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16), h.length===4? parseInt(h[3]+h[3],16)/255 : 1]; }
    else if(h.length===6 || h.length===8){ o=[parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), h.length===8? parseInt(h.slice(6,8),16)/255 : 1]; }
  } else if(k.indexOf('rgb')===0){
    const m = k.slice(k.indexOf('(')+1, k.lastIndexOf(')')).split(/[\s,\/]+/).filter(x=>x.length);
    const n = (x)=> x.slice(-1)==='%' ? parseFloat(x)*2.55 : parseFloat(x);
    if(m.length>=3) o = [n(m[0]), n(m[1]), n(m[2]), m.length>3 ? (m[3].slice(-1)==='%'? parseFloat(m[3])/100 : parseFloat(m[3])) : 1];
  } else if(NAMED[k]) o = NAMED[k].slice();
  if(o && (o.some(v=>!isFinite(v)))) o = null;
  if(o){ for(let i=0;i<3;i++) o[i]=Math.max(0, Math.min(255, o[i])); o[3]=Math.max(0, Math.min(1, o[3])); }
  _cc.set(k, o);
  return o;
}
const cl01 = (v)=> v<0?0:(v>1?1:v);

/* ---------- линейный градиент ---------- */
function makeGradient(x0,y0,x1,y1){
  const stops=[];
  return { __grad:true, x0:x0, y0:y0, x1:x1, y1:y1, stops:stops,
    addColorStop(t, c){ stops.push({t:+t, c:parseColor(c)||[0,0,0,0]}); stops.sort((a,b)=>a.t-b.t); } };
}
function gradAt(g, t, out){                   // цвет градиента в параметре t∈[0,1] (интерполяция без премультипликации)
  const S=g.stops; if(!S.length){ out[0]=out[1]=out[2]=out[3]=0; return out; }
  if(t<=S[0].t || S.length===1){ const c=S[0].c; out[0]=c[0]; out[1]=c[1]; out[2]=c[2]; out[3]=c[3]; return out; }
  if(t>=S[S.length-1].t){ const c=S[S.length-1].c; out[0]=c[0]; out[1]=c[1]; out[2]=c[2]; out[3]=c[3]; return out; }
  let i=0; while(i<S.length-2 && S[i+1].t<t) i++;
  const a=S[i], b=S[i+1], d=b.t-a.t, u=d>1e-9? (t-a.t)/d : 0;
  for(let k=0;k<4;k++) out[k]=a.c[k]+(b.c[k]-a.c[k])*u;
  return out;
}

/* ---------- контекст ---------- */
function newState(){
  return { m:[1,0,0,1,0,0], lineWidth:1, lineCap:'butt', lineJoin:'miter', miterLimit:10,
    strokeStyle:'#000000', fillStyle:'#000000', globalAlpha:1, globalCompositeOperation:'source-over',
    lineDash:[], lineDashOffset:0, shadowColor:'rgba(0,0,0,0)', shadowBlur:0, shadowOffsetX:0, shadowOffsetY:0,
    filter:'none', font:'10px sans-serif', textAlign:'start', textBaseline:'alphabetic', imageSmoothingEnabled:true };
}

function makeCanvas(width, height, el){
  let W = Math.max(1, width|0), H = Math.max(1, height|0);
  let buf = new Float32Array(W*H*4);          // премультиплицированный RGBA, 0..1
  let cov = new Float32Array(W*H);            // покрытие текущей фигуры
  let shd = null;                             // буфер тени (по требованию)
  let bx0=0, by0=0, bx1=-1, by1=-1;           // дирти-прямоугольник cov
  let st = newState();
  const stack = [];
  let subs = [], cur = null, pend = null;     // подпути {p:[x,y,…], closed}; pend — точка после closePath
  let lu = null;                              // текущая точка в координатах пользователя (для кривых Безье)
  const _last = ()=> lu;

  function resize(w,h){ W=Math.max(1,w|0); H=Math.max(1,h|0); buf=new Float32Array(W*H*4); cov=new Float32Array(W*H); shd=null;
    bx0=0; by0=0; bx1=-1; by1=-1; ctx.canvas.width=W; ctx.canvas.height=H; }
  function sync(){ if(el && (el.width|0)>0 && (el.height|0)>0 && ((el.width|0)!==W || (el.height|0)!==H)) resize(el.width, el.height); }

  const TX = (x,y)=> st.m[0]*x + st.m[2]*y + st.m[4];
  const TY = (x,y)=> st.m[1]*x + st.m[3]*y + st.m[5];
  const SCL = ()=>{ const d=Math.sqrt(Math.abs(st.m[0]*st.m[3]-st.m[1]*st.m[2])); return d>1e-9? d : 1; };

  /* --- покрытие: max-объединение, дирти-бокс --- */
  function mark(x0,y0,x1,y1){                  // расширить дирти-бокс (пусто, когда bx1<bx0)
    if(x0<0) x0=0; if(y0<0) y0=0; if(x1>W-1) x1=W-1; if(y1>H-1) y1=H-1;
    if(x1<x0 || y1<y0) return;
    if(bx1<bx0 || by1<by0){ bx0=x0; by0=y0; bx1=x1; by1=y1; return; }
    if(x0<bx0) bx0=x0; if(y0<by0) by0=y0; if(x1>bx1) bx1=x1; if(y1>by1) by1=y1; }
  function covClear(){ if(bx1<bx0||by1<by0){ bx0=0; by0=0; bx1=-1; by1=-1; return; }
    for(let y=by0;y<=by1;y++) cov.fill(0, y*W+bx0, y*W+bx1+1);
    bx0=0; by0=0; bx1=-1; by1=-1; }
  function put(i, v){ if(v>cov[i]) cov[i]=v; }

  function covDisc(cx,cy,r){                   // круглый торец/стык
    const R=r+0.5, x0=Math.max(0,Math.floor(cx-R)), x1=Math.min(W-1,Math.ceil(cx+R)), y0=Math.max(0,Math.floor(cy-R)), y1=Math.min(H-1,Math.ceil(cy+R));
    if(x1<x0||y1<y0) return; mark(x0,y0,x1,y1);
    for(let py=y0;py<=y1;py++){ const dy=py+0.5-cy, row=py*W;
      for(let px=x0;px<=x1;px++){ const dx=px+0.5-cx, c=R-Math.hypot(dx,dy); if(c>0) put(row+px, c>1?1:c); } }
  }
  function covJoin(vx,vy,ax,ay,bx,by,hw){      // круглый стык при ровных торцах: клин между торцом входящего и началом исходящего отрезка
    let u1x=vx-ax, u1y=vy-ay, u2x=bx-vx, u2y=by-vy;
    const l1=Math.hypot(u1x,u1y), l2=Math.hypot(u2x,u2y);
    if(l1<1e-9 || l2<1e-9) return;
    u1x/=l1; u1y/=l1; u2x/=l2; u2y/=l2;
    if(u1x*u2x+u1y*u2y > 0.999999) return;     // почти прямая: клин пуст
    const R=hw+0.5, x0=Math.max(0,Math.floor(vx-R)), x1=Math.min(W-1,Math.ceil(vx+R)), y0=Math.max(0,Math.floor(vy-R)), y1=Math.min(H-1,Math.ceil(vy+R));
    if(x1<x0||y1<y0) return; mark(x0,y0,x1,y1);
    for(let py=y0;py<=y1;py++){ const ey=py+0.5-vy, row=py*W;
      for(let px=x0;px<=x1;px++){ const ex=px+0.5-vx, c=R-Math.hypot(ex,ey); if(c<=0) continue;
        const m1=0.5+(ex*u1x+ey*u1y), m2=0.5-(ex*u2x+ey*u2y); if(m1<=0||m2<=0) continue;
        put(row+px, (c>1?1:c)*(m1>1?1:m1)*(m2>1?1:m2)); } }
  }
  function covSeg(x0,y0,x1,y1,hw,butt){        // отрезок штриха: butt — ровный торец, иначе круглый
    const dx=x1-x0, dy=y1-y0, L2=dx*dx+dy*dy;
    if(L2<1e-12){ if(!butt) covDisc(x0,y0,hw); return; }
    const L=Math.sqrt(L2), R=hw+0.5;
    const px0=Math.max(0,Math.floor(Math.min(x0,x1)-R-1)), px1=Math.min(W-1,Math.ceil(Math.max(x0,x1)+R+1));
    const py0=Math.max(0,Math.floor(Math.min(y0,y1)-R-1)), py1=Math.min(H-1,Math.ceil(Math.max(y0,y1)+R+1));
    if(px1<px0||py1<py0) return; mark(px0,py0,px1,py1);
    const ux=dx/L, uy=dy/L;
    for(let py=py0;py<=py1;py++){ const cy=py+0.5, row=py*W;
      for(let px=px0;px<=px1;px++){ const cx=px+0.5, ex=cx-x0, ey=cy-y0; let c;
        if(butt){ const s=ex*ux+ey*uy, perp=Math.abs(ex*(-uy)+ey*ux);
          const cp=R-perp; if(cp<=0) continue; const ca=Math.min(s, L-s)+0.5; if(ca<=0) continue;
          c=(cp>1?1:cp)*(ca>1?1:ca);
        } else { let t=(ex*dx+ey*dy)/L2; t=t<0?0:(t>1?1:t);
          const d=Math.hypot(cx-(x0+t*dx), cy-(y0+t*dy)); c=R-d; if(c<=0) continue; if(c>1) c=1; }
        put(row+px, c); } }
  }

  /* --- заливка многоугольников: развёртка с 8 подстроками, ненулевое правило --- */
  function covPolys(polys){
    const SS=8, ed=[]; let mnx=1e18, mxx=-1e18, mny=1e18, mxy=-1e18;
    for(const p of polys){ const n=p.length/2|0; if(n<2) continue;
      for(let i=0;i<n;i++){ const ax=p[2*i], ay=p[2*i+1], bx=p[2*((i+1)%n)], by=p[2*((i+1)%n)+1];
        if(ax<mnx)mnx=ax; if(ax>mxx)mxx=ax; if(ay<mny)mny=ay; if(ay>mxy)mxy=ay;
        if(ay===by) continue; ed.push([ax,ay,bx,by]); } }
    if(!ed.length) return;
    const y0=Math.max(0,Math.floor(mny)), y1=Math.min(H-1,Math.ceil(mxy)), x0=Math.max(0,Math.floor(mnx)), x1=Math.min(W-1,Math.ceil(mxx));
    if(y1<y0||x1<x0) return; mark(x0,y0,x1,y1);
    const xs=[];
    for(let py=y0;py<=y1;py++){ const row=py*W;
      for(let s=0;s<SS;s++){ const sy=py+(s+0.5)/SS; xs.length=0;
        for(const e of ed){ const ay=e[1], by=e[3];
          if((sy>=ay && sy<by) || (sy>=by && sy<ay)) xs.push([e[0]+(sy-ay)*(e[2]-e[0])/(by-ay), by>ay?1:-1]); }
        if(xs.length<2) continue;
        xs.sort((a,b)=>a[0]-b[0]);
        let w=0, sx=0;
        for(const c of xs){ const pw=w; w+=c[1];
          if(pw===0 && w!==0) sx=c[0];
          else if(pw!==0 && w===0){ let a=sx, b=c[0]; if(b<=a) continue;
            if(a<x0) a=x0; if(b>x1+1) b=x1+1; if(b<=a) continue;
            const ia=Math.floor(a), ib=Math.ceil(b)-1;
            for(let px=ia;px<=ib;px++){ if(px<0||px>=W) continue;
              const o=Math.min(b,px+1)-Math.max(a,px); if(o>0){ const j=row+px, v=cov[j]+o/SS; cov[j]=v>1?1:v; } } } }
      } }
  }

  /* --- пунктир --- */
  function dashSplit(pts, closed){
    const d = st.lineDash;
    let tot=0; for(const v of d) tot+=v;
    const P = pts.slice(); if(closed && P.length>=4){ P.push(P[0], P[1]); }
    if(!(tot>0)) return [{p:P, closed:closed}];
    const pat = (d.length%2) ? d.concat(d) : d.slice();
    let T=0; for(const v of pat) T+=v;
    let off = ((st.lineDashOffset % T) + T) % T, idx=0;
    while(off >= pat[idx]){ off -= pat[idx]; idx=(idx+1)%pat.length; }
    let rem = pat[idx]-off, on = (idx%2)===0;
    const out=[]; let run = on? [P[0],P[1]] : null, guard=0;
    for(let i=0;i+3<P.length;i+=2){
      let ax=P[i], ay=P[i+1]; const bx=P[i+2], by=P[i+3];
      let len=Math.hypot(bx-ax, by-ay);
      while(len > rem && ++guard<200000){
        const t=rem/len, mx=ax+(bx-ax)*t, my=ay+(by-ay)*t;
        if(on){ run.push(mx,my); out.push({p:run, closed:false}); run=null; } else run=[mx,my];
        ax=mx; ay=my; len-=rem;
        idx=(idx+1)%pat.length; rem=pat[idx]; on=!on;
        if(rem<=0) rem=1e-9;
      }
      rem-=len;
      if(on) run.push(bx,by);
    }
    if(on && run && run.length>=4) out.push({p:run, closed:false});
    return out;
  }

  /* --- обводка пути в cov --- */
  function covStroke(){
    const hw = Math.max(0.001, st.lineWidth*SCL()/2), butt = st.lineCap!=='round', round = !butt;
    for(const sp of subs){
      if(sp.p.length<2) continue;
      if(sp.p.length===2){ if(round) covDisc(sp.p[0], sp.p[1], hw); continue; }
      // при круглых торцах объединение «капсул» само даёт круглые стыки — добавлять ничего не надо
      const seam = (sp.closed || (sp.p.length>=6 && Math.abs(sp.p[0]-sp.p[sp.p.length-2])<1e-6 && Math.abs(sp.p[1]-sp.p[sp.p.length-1])<1e-6)) && st.lineDash.length===0;
      for(const part of dashSplit(sp.p, sp.closed)){
        const P=part.p, n=P.length/2|0;
        for(let i=0;i+1<n;i++) covSeg(P[2*i], P[2*i+1], P[2*i+2], P[2*i+3], hw, butt);
        if(!butt) continue;
        for(let i=1;i+1<n;i++) covJoin(P[2*i], P[2*i+1], P[2*i-2], P[2*i-1], P[2*i+2], P[2*i+3], hw);
        if(seam && n>2) covJoin(P[0], P[1], P[2*n-4], P[2*n-3], P[2], P[3], hw);   // шов замкнутого подпути
      }
    }
  }
  function covFill(){ covPolys(subs.filter(s=>s.p.length>=6).map(s=>s.p)); }

  /* --- нанесение покрытия на буфер --- */
  function paint(style, erase){
    if(bx1<bx0||by1<by0) return;
    const ga = st.globalAlpha, op = erase? 'destination-out' : st.globalCompositeOperation;
    const grad = style && style.__grad ? style : null;
    let R=0,G=0,B=0,A=1;
    if(!grad){ const c = parseColor(style); if(!c) return; R=c[0]/255; G=c[1]/255; B=c[2]/255; A=c[3]; if(A<=0 && op!=='destination-out') return; }
    let gx0=0, gy0=0, gvx=1, gvy=0, gl2=1; const tmp=[0,0,0,0];
    if(grad){ gx0=TX(grad.x0, grad.y0); gy0=TY(grad.x0, grad.y0);
      gvx=TX(grad.x1, grad.y1)-gx0; gvy=TY(grad.x1, grad.y1)-gy0; gl2=gvx*gvx+gvy*gvy; if(gl2<1e-12) gl2=1e-12; }
    for(let y=by0;y<=by1;y++){ const row=y*W;
      for(let x=bx0;x<=bx1;x++){ const c=cov[row+x]; if(c<=0) continue;
        let r=R,g=G,b=B,a=A;
        if(grad){ gradAt(grad, cl01(((x+0.5-gx0)*gvx+(y+0.5-gy0)*gvy)/gl2), tmp); r=tmp[0]/255; g=tmp[1]/255; b=tmp[2]/255; a=tmp[3]; }
        const al = (c>1?1:c)*a*ga; if(al<=0) continue;
        const j=4*(row+x);
        if(op==='destination-out'){ const k=1-al; buf[j]*=k; buf[j+1]*=k; buf[j+2]*=k; buf[j+3]*=k; }
        else { const k=1-al; buf[j]=r*al+buf[j]*k; buf[j+1]=g*al+buf[j+1]*k; buf[j+2]=b*al+buf[j+2]*k; buf[j+3]=al+buf[j+3]*k; }
      } }
  }

  /* --- тень: та же фигура, сдвинутая и размытая --- */
  function boxBlur(src, dst, r){
    const n=2*r+1;
    for(let y=0;y<H;y++){ const row=y*W; let s=0;
      for(let x=-r;x<=r;x++) s+=src[row+Math.max(0,Math.min(W-1,x))];
      for(let x=0;x<W;x++){ dst[row+x]=s/n;
        s += src[row+Math.max(0,Math.min(W-1,x+r+1))] - src[row+Math.max(0,Math.min(W-1,x-r))]; } }
    for(let x=0;x<W;x++){ let s=0;
      for(let y=-r;y<=r;y++) s+=dst[Math.max(0,Math.min(H-1,y))*W+x];
      const col=new Float32Array(H);
      for(let y=0;y<H;y++){ col[y]=s/n;
        s += dst[Math.max(0,Math.min(H-1,y+r+1))*W+x] - dst[Math.max(0,Math.min(H-1,y-r))*W+x]; }
      for(let y=0;y<H;y++) dst[y*W+x]=col[y]; }
  }
  function paintShadow(){
    const sc = parseColor(st.shadowColor);
    if(!sc || sc[3]<=0) return;
    const ox=Math.round(st.shadowOffsetX), oy=Math.round(st.shadowOffsetY), blur=st.shadowBlur||0;
    if(!blur && !ox && !oy) return;
    if(bx1<bx0||by1<by0) return;
    if(!shd) shd=new Float32Array(W*H); else shd.fill(0);
    for(let y=by0;y<=by1;y++){ const ty2=y+oy; if(ty2<0||ty2>=H) continue;
      for(let x=bx0;x<=bx1;x++){ const tx2=x+ox; if(tx2<0||tx2>=W) continue; shd[ty2*W+tx2]=cov[y*W+x]; } }
    let r=0;
    if(blur>0){ const sg=blur/2; r=Math.max(1, Math.round((Math.sqrt(4*sg*sg+1)-1)/2));
      const t=new Float32Array(W*H);
      boxBlur(shd, t, r); boxBlur(t, shd, r); boxBlur(shd, t, r); shd.set(t); }
    // покрытие тени — в cov (с сохранением оригинала), красим, возвращаем
    const ocov=cov, ob=[bx0,by0,bx1,by1];
    cov=shd; bx0=Math.max(0,ob[0]+ox-3*r-1); by0=Math.max(0,ob[1]+oy-3*r-1); bx1=Math.min(W-1,ob[2]+ox+3*r+1); by1=Math.min(H-1,ob[3]+oy+3*r+1);
    paint(st.shadowColor, false);
    cov=ocov; bx0=ob[0]; by0=ob[1]; bx1=ob[2]; by1=ob[3];
    shd=null;
  }

  /* --- прямоугольник в текущей системе координат --- */
  function rectPoly(x,y,w,h){ return [TX(x,y),TY(x,y), TX(x+w,y),TY(x+w,y), TX(x+w,y+h),TY(x+w,y+h), TX(x,y+h),TY(x,y+h)]; }

  const ctx = {
    canvas: el || {width:W, height:H},
    /* --- состояние --- */
    save(){ const c=Object.assign({}, st); c.m=st.m.slice(); c.lineDash=st.lineDash.slice(); stack.push(c); },
    restore(){ if(stack.length) st=stack.pop(); },
    /* --- преобразования --- */
    setTransform(a,b,c,d,e,f){ if(a && typeof a==='object'){ st.m=[a.a||1,a.b||0,a.c||0,a.d||1,a.e||0,a.f||0]; return; } st.m=[a,b,c,d,e,f]; },
    resetTransform(){ st.m=[1,0,0,1,0,0]; },
    getTransform(){ const m=st.m; return {a:m[0], b:m[1], c:m[2], d:m[3], e:m[4], f:m[5]}; },
    transform(a,b,c,d,e,f){ const m=st.m;
      st.m=[m[0]*a+m[2]*b, m[1]*a+m[3]*b, m[0]*c+m[2]*d, m[1]*c+m[3]*d, m[0]*e+m[2]*f+m[4], m[1]*e+m[3]*f+m[5]]; },
    translate(x,y){ ctx.transform(1,0,0,1,x,y); },
    scale(x,y){ ctx.transform(x,0,0,y,0,0); },
    rotate(a){ const c=Math.cos(a), s=Math.sin(a); ctx.transform(c,s,-s,c,0,0); },
    /* --- пути --- */
    beginPath(){ subs=[]; cur=null; pend=null; lu=null; },
    moveTo(x,y){ cur={p:[TX(x,y), TY(x,y)], closed:false}; subs.push(cur); pend=null; lu=[x,y]; },
    lineTo(x,y){ const X=TX(x,y), Y=TY(x,y);
      if(!cur){ cur={p: pend? [pend[0],pend[1]] : [X,Y], closed:false}; subs.push(cur); pend=null; }
      cur.p.push(X,Y); lu=[x,y]; },
    closePath(){ if(cur && cur.p.length>=4){ cur.closed=true; pend=[cur.p[0], cur.p[1]]; cur=null; } },
    arc(x,y,r,a0,a1,ccw){
      const TWO=Math.PI*2; let sw;
      if(ccw){ const d=a0-a1; sw = d>=TWO? -TWO : -(((d%TWO)+TWO)%TWO); }
      else   { const d=a1-a0; sw = d>=TWO?  TWO :  (((d%TWO)+TWO)%TWO); }
      const rd=Math.abs(r)*SCL(), n=Math.max(6, Math.min(2048, Math.ceil(Math.abs(sw)/TWO*Math.max(24, rd*3))));
      for(let i=0;i<=n;i++){ const a=a0+sw*i/n, px=x+r*Math.cos(a), py=y+r*Math.sin(a);
        if(i===0 && !cur) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
    },
    arcTo(x1,y1,x2,y2){ ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); },        // упрощение: без скругления
    bezierCurveTo(c1x,c1y,c2x,c2y,x,y){ const s=_last(); if(!s){ ctx.moveTo(x,y); return; }
      for(let i=1;i<=24;i++){ const t=i/24, u=1-t;
        ctx.lineTo(u*u*u*s[0]+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*x, u*u*u*s[1]+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*y); } },
    quadraticCurveTo(cx,cy,x,y){ const s=_last(); if(!s){ ctx.moveTo(x,y); return; }
      for(let i=1;i<=16;i++){ const t=i/16, u=1-t;
        ctx.lineTo(u*u*s[0]+2*u*t*cx+t*t*x, u*u*s[1]+2*u*t*cy+t*t*y); } },
    rect(x,y,w,h){ const q=rectPoly(x,y,w,h); subs.push({p:q, closed:true}); cur=null; pend=[q[0],q[1]]; },
    ellipse(){},
    clip(){},                                                            // не используется страницей
    /* --- рисование --- */
    stroke(){ covClear(); covStroke(); paintShadow(); paint(st.strokeStyle, false); covClear(); },
    fill(){ covClear(); covFill(); paintShadow(); paint(st.fillStyle, false); covClear(); },
    fillRect(x,y,w,h){ if(!(w && h)) return; covClear(); covPolys([rectPoly(x,y,w,h)]); paintShadow(); paint(st.fillStyle, false); covClear(); },
    strokeRect(x,y,w,h){ const o=subs, oc=cur; subs=[{p:rectPoly(x,y,w,h), closed:true}]; cur=null;
      covClear(); covStroke(); paintShadow(); paint(st.strokeStyle, false); covClear(); subs=o; cur=oc; },
    clearRect(x,y,w,h){ sync(); if(!(w && h)) return; covClear(); covPolys([rectPoly(x,y,w,h)]); paint('#000', true); covClear(); },
    /* --- градиенты и текст --- */
    createLinearGradient(x0,y0,x1,y1){ return makeGradient(x0,y0,x1,y1); },
    createRadialGradient(x0,y0,r0,x1,y1){ return makeGradient(x0,y0,x1,y1); },   // упрощение: линейный
    createPattern(){ return null; },
    measureText(s){ return {width: (s==null? 0 : String(s).length)*6}; },        // текст не растеризуем
    fillText(){}, strokeText(){},
    setLineDash(a){ st.lineDash = Array.isArray(a)? a.filter(v=>isFinite(v) && v>=0) : []; },
    getLineDash(){ return st.lineDash.slice(); },
    /* --- пиксели --- */
    getImageData(x,y,w,h){ x=x|0; y=y|0; w=Math.max(0,w|0); h=Math.max(0,h|0);
      const d=new Uint8ClampedArray(w*h*4);
      for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const sx=x+i, sy=y+j, o=4*(j*w+i);
        if(sx<0||sy<0||sx>=W||sy>=H) continue; const k=4*(sy*W+sx), a=buf[k+3];
        d[o]=a>0? buf[k]/a*255 : 0; d[o+1]=a>0? buf[k+1]/a*255 : 0; d[o+2]=a>0? buf[k+2]/a*255 : 0; d[o+3]=a*255; }
      return {width:w, height:h, data:d}; },
    putImageData(img,dx,dy){ const w=img.width, h=img.height, s=img.data;
      for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const x=(dx|0)+i, y=(dy|0)+j; if(x<0||y<0||x>=W||y>=H) continue;
        const o=4*(j*w+i), k=4*(y*W+x), a=s[o+3]/255; buf[k]=s[o]/255*a; buf[k+1]=s[o+1]/255*a; buf[k+2]=s[o+2]/255*a; buf[k+3]=a; } },
    drawImage(src,dx,dy,dw,dh){                                             // только источник {width,height,data} (ближайший сосед)
      if(!src || !src.data || !src.width) return;
      dx=dx||0; dy=dy||0; dw=dw||src.width; dh=dh||src.height;
      for(let j=0;j<dh;j++) for(let i=0;i<dw;i++){ const x=TX(dx+i, dy+j)|0, y=TY(dx+i, dy+j)|0; if(x<0||y<0||x>=W||y>=H) continue;
        const o=4*((Math.min(src.height-1, (j*src.height/dh)|0))*src.width + Math.min(src.width-1, (i*src.width/dw)|0)), k=4*(y*W+x), a=src.data[o+3]/255;
        buf[k]=src.data[o]/255*a; buf[k+1]=src.data[o+1]/255*a; buf[k+2]=src.data[o+2]/255*a; buf[k+3]=a; } },
    /* --- служебное для стенда --- */
    __sync: sync,
    __resize: resize,
    __pixels(){ sync(); const d=new Uint8ClampedArray(W*H*4);
      for(let i=0;i<W*H;i++){ const k=4*i, a=buf[k+3];
        d[k]=a>0? buf[k]/a*255 : 0; d[k+1]=a>0? buf[k+1]/a*255 : 0; d[k+2]=a>0? buf[k+2]/a*255 : 0; d[k+3]=a*255; }
      return {width:W, height:H, data:d}; },
  };
  // свойства состояния — настоящие геттеры/сеттеры (dctx.lineWidth=5 пишет в текущее состояние)
  for(const k of ['lineWidth','lineCap','lineJoin','miterLimit','strokeStyle','fillStyle','globalAlpha',
                  'globalCompositeOperation','lineDashOffset','shadowColor','shadowBlur','shadowOffsetX',
                  'shadowOffsetY','filter','font','textAlign','textBaseline','imageSmoothingEnabled']){
    Object.defineProperty(ctx, k, { get:()=>st[k], set:(v)=>{ st[k]=v; }, enumerable:true, configurable:true });
  }
  ctx.canvas = el || {width:W, height:H};
  return ctx;
}

module.exports = { makeCanvas, parseColor };
