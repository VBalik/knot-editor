const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
const DIR=process.argv[2]; const rows=[];
for(const f of fs.readdirSync(DIR)){ if(!/^dump_w\d\.jsonl$/.test(f)) continue; for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  let lz=null; try{ lz=detFromCrossings(crossings(r.lift,[1e-3,2e-3,1])).toString(); }catch(e){}
  const rb=robust(r.lift,5,11+r.i); const fz=robust(r.feas,5,23+r.i);
  rows.push({i:r.i,nc:r.nc,N:r.N,det2d:r.det2d,liftZ:lz,liftMode:rb.mode,liftAgree:rb.agree+'/'+rb.valid,runDet:r.runDet,feasMode:fz.mode,gapFeasD:r.gapFeasD}); } }
rows.sort((a,b)=>a.i-b.i);
const faithful=rows.filter(r=>r.liftZ===String(r.det2d)).length, robustOk=rows.filter(r=>r.liftMode===String(r.det2d)).length, runOk=rows.filter(r=>String(r.runDet)===r.liftMode).length, feasOk=rows.filter(r=>r.feasMode===r.liftMode).length;
console.log(`лифт верен (z-проекция==det2d): ${faithful}/${rows.length}; мода 5 проекций==det2d: ${robustOk}; runDet редактора==лифт: ${runOk}; после старта==лифт: ${feasOk}`);
for(const r of rows) if(r.liftZ!==String(r.det2d) || r.feasMode!==r.liftMode) console.log('  ', JSON.stringify(r));
