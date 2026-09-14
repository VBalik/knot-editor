(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let seed=+(process.env.SEED||4242); const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  Math.random=rnd;
  // closeness = (|mid_i-mid_j| - R)/L0 по тесным парам: <0 видима; max — насколько близко к пропуску
  const scan=()=>{ const n=N, D=thickDNominal(), gT=0.05*D, R=gT+1.2*L0, R2=R*R;
    const P=i=>verts[i]; const mid=i=>{const a=P(i),b=P((i+1)%n); return [(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2];};
    let tight=0, missed=0, maxClose=-Infinity, worst=null, emax=0;
    for(let i=0;i<n;i++){ const mi=mid(i), li=P(i).distanceTo(P((i+1)%n)); if(li>emax) emax=li;
      for(let j=i+3;j<n;j++){ if(i===0&&j===n-1) continue; if(n-(j-i)<=2) continue;
        const d=_closestSeg(P(i),P((i+1)%n),P(j),P((j+1)%n)).dist;
        if(d<gT){ tight++; const lj=P(j).distanceTo(P((j+1)%n)); const mj=mid(j);
          const dm=Math.hypot(mj[0]-mi[0],mj[1]-mi[1],mj[2]-mi[2]); const c=(dm-R)/L0;
          if(c>maxClose){ maxClose=c; worst={i,j,d_gT:+(d/gT).toFixed(3), li:+(li/L0).toFixed(3), lj:+(lj/L0).toFixed(3), mid_L0:+(dm/L0).toFixed(3), R_L0:+(R/L0).toFixed(3)}; }
          if(dm*dm>R2) missed++; } } }
    return {tight, missed, maxClose, worst, emax_L0:emax/L0}; };
  const orig=unstickLift; let calls=[];
  unstickLift=function(m){ calls.push(scan()); const p=orig(m); calls.push(scan()); return p; };
  const out=[];
  const run=(label)=>{ calls=[]; const lift=scan(); if(!H.running()) H.play(); const d=H.dbg();
    const all=[lift,...calls]; let w=null; for(const c of all) if(c.worst && (!w || c.maxClose>w.maxClose)) w={maxClose:c.maxClose, ...c.worst};
    out.push({label, N:d.N, nc:d.crossings.length, ts:+_thickScale.toFixed(3), gT_L0:+(0.05*thickDNominal()/L0).toFixed(4), scans:all.length, tightScans:all.filter(c=>c.tight>0).length,
      missedAny:all.filter(c=>c.missed>0).length, emax:+Math.max(...all.map(c=>c.emax_L0)).toFixed(3), worst:w?{...w, maxClose:+w.maxClose.toFixed(3)}:null});
    if(H.running()) H.play(); };
  for(const target of [100,120,120,120]) { randomKnot(target); run('rand'+target); }
  return out; })()
