// 5.0: проверка rmoves.js — планарность после каждого хода, серии случайных R3, полное упрощение; PD → out/ann/rm_*.json для Regina
const fs=require('fs'); const {Link}=require('./rmoves.js').RMoves;
let sd=+(process.env.RM_SEED||7); const rnd=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; };
const names=(process.env.RM_NAMES||'monster,kl_m3_2_4_3,kl_m4_3_5_4,kl_m7_6_8_7,u2a_ochiai16,gst,gordian').split(',');
const out={};
for(const nm of names){ const f=fs.existsSync('out/hard/'+nm+'.json')? 'out/hard/'+nm+'.json' : 'out/hard/pd_'+nm+'.json'; const J=JSON.parse(fs.readFileSync(f,'utf8')); const pd=J.pd;
  const L=new Link(pd); const rec={n:L.size(), valid:L.valid(), faces:L.faces().length, comps:L.components(), r3:[], simp:null};
  // серия случайных R3 с проверкой планарности
  const M=L.clone(); let bad=0, done=0;
  for(let k=0;k<40;k++){ const F=M.faces().filter(x=>x.length===3 && M.r3ok(x)>=0); if(!F.length) break; M.r3(F[Math.floor(rnd()*F.length)]); done++; if(!M.valid()){ bad++; break; } }
  rec.r3={moves:done, invalid:bad, pdAfter:(bad? null : M.toPD())};
  // упрощение
  const S=L.clone(); const t0=Date.now(); const r=S.simplify({r3Budget:+(process.env.RM_BUDGET||1500), rnd}); rec.simp={from:L.size(), to:r.best.size(), r3moves:r.r3moves, valid:r.best.valid(), ms:Date.now()-t0, pd:r.best.size()? r.best.toPD() : []};
  out[nm]=rec; console.error(nm, 'n', rec.n, 'valid', rec.valid, 'faces', rec.faces, 'comps', rec.comps, '| R3 x'+done, 'invalid', bad, '| simplify', rec.simp.from, '→', rec.simp.to, 'r3moves', rec.simp.r3moves, rec.simp.ms+'ms'); }
fs.writeFileSync('out/ann/rm_test.json', JSON.stringify(out));
