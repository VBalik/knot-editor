// отладочная картинка: маска (голубая), распознанная кривая (красная), эталонные пересечения (зелёные),
// найденные (оранжевые: полые — не выбран проход). SK_FILE=<файл из манифеста> [SK_OUT=<png>]
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n)); window.__noAutoSave=true;
  const dir=process.env.SK_DIR||path.join(process.cwd(),'out','sketches'), man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  const m=man.find(x=>x.name.indexOf(process.env.SK_FILE)>=0); if(!m) throw new Error('no such sketch');
  const buf=fs.readFileSync(path.join(dir,m.file)), ext=path.extname(m.file).toLowerCase(); let img;
  if(ext==='.jpg'||ext==='.jpeg'){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
  else { const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
  window.__ikDebug=true; const r=ikRecognize(img), ap=ikApply(r);
  const W=r.W, H=r.H, PNG=mod('pngjs').PNG, out=new PNG({width:W, height:H}), D=out.data, f=r.f;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=4*(y*W+x), k=4*(Math.min(img.height-1,y*f)*img.width+Math.min(img.width-1,x*f));
    D[i]=200+img.data[k]*0.2; D[i+1]=200+img.data[k+1]*0.2; D[i+2]=200+img.data[k+2]*0.2; D[i+3]=255; }
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(r.mask[y*W+x]){ const i=4*(y*W+x); D[i]=150; D[i+1]=190; D[i+2]=230; }
  const px=(x,y,c)=>{ x=Math.round(x); y=Math.round(y); if(x<0||y<0||x>=W||y>=H) return; const i=4*(y*W+x); D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; };
  const disc=(x,y,rr,c,hollow)=>{ for(let dy=-rr;dy<=rr;dy++) for(let dx=-rr;dx<=rr;dx++){ const d=Math.hypot(dx,dy); if(d<=rr && (!hollow || d>=rr-1.6)) px(x+dx,y+dy,c); } };
  if(r.dbg && r.dbg.skp){ const Wp=W+2; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(r.dbg.skp[(y+1)*Wp+x+1]) px(x,y,[40,90,160]); }
  for(let i=0;i<r.pts.length;i++){ const a=r.pts[i], b=r.pts[(i+1)%r.pts.length], n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y));
    for(let t=0;t<n;t++) px(a.x+(b.x-a.x)*t/n, a.y+(b.y-a.y)*t/n, [220,30,30]); }
  if(process.env.SK_ENDS && r.dbg){ for(const c of r.dbg.pairs){ const a=r.dbg.free[c.i], b=r.dbg.free[c.j], n=Math.ceil(c.L)+1;
      for(let t=0;t<=n;t++) px(a.x+(b.x-a.x)*t/n, a.y+(b.y-a.y)*t/n, [200,0,200]); }
    for(const e of r.dbg.free) disc(e.x, e.y, 2, [120,0,180]); }
  for(const g of m.gt) disc(g.x/f, g.y/f, 7, [20,160,60], true);
  const inv=(c)=>({x:(c.x-ap.ox)/ap.k, y:(c.y-ap.oy)/ap.k});
  for(const c of crossings){ const q=inv(c); disc(q.x, q.y, 4, c.pending? [255,140,0] : [235,120,0], !!c.pending); }
  let fin=out;
  if(process.env.SK_CROP){ const [cx0,cy0,cx1,cy1,z]=process.env.SK_CROP.split(',').map(Number), cw=cx1-cx0, chh=cy1-cy0, zz=z||4, o2=new PNG({width:cw*zz, height:chh*zz});
    for(let y=0;y<chh*zz;y++) for(let x=0;x<cw*zz;x++){ const sx=cx0+Math.floor(x/zz), sy=cy0+Math.floor(y/zz), i=4*(y*cw*zz+x), k=4*(Math.min(H-1,Math.max(0,sy))*W+Math.min(W-1,Math.max(0,sx)));
      o2.data[i]=D[k]; o2.data[i+1]=D[k+1]; o2.data[i+2]=D[k+2]; o2.data[i+3]=255; }
    fin=o2; }
  const dst=process.env.SK_OUT||path.join(dir,'..','dbg_'+m.name+'.png'); fs.writeFileSync(dst, PNG.sync.write(fin));
  return {name:m.name, gt:m.nc, got:crossings.length, det:[m.det,knotDet], hw:+r.hw.toFixed(2), notes:r.notes, edges:r.dbg.G.E.filter(e=>e.alive).length, free:r.dbg.free.length, pairs:r.dbg.pairs.length, dst}; })()
