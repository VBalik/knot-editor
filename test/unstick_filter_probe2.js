(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let seed=+(process.env.SEED||987654); const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  Math.random=rnd;
  // margin = (li+lj)/2 - (1.2 L0 + gT - d): >0 необходимо для пропуска фильтром; missed = факт пропуска
  const scan=()=>{ const n=N, D=thickDNominal(), gT=0.05*D, R=gT+1.2*L0, R2=R*R;
    const P=i=>verts[i]; const mid=i=>{const a=P(i),b=P((i+1)%n); return [(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2];};
    let tight=0, missed=0, maxMargin=-Infinity, emax=0, minD=Infinity;
    for(let i=0;i<n;i++){ const mi=mid(i), li=P(i).distanceTo(P((i+1)%n)); if(li>emax) emax=li;
      for(let j=i+3;j<n;j++){ if(i===0&&j===n-1) continue; if(n-(j-i)<=2) continue;
        const d=_closestSeg(P(i),P((i+1)%n),P(j),P((j+1)%n)).dist; if(d<minD) minD=d;
        if(d<gT){ tight++; const lj=P(j).distanceTo(P((j+1)%n)); const mj=mid(j);
          const dm2=(mj[0]-mi[0])**2+(mj[1]-mi[1])**2+(mj[2]-mi[2])**2;
          const mg=((li+lj)/2-(1.2*L0+gT-d))/L0; if(mg>maxMargin) maxMargin=mg;
          if(dm2>R2) missed++; } } }
    return {tight, missed, maxMargin, emax_L0:emax/L0, minD_gT:minD/gT}; };
  const orig=unstickLift; let calls=[];
  unstickLift=function(m){ calls.push(scan()); const p=orig(m); calls.push(scan()); return p; };
  const out=[];
  const run=(label)=>{ calls=[]; const lift=scan(); if(!H.running()) H.play(); const d=H.dbg();
    const all=[lift,...calls];
    out.push({label, N:d.N, nc:d.crossings.length, scans:all.length, tightAny:all.filter(c=>c.tight>0).length,
      missedAny:all.filter(c=>c.missed>0).length, maxMargin:+Math.max(...all.map(c=>c.maxMargin)).toFixed(3),
      emax:+Math.max(...all.map(c=>c.emax_L0)).toFixed(3), minD_gT:+Math.min(...all.map(c=>c.minD_gT)).toFixed(3), infl0:+window.__knotTrace().inflate.toFixed(3)});
    if(H.running()) H.play(); };
  const mode=process.env.MODE||'rand';
  if(mode==='rand'){ for(const target of [20,40,60,80,100,120]) for(let s=0;s<3;s++){ randomKnot(target); run('rand'+target+'#'+s); } }
  else { window.__knotSet({smooth:+(process.env.SMOOTH||12)});
    for(let k=0;k<12;k++){ document.getElementById('clear').onclick();
      const rot=rnd()*6.283, cs=Math.cos(rot), sn=Math.sin(rot); const q=2+Math.floor(rnd()*4), p=1.0+rnd()*1.2;
      const f1=rnd()*6.283, f2=rnd()*6.283, f3=rnd()*6.283; const w3=0.15+0.45*rnd(), q3=3+Math.floor(rnd()*5); const w4=0.1+0.35*rnd(), q4=5+Math.floor(rnd()*5);
      H.drawCurve((t)=>{ const a=t*2*Math.PI;
        const x0=Math.sin(a)+p*Math.sin(q*a+f1)+w3*Math.sin(q3*a+f3)+w4*Math.sin(q4*a+f1*0.6);
        const y0=Math.cos(a)-p*Math.cos(q*a+f2)+w3*Math.cos(q3*a+f3*0.7)+w4*Math.cos(q4*a+f2*1.3);
        return {x:400+95*(cs*x0-sn*y0), y:300+95*(sn*x0+cs*y0)}; }, 300);
      run('scribble#'+k); } }
  return out; })()
