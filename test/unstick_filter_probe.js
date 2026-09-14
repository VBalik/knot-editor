(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  // детерминированный PRNG
  let seed=12345; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  Math.random=rnd;
  const scan=(tag)=>{ const n=N, D=thickDNominal(), gT=0.05*D, R=gT+1.2*L0, R2=R*R;
    const P=i=>verts[i]; const mid=i=>{const a=P(i),b=P((i+1)%n); return [(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2];};
    let tight=0, missed=0, necessary=0, minD=Infinity, minVisible=null, emax=0, missList=[];
    for(let i=0;i<n;i++){ const e=P(i).distanceTo(P((i+1)%n)); if(e>emax) emax=e; }
    for(let i=0;i<n;i++){ const mi=mid(i), li=P(i).distanceTo(P((i+1)%n));
      for(let j=i+3;j<n;j++){ if(i===0&&j===n-1) continue; if(n-(j-i)<=2) continue;
        const r=_closestSeg(P(i),P((i+1)%n),P(j),P((j+1)%n)); const d=r.dist;
        if(d<minD){ minD=d; const mj=mid(j); const dm2=(mj[0]-mi[0])**2+(mj[1]-mi[1])**2+(mj[2]-mi[2])**2; minVisible=dm2<=R2; }
        if(d<gT){ tight++; const lj=P(j).distanceTo(P((j+1)%n)); const mj=mid(j);
          const dm2=(mj[0]-mi[0])**2+(mj[1]-mi[1])**2+(mj[2]-mi[2])**2;
          if((li+lj)/2>1.2*L0+gT-d) necessary++;
          if(dm2>R2){ missed++; missList.push({i,j,d_L0:+(d/L0).toFixed(4), li:+(li/L0).toFixed(3), lj:+(lj/L0).toFixed(3), mid_L0:+(Math.sqrt(dm2)/L0).toFixed(3)}); } } } }
    return {tag, tight, necessary, missed, minD_gT:+(minD/gT).toFixed(3), minVisible, emax_L0:+(emax/L0).toFixed(3), missList:missList.slice(0,3)}; };
  const orig=unstickLift; let calls=[]; let callNo=0;
  unstickLift=function(m){ const before=scan('u'+callNo+'pre'); const p=orig(m); const after=scan('u'+callNo+'post'); after.pushes=p; callNo++; calls.push(before, after); return p; };
  const out=[];
  const run=(label)=>{ calls=[]; callNo=0; const lift=scan('lift');
    if(!H.running()) H.play();
    const tr=window.__knotTrace(); const d=H.dbg();
    const agg={label, N:d.N, nc:d.crossings.length, lift, unstickCalls:callNo,
      anyMissedPre:calls.filter(c=>c.tag.endsWith('pre')&&c.missed>0).length,
      anyMissedPost:calls.filter(c=>c.tag.endsWith('post')&&c.missed>0).length,
      anyNecessary:calls.filter(c=>c.necessary>0).length,
      maxEmaxCalls:Math.max(...calls.map(c=>c.emax_L0)),
      lastPost:calls.length?calls[calls.length-1]:null,
      minTightPostAny: Math.min(...calls.filter(c=>c.tag.endsWith('post')).map(c=>c.minD_gT)),
      inflate0:+tr.inflate.toFixed(4), unstickTotal:tr.unstick, gminStart_gT:+(minSegGap()/(0.05*thickDNominal())).toFixed(3),
      missedEver:calls.filter(c=>c.missed>0).map(c=>({tag:c.tag, missed:c.missed, ex:c.missList}))};
    if(H.running()) H.play(); out.push(agg); };
  for(const k of ['trefoil','figure8','cinquefoil','septafoil']){ H.clickPreset(k); run('preset:'+k); }
  for(const target of [8,15,30,45,60]) for(let s=0;s<4;s++){ randomKnot(target); run('rand'+target+'#'+s); }
  return out; })()
