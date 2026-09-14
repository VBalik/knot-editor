const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
const gsrc=fs.readFileSync('rk_gaps.js','utf8').split('const out=[];')[0].replace("const fs=require('fs'), path=require('path'); const DIR=process.argv[2];",""); eval(gsrc);
const DIR=process.argv[2], IDS=new Set([18,36,42,61,93,96]);
for(const f of fs.readdirSync(DIR)){ if(!/^dump_w\d\.jsonl$/.test(f)) continue; for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l); if(!IDS.has(r.i)) continue;
  const D=1.6*r.L0; const rl=robust(r.lift,7,1), rf=robust(r.feas,7,2);
  console.log(`i=${r.i} nc=${r.nc} det2d=${r.det2d} runDet=${r.runDet} | lift: mode=${rl.mode} (${rl.agree}/${rl.valid}) vals=${JSON.stringify(rl.vals)} gap/D=${(minGap(r.lift)/D).toFixed(5)} | feas: mode=${rf.mode} (${rf.agree}/${rf.valid}) gap/D=${(minGap(r.feas)/D).toFixed(4)} unstick=${r.unstick}`); } }
