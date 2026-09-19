// 4.11: сводка прогона unknot.js по шардам: json законченных шардов + строки *_partial.log (шард, снятый на середине).
// Запуск: node unknot_merge.js [папка]   (по умолчанию out/unknot/run200/)
const fs=require('fs'), dir=(process.argv[2]||'out/unknot/run200/').replace(/\/?$/,'/');
const rows=[];
for(const f of fs.readdirSync(dir)){
  if(/^shard\d+\.json$/.test(f)){ const t=fs.readFileSync(dir+f,'utf8'); if(!t.trim()) continue;
    for(const r of JSON.parse(t).rows) rows.push({src:f, nc:r.nc, N:r.N, ok:r.ok, stir:r.stir, sec:r.sec}); }
  if(/_partial\.log$/.test(f)) for(const l of fs.readFileSync(dir+f,'utf8').split('\n')){
    const m=/^(\d+) nc (\d+) N (\d+) (CIRCLE at try (\d+)|no \(.*\)) ([\d.]+)s/.exec(l); if(!m) continue;
    rows.push({src:f, nc:+m[2], N:+m[3], ok:m[4].startsWith('CIRCLE'), stir:m[5]!==undefined? +m[5] : null, sec:+m[6]}); } }
const ok=rows.filter(r=>r.ok).length, n=rows.length;
const avg=(k)=>+(rows.reduce((s,r)=>s+(r[k]||0),0)/n).toFixed(1);
const stirHist={}; for(const r of rows) stirHist[r.stir]=(stirHist[r.stir]||0)+1;
const secs=rows.map(r=>r.sec).sort((a,b)=>a-b);
console.log(JSON.stringify({n, ok, pct:+(100*ok/n).toFixed(1), ncMin:Math.min(...rows.map(r=>r.nc)), ncAvg:avg('nc'), ncMax:Math.max(...rows.map(r=>r.nc)),
  NAvg:Math.round(avg('N')), stirHist, physicsOnly:stirHist[0]||0, secMedian:secs[secs.length>>1], secMax:secs[secs.length-1], secAvg:avg('sec'),
  cpuMin:+(rows.reduce((s,r)=>s+r.sec,0)/60).toFixed(0)}, null, 0));
