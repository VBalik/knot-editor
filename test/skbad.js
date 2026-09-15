// где именно перепутан проход: печатает эталонные пересечения, у которых над/под не совпало
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n)); window.__noAutoSave=true;
  const dir=path.join(process.cwd(),'out','sketches'), man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  const out=[];
  for(const m of man){ if(process.env.SK_LIST && !process.env.SK_LIST.split(',').some(x=>x&&m.name.indexOf(x)>=0)) continue;
    const buf=fs.readFileSync(path.join(dir,m.file)); let img;
    if(/\.jpe?g$/.test(m.file)){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
    else { const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
    const r=ikRecognize(img), ap=ikApply(r); if(!ap||!ap.ok){ out.push({name:m.name, msg:r.msg||ap.msg}); continue; }
    const got=crossings.map(c=>({x:c.x, y:c.y, o:c.over==='A'?c.dirA:c.dirB, u:c.over==='A'?c.dirB:c.dirA, pend:!!c.pending})), used=new Set(), bad=[];
    const tol=Math.max(12,(2*m.pw+10)*ap.k/r.f);
    for(const g of m.gt){ const gx=g.x/r.f*ap.k+ap.ox, gy=g.y/r.f*ap.k+ap.oy; let bi=-1, bd=tol;
      got.forEach((q,i)=>{ if(used.has(i)) return; const d=Math.hypot(q.x-gx,q.y-gy); if(d<bd){ bd=d; bi=i; } });
      if(bi<0){ bad.push({miss:true, wx:Math.round(g.x/r.f), wy:Math.round(g.y/r.f)}); continue; }
      used.add(bi); const dO=Math.abs(g.ox*got[bi].o.x+g.oy*got[bi].o.y), dU=Math.abs(g.ox*got[bi].u.x+g.oy*got[bi].u.y);
      if(dO<=dU){ let br=null, bdd=1e9; for(const rc of r.recs){ const d=Math.hypot(rc.x-g.x/r.f, rc.y-g.y/r.f); if(d<bdd){ bdd=d; br=rc; } }
        bad.push({wx:Math.round(g.x/r.f), wy:Math.round(g.y/r.f), dO:+dO.toFixed(2), dU:+dU.toFixed(2), pend:got[bi].pend, d:Math.round(bd),
          rec:br&&{kind:br.kind, known:br.known, d:Math.round(bdd), o:[+br.ox.toFixed(2), +br.oy.toFixed(2)], u:[+br.ux.toFixed(2), +br.uy.toFixed(2)]}, gtO:[g.ox, g.oy]}); } }
    out.push({name:m.name, gt:m.nc, got:crossings.length, det:[m.det,knotDet], bad});
    console.error(m.name, 'det', m.det, knotDet, JSON.stringify(bad)); }
  return {n:out.length}; })()
