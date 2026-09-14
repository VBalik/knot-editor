(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const OUT=process.env.OUT;
  document.getElementById('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; const r=60+130*Math.cos(3*t); return {x:400+r*Math.cos(t)*0.9, y:300+r*Math.sin(t)*0.9}; }, 300);
  const d=H.dbg(); const rec={nc:d.crossings.length, N:d.N, det2d:d.knotDet, L0:d.L0, tD:d.tD,
    smooth: smooth.map(p=>[+p.x.toFixed(3),+p.y.toFixed(3)]), crossings: crossings.map(c=>Object.assign({},c)),
    lift:H.verts().map(p=>p.map(x=>+x.toFixed(4))), gapLift:+(minSegGap()/(1.6*d.L0)).toFixed(4)};
  if(!H.running()) H.play();
  const dR=H.dbg(); rec.runDet=dR.runDet; rec.start=H.verts().map(p=>p.map(x=>+x.toFixed(4))); rec.gapStart=+(minSegGap()/(1.6*d.L0)).toFixed(4); rec.inflate0=window.__knotTrace().inflate;
  rec.snaps=[]; let o=null, st=0;
  while(true){ o=H.step(100); st+=100; const t=window.__knotTrace(); rec.snaps.push({st, inflate:t.inflate, gmin:t.gmin, minSegL0:o.minSegL0, tier:t.tier, verts:H.verts().map(p=>p.map(x=>+x.toFixed(4)))}); if(!o.running || st>=4000) break; }
  rec.status=H.dbg().status; if(H.running()) H.play();
  fs.writeFileSync(OUT, JSON.stringify(rec)); return {nc:rec.nc, N:rec.N, det2d:rec.det2d, runDet:rec.runDet, gapLift:rec.gapLift, gapStart:rec.gapStart, inflate0:rec.inflate0, status:rec.status, steps:st}; })()
