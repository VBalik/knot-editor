const fs=require('fs'); const src=fs.readFileSync('rk_gaps.js','utf8').split('const out=[];')[0].replace("const fs=require('fs'), path=require('path'); const DIR=process.argv[2];",""); eval(src);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  for(const s of r.stages){ if(!['lift','proj1'].includes(s.tag)) continue; const V=s.verts, N=V.length; const pairs=[];
    for(let i=0;i<N;i++){ for(let j=i+3;j<N;j++){ if(N-(j-i)<=2) continue; const d=segDist(V[i],V[(i+1)%N],V[j],V[(j+1)%N]); pairs.push([d,i,j]); } }
    pairs.sort((a,b)=>a[0]-b[0]);
    const lens=V.map((v,k)=>Math.hypot(V[(k+1)%N][0]-v[0],V[(k+1)%N][1]-v[1],V[(k+1)%N][2]-v[2]));
    const cd=(i,j)=>Math.min(Math.abs(i-j),N-Math.abs(i-j));
    console.log(`i=${r.i} ${s.tag}: L0=${r.L0.toFixed(4)} min edge/L0=${(Math.min(...lens)/r.L0).toFixed(3)} max edge/L0=${(Math.max(...lens)/r.L0).toFixed(3)}; 5 самых тесных пар (gap/D, i, j, cd, edges i..i+1 & j..j+1 /L0):`);
    for(const [d,i,j] of pairs.slice(0,5)) console.log(`     ${(d/(1.6*r.L0)).toFixed(5)}  i=${i} j=${j} cd=${cd(i,j)}  e_i=${(lens[i]/r.L0).toFixed(2)} e_j=${(lens[j]/r.L0).toFixed(2)}`); } }
