// 7.0 (стенд): PD-коды проекций сохранённой 3D-формы для оракула Regina (mspcheck.py). Запуск: node shapepd.js <shape.json> [dirs] > out.json
// Для каждого направления: число пересечений проекции, результат упрощения ходами Рейдемейстера (rmoves.js) и сам PD-код.
'use strict';
const fs=require('fs'); const PP=require('./proj_pd.js');
const f=process.argv[2], K=+(process.argv[3]||8); const S=JSON.parse(fs.readFileSync(f,'utf8')); const vs=S.verts;
let sd=11; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x80000000; };
const out=[];
for(let t=0;t<K;t++){ let d=[rnd()-0.5,rnd()-0.5,rnd()-0.5]; const l=Math.hypot(d[0],d[1],d[2])||1; d=[d[0]/l,d[1]/l,d[2]/l];
  const P=PP.project(vs, PP.basis(d)); if(!P){ out.push({dir:d, degenerate:true}); continue; }
  let simp=null, valid=null, comps=null; try{ const L=new PP.RMoves.Link(P.pd); valid=L.valid(); comps=L.components(); if(valid){ let s2=11; const r2=()=>{ s2=(Math.imul(s2,1103515245)+12345)&0x7fffffff; return s2/0x80000000; }; simp=L.clone().simplify({r3Budget:300, rnd:r2}).best.size(); } }catch(e){ simp='err:'+String(e).slice(0,60); }
  out.push({dir:d.map(x=>+x.toFixed(4)), n:P.n, valid, comps, simp, pd:P.pd}); }
console.log(JSON.stringify({file:f, N:vs.length, dirs:out}));
