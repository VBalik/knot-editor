// 5.0: ХОДЫ РЕЙДЕМЕЙСТЕРА НА PD-КОДЕ (чистый JS, без страницы; тот же код вставлен в index.html как техника Stir «simplify»).
// Диаграмма — вращательная система: у пересечения 4 конца дуг в порядке против часовой стрелки; позиция 0 — входящая
// нижняя дуга, 2 — выходящая нижняя, 1 и 3 — верхняя прядь (одна входит, другая выходит). Дуга знает свой хвост
// (пересечение, позиция) и голову. Грани — обход «по дуге, затем следующий конец против часовой»; для планарной
// диаграммы граней ровно n+2 (Эйлер: V=n, E=2n). R1 — грань из одной дуги, R2 — двуугольник с одной прядью сверху в
// обоих пересечениях, R3 — треугольник, у которого одна дуга сверху (или снизу) в обоих своих пересечениях.
// Упрощение — как simplify() Regina: R1/R2 до упора, потом случайные R3 и снова R1/R2, пока не кончится терпение.
(function(root){
function Link(pd){   // pd: массив [i,j,k,l] с метками 1..2n (или 0..2n-1) в соглашении KnotTheory
  this.cr=[]; this.arcs=new Map();
  if(!pd) return;
  const n=pd.length; if(!n) return;
  let mn=Infinity; for(const t of pd) for(const x of t) mn=Math.min(mn,x);
  const off=(mn===0)?1:0, M=2*n;
  const P=pd.map(t=>t.map(x=>x+off));
  for(let c=0;c<n;c++){ const [i,j,k,l]=P[c];
    // верхняя прядь: l→j, если j следует за l по ходу (j = l+1 mod 2n), иначе j→l
    const lj=(j===l+1)||(l===M && j===1);
    const d=lj? [1,-1,-1,1] : [1,1,-1,-1];   // 1 — конец входящий (голова дуги), -1 — выходящий (хвост)
    this.cr.push({e:[i,j,k,l], d}); }
  for(let c=0;c<n;c++) for(let p=0;p<4;p++){ const a=this.cr[c].e[p]; let r=this.arcs.get(a); if(!r){ r={t:null,h:null}; this.arcs.set(a,r); }
    if(this.cr[c].d[p]>0) r.h=[c,p]; else r.t=[c,p]; }
  for(const [a,r] of this.arcs) if(!r.t||!r.h) throw new Error('bad PD: arc '+a+' has no tail or head');
}
Link.prototype.clone=function(){ const L=new Link(null); L.cr=this.cr.map(c=>({e:c.e.slice(), d:c.d.slice()})); for(const [a,r] of this.arcs) L.arcs.set(a,{t:r.t.slice(), h:r.h.slice()}); return L; };
Link.prototype.size=function(){ return this.cr.length; };
Link.prototype._other=function(c,p){ const a=this.cr[c].e[p], r=this.arcs.get(a); return (r.t[0]===c && r.t[1]===p)? r.h : r.t; };
Link.prototype.faces=function(){   // массив граней; грань — массив концов [c,p] (начало обхода дуги e[p] от c)
  const n=this.cr.length, seen=new Set(), F=[];
  for(let c0=0;c0<n;c0++) for(let p0=0;p0<4;p0++){ const k0=c0*4+p0; if(seen.has(k0)) continue;
    const f=[]; let c=c0, p=p0;
    while(!seen.has(c*4+p)){ seen.add(c*4+p); f.push([c,p]); const o=this._other(c,p); c=o[0]; p=(o[1]+1)%4; }
    F.push(f); }
  return F;
};
Link.prototype.valid=function(){   // планарность + согласованность дуг
  const n=this.cr.length; if(!n) return true;
  for(const [a,r] of this.arcs){ if(this.cr[r.t[0]].e[r.t[1]]!==a || this.cr[r.h[0]].e[r.h[1]]!==a) return false; if(this.cr[r.t[0]].d[r.t[1]]!==-1 || this.cr[r.h[0]].d[r.h[1]]!==1) return false; }
  if(this.arcs.size!==2*n) return false;
  return this.faces().length===n+2;
};
Link.prototype._renumber=function(){   // сжать номера пересечений после удаления (undefined → выбросить)
  const map=new Map(); const cr=[]; this.cr.forEach((c,i)=>{ if(c){ map.set(i,cr.length); cr.push(c); } }); this.cr=cr;
  for(const [a,r] of this.arcs){ r.t[0]=map.get(r.t[0]); r.h[0]=map.get(r.h[0]); }
};
// слить дуги: strand входит в удаляемый участок дугой `inn` и выходит дугой `out` → inn продолжается до головы out
Link.prototype._merge=function(inn,out){
  if(inn===out) return false;                                   // прядь замкнулась сама на себя без пересечений
  const ro=this.arcs.get(out), ri=this.arcs.get(inn); ri.h=ro.h; this.cr[ro.h[0]].e[ro.h[1]]=inn; this.arcs.delete(out); return true;
};
Link.prototype._strandEnds=function(c,p){   // на пересечении c у пряди, проходящей через позицию p: [входящая дуга, выходящая дуга]
  const q=(p+2)%4, cr=this.cr[c]; return cr.d[p]>0? [cr.e[p], cr.e[q]] : [cr.e[q], cr.e[p]];
};
Link.prototype.r1=function(f){   // f — грань из одного конца [c,p]: дуга-петля e[p] возвращается в c
  const [c,p]=f[0], a=this.cr[c].e[p], r=this.arcs.get(a); if(r.t[0]!==c || r.h[0]!==c) return false;
  const pt=r.t[1], ph=r.h[1];                                  // позиции петли на c; две другие — вход и выход пряди
  const rest=[0,1,2,3].filter(x=>x!==pt && x!==ph); const cr=this.cr[c];
  const inn=cr.d[rest[0]]>0? cr.e[rest[0]] : cr.e[rest[1]], out=cr.d[rest[0]]>0? cr.e[rest[1]] : cr.e[rest[0]];
  this.arcs.delete(a); const ok=this._merge(inn,out); if(!ok){ this.arcs.delete(inn); } this.cr[c]=null; this._renumber(); return true;
};
Link.prototype.r2ok=function(f){ if(f.length!==2) return false; const [c1,p1]=f[0], [c2,p2]=f[1]; if(c1===c2) return false;
  const a=this.cr[c1].e[p1], b=this.cr[c2].e[p2]; if(a===b) return false;
  const ra=this.arcs.get(a), rb=this.arcs.get(b);
  const pa2=(ra.t[0]===c1)? ra.h[1] : ra.t[1];               // позиция a на c2
  const pb1=(rb.t[0]===c2)? rb.h[1] : rb.t[1];               // позиция b на c1
  if(!((ra.t[0]===c1&&ra.h[0]===c2)||(ra.h[0]===c1&&ra.t[0]===c2))) return false;
  if(!((rb.t[0]===c1&&rb.h[0]===c2)||(rb.h[0]===c1&&rb.t[0]===c2))) return false;
  return (p1%2)===(pa2%2) && (pb1%2)===(p2%2) && (p1%2)!==(pb1%2); };   // a на одном уровне в обоих, b на другом
Link.prototype.r2=function(f){
  if(!this.r2ok(f)) return false; const [c1,p1]=f[0], [c2,p2]=f[1]; const a=this.cr[c1].e[p1], b=this.cr[c2].e[p2];
  const ra=this.arcs.get(a), rb=this.arcs.get(b);
  const pa2=(ra.t[0]===c1)? ra.h[1] : ra.t[1], pb1=(rb.t[0]===c2)? rb.h[1] : rb.t[1];
  // прядь A: внешние дуги на c1 (позиция p1) и c2 (позиция pa2); прядь B: на c1 (pb1) и c2 (p2)
  const A1=this._strandEnds(c1,p1), A2=this._strandEnds(c2,pa2), B1=this._strandEnds(c1,pb1), B2=this._strandEnds(c2,p2);
  const outer=(E1,E2,x)=>{ const inn=(E1[0]===x)? E2[0] : E1[0], out=(E1[1]===x)? E2[1] : E1[1]; return [inn,out]; };   // вход в участок и выход из него
  const [ai,ao]=outer(A1,A2,a), [bi,bo]=outer(B1,B2,b);
  this.arcs.delete(a); this.arcs.delete(b);
  if(!this._merge(ai,ao)) this.arcs.delete(ai);
  if(!this._merge(bi,bo)) this.arcs.delete(bi);
  this.cr[c1]=null; this.cr[c2]=null; this._renumber(); return true;
};
Link.prototype.r3ok=function(f){ if(f.length!==3) return false; const cs=f.map(x=>x[0]); if(new Set(cs).size!==3) return false;
  for(let k=0;k<3;k++){ const [c,p]=f[k]; const a=this.cr[c].e[p], r=this.arcs.get(a); const o=(r.t[0]===c)? r.h : r.t;
    if((p%2)===(o[1]%2)) return k; }                          // дуга k на одном уровне в обоих концах — её прядь можно сдвинуть
  return -1; };
Link.prototype.r3=function(f){
  const k=this.r3ok(f); if(k===false || k<0) return false;
  // три пряди треугольника: у каждой — две вершины p→q (по ходу пряди), внешний вход x, дуга s, внешний выход y
  const plan=[];
  for(let m=0;m<3;m++){ const [c,p]=f[m]; const s=this.cr[c].e[p], r=this.arcs.get(s); const P=r.t, Q=r.h;   // s: P→Q
    const Ein=this._strandEnds(P[0],P[1]), Eout=this._strandEnds(Q[0],Q[1]);
    plan.push({s, P:P.slice(), Q:Q.slice(), x:Ein[0], y:Eout[1], pin:(this.cr[P[0]].d[P[1]]>0? P[1] : (P[1]+2)%4), pout:P[1]<0?0:(this.cr[P[0]].d[P[1]]>0? (P[1]+2)%4 : P[1]),
      qin:(this.cr[Q[0]].d[Q[1]]>0? Q[1] : (Q[1]+2)%4), qout:(this.cr[Q[0]].d[Q[1]]>0? (Q[1]+2)%4 : Q[1])}); }
  // перекладка: у P вход := s, выход := y; у Q вход := x, выход := s
  for(const t of plan){ const {s,P,Q,x,y}=t; const cP=this.cr[P[0]], cQ=this.cr[Q[0]];
    cP.e[t.pin]=s; cP.e[t.pout]=y; cQ.e[t.qin]=x; cQ.e[t.qout]=s;
    const rs=this.arcs.get(s); rs.t=[Q[0],t.qout]; rs.h=[P[0],t.pin];
    this.arcs.get(x).h=[Q[0],t.qin]; this.arcs.get(y).t=[P[0],t.pout]; }
  return true;
};
Link.prototype.reduce=function(){   // R1/R2 до упора; возвращает число снятых пересечений
  let removed=0, again=true;
  while(again && this.cr.length){ again=false; const F=this.faces();
    for(const f of F){ if(f.length===1){ const n0=this.cr.length; if(this.r1(f)){ removed+=n0-this.cr.length; again=true; break; } }
      if(f.length===2 && this.r2ok(f)){ const n0=this.cr.length; if(this.r2(f)){ removed+=n0-this.cr.length; again=true; break; } } } }
  return removed;
};
Link.prototype.simplify=function(opt){   // как Regina simplify(): R1/R2, затем случайные R3; лучший результат
  opt=opt||{}; const budget=opt.r3Budget||1000; let rnd=opt.rnd||Math.random;
  this.reduce(); let best=this.clone(), stall=0, moves=0;
  while(stall<budget && this.cr.length>2){
    const F=this.faces().filter(f=>f.length===3 && this.r3ok(f)!==false && this.r3ok(f)>=0);
    if(!F.length) break;
    const f=F[Math.floor(rnd()*F.length)]; if(!this.r3(f)) break; moves++;
    if(this.reduce()>0){ stall=0; if(this.cr.length<best.cr.length) best=this.clone(); } else stall++;
  }
  return {best, r3moves:moves};
};
Link.prototype.toPD=function(){   // PD с метками 1..2n по ходу узла (одна компонента)
  const n=this.cr.length; if(!n) return [];
  const label=new Map(); let a0=this.cr[0].e[0], a=a0, k=1;
  for(let guard=0; guard<4*n+4; guard++){ if(label.has(a)) break; label.set(a,k++); const r=this.arcs.get(a); const [c,p]=r.h; a=this.cr[c].e[(p+2)%4]; }
  if(label.size!==2*n) throw new Error('not a single component: '+label.size+' of '+2*n);
  return this.cr.map(c=>c.e.map(x=>label.get(x)));
};
Link.prototype.components=function(){ const n=this.cr.length; if(!n) return 0; const seen=new Set(); let comps=0;
  for(const [a0] of this.arcs){ if(seen.has(a0)) continue; comps++; let a=a0; while(!seen.has(a)){ seen.add(a); const r=this.arcs.get(a); const [c,p]=r.h; a=this.cr[c].e[(p+2)%4]; } }
  return comps; };
root.RMoves={Link};
})(typeof module!=='undefined' && module.exports? module.exports : (typeof window!=='undefined'? window : globalThis));
