(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // 1. status overwrite in startPhysics when lift det != diagram det
  H.clickPreset('trefoil');
  { const n=N; const arr=[]; for(let i=0;i<n;i++){ const a=i/n*2*Math.PI; arr.push([2*Math.cos(a),2*Math.sin(a),0]); }
    window.__knotSetVertsRaw(arr); }
  { const statuses=[]; const orig=setStatus; // capture all setStatus calls during startPhysics
    const el=document.getElementById('status'); let log=[]; 
    const desc=Object.getOwnPropertyDescriptor(el,'textContent');
    Object.defineProperty(el,'textContent',{get(){return this._t||'';}, set(v){ this._t=v; log.push(v); }, configurable:true});
    H.play(); out.statusLogOnPlay=log.slice(); out.runDetAfterPlay=H.dbg().runDet; out.knotDet=H.dbg().knotDet;
    H.play(); Object.defineProperty(el,'textContent',{value:el._t, writable:true, configurable:true}); }
  // 2. anchors at vertices: for each crossing, nearest vertex distance to crossing world point, for random knots
  const chk=(label)=>{ const rows=[]; let worst=0, missing=0;
    for(const c of crossings){ const wx=(c.x-worldCx)*worldScale, wy=-(c.y-worldCy)*worldScale;
      // centre shift: verts were recentered → compare via pairs of verts sharing xy instead
      let cnt=0; for(let i=0;i<N;i++){ for(let j=i+1;j<N;j++){ if(Math.hypot(verts[i].x-verts[j].x, verts[i].y-verts[j].y)<1e-6*L0 && Math.min(j-i,N-(j-i))>2) cnt++; } }
      rows.push(cnt); break; }
    // count coincident-xy vertex pairs overall vs number of crossings
    let pairs=0; for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){ if(Math.min(j-i,N-(j-i))>2 && Math.hypot(verts[i].x-verts[j].x, verts[i].y-verts[j].y)<1e-6*L0) pairs++; }
    return {label, crossings:crossings.length, coincidentXYpairs:pairs, N, detZproj:_detProj(0), detRobust:_detRobust(5), knotDet}; };
  out.liftChecks=[];
  for(const t of [10,40,90]){ randomKnot(t); out.liftChecks.push(chk('rand'+t)); }
  // 3. float computeDeterminant vs BigInt exact for big diagrams
  function exactDet(){ const n=crossings.length; if(n===0) return 1n;
    const unders=[]; crossings.forEach((c,ci)=>unders.push({s:(c.over==='A'?c.sB:c.sA),ci})); unders.sort((a,b)=>a.s-b.s);
    const arcOf=(s)=>{ let k=-1; for(let i=0;i<n;i++) if(unders[i].s<=s) k=i; return k===-1?n-1:k; };
    const M=Array.from({length:n},()=>new Array(n).fill(0n));
    crossings.forEach((c,ci)=>{ const sO=(c.over==='A'?c.sA:c.sB); let ku=-1; for(let i=0;i<n;i++) if(unders[i].ci===ci){ku=i;break;}
      M[ci][(ku-1+n)%n]+=1n; M[ci][ku]+=1n; M[ci][arcOf(sO)]-=2n; });
    const q=n-1, A=M.slice(0,q).map(r=>r.slice(0,q)); let prev=1n, sign=1n;
    for(let k=0;k<q-1;k++){ if(A[k][k]===0n){ let sw=-1; for(let r=k+1;r<q;r++) if(A[r][k]!==0n){sw=r;break;} if(sw<0) return 0n; const t=A[k];A[k]=A[sw];A[sw]=t; sign=-sign; }
      for(let i=k+1;i<q;i++) for(let j=k+1;j<q;j++) A[i][j]=(A[i][j]*A[k][k]-A[i][k]*A[k][j])/prev; prev=A[k][k]; }
    let d=q>0? sign*A[q-1][q-1]:1n; return d<0n?-d:d; }
  out.detFloatVsExact=[];
  for(let r=0;r<6;r++){ randomKnot(110); const ex=exactDet(); out.detFloatVsExact.push({nc:crossings.length, floatDet:knotDet, exact:ex.toString(), match: BigInt(knotDet)===ex, isUnknotFlag:isUnknot}); }
  // 4. LCG low-bit behaviour used in randomKnot
  { let seed=(Math.floor(Math.random()*2147483647))|1; const s0=seed; const low=new Set(); const vals=[];
    for(let i=0;i<2000;i++){ seed=(seed*1103515245+12345)&0x7fffffff; low.add(seed&0xff); vals.push(seed); }
    out.lcg={distinctLow8bits:low.size, sampleSeeds:vals.slice(0,5), distinctOf2000:new Set(vals).size}; }
  // 5. fitToCanvas fallback with hidden canvas
  { const cv=document.getElementById('draw'); const w=cv.clientWidth,h=cv.clientHeight,W=cv.width,Hh=cv.height;
    cv.clientWidth=0; cv.clientHeight=0; cv.width=1; cv.height=1;
    randomKnot(20); out.hiddenCanvas={crossings:crossings.length, closedCurve, status:document.getElementById('status').textContent.slice(0,60)};
    cv.clientWidth=w; cv.clientHeight=h; cv.width=W; cv.height=Hh; }
  return out; })()
