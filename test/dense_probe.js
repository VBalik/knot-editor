// Плотные случайные узлы: точные зазоры лифта (cd>=3 и cd=2), пары <1e-4·L0,
// ведёт ли себя старт (unstick break / замерзание), принятые шаги.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  let seed=777; Math.random=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  const V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
  const snap=()=>verts.map(v=>[v.x,v.y,v.z]);
  function gaps(P){ const n=P.length; let g3=Infinity,g2=Infinity,tiny=0,tinyList=[];
    for(let i=0;i<n;i++) for(let j=i+2;j<n;j++){ if(i===0&&j===n-1) continue; const cd=Math.min(j-i,n-(j-i));
      const d=_closestSeg(V3(P[i]),V3(P[(i+1)%n]),V3(P[j]),V3(P[(j+1)%n])).dist;
      if(cd===2){ if(d<g2) g2=d; continue; } if(d<g3) g3=d; if(d<1e-4*L0){ tiny++; if(tinyList.length<3) tinyList.push([i,j,+(d/L0).toExponential(2), +(Math.abs(P[i][2]-P[j][2])/L0).toFixed(3)]); } }
    return {g3:+(g3/L0).toExponential(3), g2:+(g2/L0).toFixed(3), tiny, tinyList}; }
  const out=[];
  for(const target of [90,120,160]) for(let s=0;s<3;s++){
    randomKnot(target); const nc=crossings.length; const P=snap(); const gl=gaps(P);
    const rec={target, nc, N, D:+(thickDNominal()/L0).toFixed(3), lift:gl, det:_detRobust(3)};
    const t0=Date.now(); if(!H.running()) H.play(); rec.startMs=Date.now()-t0;
    rec.afterStart=gaps(snap()); rec.inflate0=+_inflate.toExponential(2); rec.unstick=_dbgUnstick; rec.detStart=_detRobust(3);
    let acc=0; for(let k=0;k<300 && running;k++){ relaxStep(); if(_dbgTier>=0) acc++; }
    rec.acc300=acc; rec.inflate300=+_inflate.toFixed(4); rec.gmin300=+(_dbgGmin/L0).toExponential(2); rec.status=document.getElementById('status').textContent.slice(0,60);
    if(H.running()) H.play(); out.push(rec);
  }
  return out;
})()
