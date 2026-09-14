const fs=require('fs'), path=require('path'); const DIR=process.argv[2];
const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0];
eval(src);  // функции crossings/detFromCrossings/robust
for(const f of fs.readdirSync(DIR)){ if(!/^trace_.\.jsonl$/.test(f)) continue;
  for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
    const D=1.6*r.L0; let prev=null; const rows=[];
    for(const s of r.snaps){ const rd=robust(s.verts,3,7); const det=rd.mode; const chg=(prev!==null && det!==prev); rows.push({st:s.st, det, agree:rd.agree, gminD:s.gminL0!=null?+(s.gminL0/1.6).toFixed(2):null, minSegD:s.minSegL0!=null?+(s.minSegL0/1.6).toFixed(2):null, collide:s.collide, tier:s.tier, chg}); prev=det; }
    console.log(`i=${r.i} nc=${r.nc} N=${r.N}: det по шагам:`);
    const changes=rows.filter(x=>x.chg);
    console.log('  старт', rows[0].det, '→ финал', rows[rows.length-1].det, ' смен:', changes.length);
    for(const c of changes){ const k=rows.indexOf(c); const p=rows[k-1]; console.log(`  смена на шагах ${p.st}→${c.st}: det ${p.det}→${c.det}; gmin/D до=${p.gminD} после=${c.gminD}; minSeg/D=${p.minSegD}→${c.minSegD}; collide ${p.collide}→${c.collide}; tier=${c.tier}`); }
    const mg=rows.map(x=>x.minSegD).filter(x=>x!=null); console.log('  minSeg/D по трассе: min', Math.min(...mg), ' collide всего', rows[rows.length-1].collide);
  } }
