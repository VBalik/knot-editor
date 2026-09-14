// Проверка утверждения о «скрытых» парах (mid-distance > R=D+1.5L0):
// 1) инвариант надувания: inflate<1 ⇒ G ≤ 0.85·D
// 2) номинал: шаги с 2·mvT > D+0.5·L0 (формальная дыра сертификата)
// 3) реальная дыра: 2·mvT > min зазора скрытых пар
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out=[];
  const hiddenGap=()=>{ const n=N, D=thickD(), R=D+1.5*L0, R2=R*R; let m=Infinity, mAll=Infinity;
    const mx=[],my=[],mz=[]; for(let i=0;i<n;i++){ const ip=(i+1)%n; mx[i]=(verts[i].x+verts[ip].x)/2; my[i]=(verts[i].y+verts[ip].y)/2; mz[i]=(verts[i].z+verts[ip].z)/2; }
    for(let i=0;i<n;i++){ const ip=(i+1)%n; for(let j=i+1;j<n;j++){ const jp=(j+1)%n; const cd=Math.min(j-i,n-(j-i)); if(cd<=2) continue;
      const dx=mx[j]-mx[i], dy=my[j]-my[i], dz=mz[j]-mz[i]; const d=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(d<mAll) mAll=d;
      if(dx*dx+dy*dy+dz*dz>R2){ if(d<m) m=d; } } }
    return {hid:m, all:mAll}; };
  const runOne=(label, setup, steps)=>{ setup(); if(!H.running()) H.play(); _thickScale=0.22;
    const rec={label, nc:crossings.length, N, thickScale:+_thickScale.toFixed(3), DnomL0:+(thickDNominal()/L0).toFixed(3), steps:0, inflSteps:0, inflInvViol:0, maxG_over_D_infl:0,
      nomSteps:0, nomGgtDhalf:0, formalHole:0, realHole:0, worst2mv_over_hidden:0, worstMv_over_all:0, maxMvL0:0, samples:[]};
    for(let s=0;s<steps && running;s++){
      const D=thickD(), infl=_inflate, G=energyGrad(false).gmin, hg=hiddenGap();
      const px=verts.map(v=>v.x), py=verts.map(v=>v.y), pz=verts.map(v=>v.z);
      relaxStep(); rec.steps++;
      let sx=0,sy=0,sz=0; for(let i=0;i<N;i++){ sx+=verts[i].x-px[i]; sy+=verts[i].y-py[i]; sz+=verts[i].z-pz[i]; } sx/=N; sy/=N; sz/=N;
      let mv=0; for(let i=0;i<N;i++){ const dx=verts[i].x-px[i]-sx, dy=verts[i].y-py[i]-sy, dz=verts[i].z-pz[i]-sz; const m=dx*dx+dy*dy+dz*dz; if(m>mv) mv=m; } mv=Math.sqrt(mv);
      if(mv/L0>rec.maxMvL0) rec.maxMvL0=+(mv/L0).toFixed(3);
      if(infl<1){ rec.inflSteps++; const r=G/D; if(r>rec.maxG_over_D_infl) rec.maxG_over_D_infl=+r.toFixed(3); if(G>0.85*D*(1+1e-9)) rec.inflInvViol++; }
      else { rec.nomSteps++; if(G>D+0.5*L0) rec.nomGgtDhalf++; if(2*mv>D+0.5*L0) rec.formalHole++; }
      if(isFinite(hg.hid)){ const r=2*mv/hg.hid; if(r>rec.worst2mv_over_hidden){ rec.worst2mv_over_hidden=+r.toFixed(3); rec.samples.push({s, infl:+infl.toFixed(3), DL0:+(D/L0).toFixed(3), GL0:+(G/L0).toFixed(3), hidL0:+(hg.hid/L0).toFixed(3), allL0:+(hg.all/L0).toFixed(3), mvL0:+(mv/L0).toFixed(3)}); }
        if(2*mv>hg.hid) rec.realHole++; }
      const ra=mv/hg.all; if(ra>rec.worstMv_over_all) rec.worstMv_over_all=+ra.toFixed(3);
    }
    rec.samples=rec.samples.slice(-3); rec.detEnd=_detRobust(5); rec.runDet=_runDet; if(H.running()) H.play(); out.push(rec); };
  for(const k of ['trefoil','figure8']) runOne('preset:'+k, ()=>H.clickPreset(k), 1200);
  for(const t of [8,30,60]) runOne('rand:'+t, ()=>randomKnot(t), 1500);
  return out; })()
