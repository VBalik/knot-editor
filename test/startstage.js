(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8')); const RK=global.__RK; const OUT=process.env.OUT; const IDS=process.env.IDS.split(',').map(Number);
  for(const i of IDS){ let seed=(20260903+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/99); let best=null;
    for(let att=0; att<70; att++){ let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K)); const p=0.25+0.15*rnd(); const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
      if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue; const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
      document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx); const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
      const err=Math.abs(nc-target); if(!best || err<best.err) best={err, pts, start:st.idx}; if(err<=Math.max(2, 0.1*target)) break; }
    document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
    const nc=H.dbg().crossings.length;
    for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
    const snap=(tag)=>({tag, gapD:+(minSegGap()/(1.6*L0)).toFixed(5), lenErr:+(Math.max(...verts.map((v,k)=>Math.abs(v.distanceTo(verts[(k+1)%N])-L0)))/L0).toFixed(4), verts:verts.map(v=>[+v.x.toFixed(5),+v.y.toFixed(5),+v.z.toFixed(5)])});
    const stages=[snap('lift')];
    const t0=Date.now(); const fz=startFeasibility(300); stages.push(Object.assign(snap('feas'),{residual:+(fz.err/L0).toFixed(6), iters:fz.it, ms:Date.now()-t0, pushes:_dbgUnstick}));
    { const g0=minSegGap(); for(let k=0;k<N;k++){ _fx[k]=Math.random()-0.5; _fy[k]=Math.random()-0.5; _fz[k]=Math.random()-0.5; } dirTangentProject(8); removeRigidModes(); const fm=fieldMax(); const amp=Math.min(0.02*L0, 0.3*g0); if(fm>1e-12){ const kk=amp/fm; for(let k=0;k<N;k++){ verts[k].x+=kk*_fx[k]; verts[k].y+=kk*_fy[k]; verts[k].z+=kk*_fz[k]; } } }
    stages.push(snap('noise'));
    const e2=projectLengthsSafe(40); stages.push(Object.assign(snap('proj2'),{residual:+(e2/L0).toFixed(6)}));
    fs.appendFileSync(OUT, JSON.stringify({i, nc, N, det2d:knotDet, L0, stages})+'\n'); }
  return 'ok'; })()
