const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  const z=s=>{ try{ return detFromCrossings(crossings(r[s],[1e-3,2e-3,1])).toString(); }catch(e){ return 'ERR '+e.message; } };
  console.log(`${r.i}: nc=${r.nc} N=${r.N} det2d(editor)=${r.det2d} runDet(editor)=${r.runDet} det3dEditorFinal=${r.det3dEditor} | мой: liftZ=${z('lift')} lift=${JSON.stringify(robust(r.lift,7,1).vals)} feas=${robust(r.feas,7,2).mode} final=${robust(r.final,7,3).mode}`); }
