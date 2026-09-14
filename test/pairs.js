// распределение пар отталкивания: сколько проходят предфильтр, сколько реально дают энергию, как далеко они от ядра
(async ()=>{ const H=global.__H; window.__noAutoSave=true; let out={};
  H.el('clear').onclick(); H.setSlider('thick',5); H.setSlider('repCoef',2); H.setSlider('bendCoef',9);
  let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); H.set({ms:1}); H.play(); H.step(800);
  const n=N, S=sExcl(), DC=4*S, R=S+DC+1.5*L0, R2=R*R;
  let all=0, pre=0, arc=0, contrib=0, near=0, mid=0, far=0, sqrtOnly=0;
  const mx=new Float64Array(n), my=new Float64Array(n), mz=new Float64Array(n);
  for(let i=0;i<n;i++){ const ip=(i+1)%n; mx[i]=(verts[i].x+verts[ip].x)/2; my[i]=(verts[i].y+verts[ip].y)/2; mz[i]=(verts[i].z+verts[ip].z)/2; }
  for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n; const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue; all++;
    const d2=(mx[j]-mx[i])**2+(my[j]-my[i])**2+(mz[j]-mz[i])**2; if(d2>R2) continue; pre++;
    const r=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]); const x=r.dist;
    const wArg=(cd*L0/(2*Math.max(x,1e-12))-1)/0.15; if(wArg<=0) continue; arc++;
    const dl=x-S; if(dl>=DC) continue; contrib++;
    if(dl<0.5*S) near++; else if(dl<2*S) mid++; else far++; } }
  out={N:n, s_L0:+(S/L0).toFixed(2), R_L0:+(R/L0).toFixed(2), pairsAll:all, passPrefilter:pre, passArc:arc, contribute:contrib, byGap:{'Δ<0.5s':near,'0.5s..2s':mid,'2s..4s':far}, msPerStep:null};
  const t0=performance.now(); H.step(200); out.msPerStep=+((performance.now()-t0)/200).toFixed(2);
  if(H.running()) H.play(); return out; })()
