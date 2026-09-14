const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  console.log(`i=${r.i} nc=${r.nc} N=${r.N} det2d=${r.det2d}`);
  let prev=null; for(const s of r.stages){ const rb=robust(s.verts,5,7); console.log(`   ${s.tag.padEnd(8)} gap/D=${s.gapD} lenErr/L0=${s.lenErr} ${s.pushes!==undefined?'pushes='+s.pushes:''} ${s.residual!==undefined?'residual='+s.residual:''} det=${rb.mode} (${rb.agree}/${rb.valid})${prev!==null&&rb.mode!==prev?'  <== СМЕНА':''}`); prev=rb.mode; } }
