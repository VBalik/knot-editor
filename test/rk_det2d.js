const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  if(!r.smooth){ console.log('нет smooth'); continue; }
  const V=r.smooth.map(p=>[p[0],p[1],0]); const N=V.length;
  // пересечения плоской ломаной; проход берём из диаграммы редактора по ближайшему пересечению
  const cr=[]; const X=V.map(p=>p[0]), Y=V.map(p=>p[1]);
  for(let i=0;i<N;i++){ const i1=(i+1)%N; const ax=X[i],ay=Y[i],rx=X[i1]-ax,ry=Y[i1]-ay;
    for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const j1=(j+1)%N; const cx=X[j],cy=Y[j],qx=X[j1]-cx,qy=Y[j1]-cy; const den=rx*qy-ry*qx; if(Math.abs(den)<1e-12) continue;
      const s=((cx-ax)*qy-(cy-ay)*qx)/den, t=((cx-ax)*ry-(cy-ay)*rx)/den; if(s<=1e-9||s>=1-1e-9||t<=1e-9||t>=1-1e-9) continue;
      const px=ax+s*rx, py=ay+s*ry; let bi=-1,bd=1e9; r.crossings.forEach((c,k)=>{ const d=Math.hypot(c.x-px,c.y-py); if(d<bd){bd=d;bi=k;} });
      const c=r.crossings[bi]; const aOver = c.over==='A';   // A = прядь с меньшим параметром (i)
      cr.push({pi:i+s, pj:j+t, aOver, matchDist:bd}); } }
  const maxMatch=Math.max(...cr.map(c=>c.matchDist));
  const list=cr.map(c=> c.aOver? [c.pi,c.pj] : [c.pj,c.pi]);
  const dA=detFromCrossings(list).toString();
  const listB=cr.map(c=> !c.aOver? [c.pi,c.pj] : [c.pj,c.pi]); const dB=detFromCrossings(listB).toString();
  const lz=detFromCrossings(crossings(r.lift,[1e-3,2e-3,1])).toString();
  console.log(`i=${r.i} nc=${r.nc} (найдено ${cr.length}, макс. расстояние сопоставления ${maxMatch.toFixed(1)}px) det2d(редактор)=${r.det2d}  мой det диаграммы: A-over=${dA}, B-over=${dB}  liftZ=${lz}`); }
