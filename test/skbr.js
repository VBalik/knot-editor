// мосты (сшивка концов) для одной картинки: концы, длина, число пересечённых штрихов, стоимость
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n)); window.__noAutoSave=true;
  const dir=process.env.SK_DIR||path.join(process.cwd(),'out','sketches'), man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  const m=man.find(x=>x.name.indexOf(process.env.SK_FILE)>=0), buf=fs.readFileSync(path.join(dir,m.file)); let img;
  if(/\.jpe?g$/.test(m.file)){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
  else { const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
  window.__ikDebug=true; const r=ikRecognize(img), ap=ikApply(r), P=r.dbg.pairs.slice().sort((a,b)=>b.L-a.L);
  const inMain=new Set(r.dbg.main.seq.map(it=>it.e));
  const mateSet=new Set(); for(const c of r.dbg.pairs){ mateSet.add(c.i); mateSet.add(c.j); }
  const lone=r.dbg.free.map((f,i)=>({i, x:Math.round(f.x), y:Math.round(f.y), stub:f.stub, t:[+f.tx.toFixed(2), +f.ty.toFixed(2)]})).filter(f=>!mateSet.has(f.i));
  return {name:m.name, hw:+r.hw.toFixed(2), free:r.dbg.free.length, comps:r.dbg.comps.map(c=>+c.len.toFixed(0)), lone,
    long:P.slice(0,10).map(c=>({a:[Math.round(r.dbg.free[c.i].x), Math.round(r.dbg.free[c.i].y)], b:[Math.round(r.dbg.free[c.j].x), Math.round(r.dbg.free[c.j].y)],
      L:+c.L.toFixed(1), nr:c.nr, brk:!!c.brk, far:!!c.far, cost:+c.cost.toFixed(1), used:inMain.has(r.dbg.free[c.i].key>>1)}))}; })()
