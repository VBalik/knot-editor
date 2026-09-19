#!/bin/sh
# 4.11: прогон test/unknot.js в несколько процессов — узлы независимы, ядер обычно 4.
# UK_* передаются как есть; UK_N — сколько узлов НА ПРОЦЕСС, UK_JOBS — сколько процессов.
# Итог: по файлу JSON на процесс в out/unknot/ плюс сводка в stdout.
: "${UK_JOBS:=3}"; : "${UK_N:=1}"; : "${UK_SEED0:=1}"
mkdir -p out/unknot
i=0
while [ "$i" -lt "$UK_JOBS" ]; do
  seed=$(( UK_SEED0 + i * 100003 ))
  UK_SEED0="$seed" node harness.js unknot.js > "out/unknot/shard$i.json" 2> "out/unknot/shard$i.log" &
  i=$(( i + 1 ))
done
wait
node -e '
const fs=require("fs"), d=fs.readdirSync("out/unknot").filter(f=>/^shard\d+\.json$/.test(f));
let rows=[], bad=[];
for(const f of d){ try{ const j=JSON.parse(fs.readFileSync("out/unknot/"+f,"utf8")); rows=rows.concat(j.rows||[]); }catch(e){ bad.push(f); } }
const ok=rows.filter(r=>r.ok).length;
console.log(JSON.stringify({shards:d.length, bad, n:rows.length, ok, pct:+(100*ok/Math.max(1,rows.length)).toFixed(1),
  crossAvg:+(rows.reduce((s,r)=>s+r.cross,0)/Math.max(1,rows.length)).toFixed(1),
  stirAvg:+(rows.reduce((s,r)=>s+r.stir,0)/Math.max(1,rows.length)).toFixed(2),
  secAvg:+(rows.reduce((s,r)=>s+r.sec,0)/Math.max(1,rows.length)).toFixed(1), rows}));
'
