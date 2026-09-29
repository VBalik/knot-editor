// Стенд 7.0: PD-код проекции 3D-ломаной вдоль направления d (перенос _mvBasis/_mvProject/_pdFromCross из index5.html 5.3) и
// «сложность формы» simpNC — наименьшее число пересечений после упрощения ходами Рейдемейстера (rmoves.js, оракул Regina)
// по нескольким направлениям проекции: мера, не зависящая от длины нити и числа вершин.
'use strict';
const RMoves = require('./rmoves.js').RMoves;
function basis(d){ const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0]; let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(e1[0],e1[1],e1[2])||1; e1=[e1[0]/l1,e1[1]/l1,e1[2]/l1];
  const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]]; return {e1, e2, e3:d}; }
function pdFromCross(cr){
  const m=cr.length; if(!m) return [];
  const ev=[]; cr.forEach((c,ci)=>{ ev.push({s:c.sA,ci,pass:'A'}); ev.push({s:c.sB,ci,pass:'B'}); }); ev.sort((a,b)=>a.s-b.s);
  const M=ev.length, at=new Map(); ev.forEach((e,k)=>at.set(e.ci+e.pass,k));   // ребро k идёт от события k к k+1, метка k+1
  const pd=[];
  cr.forEach((c,ci)=>{ const o=c.over, u=(o==='A'?'B':'A'), ku=at.get(ci+u), ko=at.get(ci+o);
    const inU=((ku-1+M)%M)+1, outU=ku+1, inO=((ko-1+M)%M)+1, outO=ko+1;
    const du=(u==='A'?c.dirA:c.dirB), dov=(o==='A'?c.dirA:c.dirB); const x=du[0]*dov[1]-du[1]*dov[0];
    pd.push(x<0? [inU,outO,outU,inO] : [inU,inO,outU,outO]); });
  return pd;
}
function project(vs, B){   // vs — [{x,y,z}] или [[x,y,z]]
  const n=vs.length, X=new Float64Array(n), Y=new Float64Array(n), Z=new Float64Array(n); const {e1,e2,e3}=B;
  for(let i=0;i<n;i++){ const v=vs[i], vx=v.x!==undefined? v.x : v[0], vy=v.y!==undefined? v.y : v[1], vz=v.z!==undefined? v.z : v[2];
    X[i]=vx*e1[0]+vy*e1[1]+vz*e1[2]; Y[i]=vx*e2[0]+vy*e2[1]+vz*e2[2]; Z[i]=vx*e3[0]+vy*e3[1]+vz*e3[2]; }
  const cr=[];
  for(let i=0;i<n;i++){ const i2=(i+1)%n, ax=X[i], ay=Y[i], bx=X[i2]-ax, by=Y[i2]-ay;
    for(let j=i+2;j<n;j++){ if(i===0&&j===n-1) continue; const j2=(j+1)%n, cx=X[j], cy=Y[j], dx=X[j2]-cx, dy=Y[j2]-cy, den=bx*dy-by*dx; if(Math.abs(den)<1e-14) continue;
      const t=((cx-ax)*dy-(cy-ay)*dx)/den, u=((cx-ax)*by-(cy-ay)*bx)/den; if(!(t>1e-9&&t<1-1e-9&&u>1e-9&&u<1-1e-9)) continue;
      const zi=Z[i]+(Z[i2]-Z[i])*t, zj=Z[j]+(Z[j2]-Z[j])*u; if(Math.abs(zi-zj)<1e-12) return null;
      cr.push({sA:i+t, sB:j+u, over: zi>zj?'A':'B', x:ax+bx*t, y:ay+by*t, dirA:[bx,by], dirB:[dx,dy]}); } }
  return {cr, pd:pdFromCross(cr), n:cr.length};
}
function simpNC(vs, dirs, r3Budget){   // наименьшее число пересечений после simplify по dirs (по умолчанию 8) направлениям; null — ни одна проекция не годится
  let best=Infinity, sd=11, raw=Infinity; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x80000000; };
  for(let t=0;t<(dirs||8);t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
    const P=project(vs, basis(d)); if(!P) continue; raw=Math.min(raw, P.n); if(P.n===0){ best=0; continue; }
    let L; try{ L=new RMoves.Link(P.pd); if(!L.valid()) continue; }catch(e){ continue; }
    const r=L.clone().simplify({r3Budget:r3Budget||300, rnd}); best=Math.min(best, r.best.size()); }
  return {simp: isFinite(best)? best : null, raw: isFinite(raw)? raw : null};
}
module.exports={basis, project, pdFromCross, simpNC, RMoves};
