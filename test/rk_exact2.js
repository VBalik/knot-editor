// точный det для пар (после фазы допустимости, финал) ОДНОГО прогона (rk2)
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
const DIR=process.argv[2], W=+(process.env.WORKER||0), NW=+(process.env.WORKERS||1); const res=[];
for(const f of fs.readdirSync(DIR)){ if(!/^rk_w\d\.verts\.jsonl$/.test(f)) continue;
  for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l); if(r.i%NW!==W) continue;
    res.push({i:r.i, feas:robust(r.feas,5,500+r.i), final:robust(r.verts,5,600+r.i)}); } }
fs.writeFileSync(path.join(DIR,'exact2_w'+W+'.json'), JSON.stringify(res));
