// 5.0: прогон движка ходов на PD из JSON (stdin: [{name, pd}] ) → stdout [{name, n0, nReduce, pdReduce, nSimp, pdSimp, nug}] — для nugtest.py
const {Link}=require('./rmoves.js').RMoves;
const inp=JSON.parse(require('fs').readFileSync(0,'utf8')); const out=[];
let sd=12345; const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x80000000; };
for(const t of inp){ const L=new Link(t.pd); const rec={name:t.name, n0:L.size(), valid:L.valid()};
  const A=L.clone(); let nug=0; { const F=A.faces(); for(const f of F){ const at=new Set(); for(const [c] of f){ if(at.has(c)) nug++; at.add(c); } } } rec.nugFaces=nug;
  const B=L.clone(); const removedByNug=B.nugatory(); rec.nugRemoved=removedByNug; rec.validAfterNug=B.valid(); rec.nAfterNug=B.size(); rec.compsAfterNug=B.components();
  try{ rec.pdNug=B.toPD(); }catch(e){ rec.pdNugErr=e.message; }
  const C=L.clone(); C.reduce(); rec.nReduce=C.size(); rec.validReduce=C.valid(); try{ rec.pdReduce=C.toPD(); }catch(e){ rec.pdReduceErr=e.message; }
  const D=L.clone(); const r=D.simplify({r3Budget:600, rnd}); rec.nSimp=r.best.size(); rec.validSimp=r.best.valid(); try{ rec.pdSimp=r.best.toPD(); }catch(e){ rec.pdSimpErr=e.message; }
  out.push(rec); }
process.stdout.write(JSON.stringify(out));
