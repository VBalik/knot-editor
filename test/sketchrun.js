// 4.0: прогон скетчей с диска (out/sketches/manifest.json) тем же путём, что кнопка Image:
// декодирование файла → приведение к ≤1600 px → ikRecognize → ikApply; сверка с эталоном
// (число пересечений, положение каждого, над/под, определитель).
// Запуск: cd test && node harness.js sketchrun.js     (SK_DIR=<папка>, SK_ONLY=<подстрока имени>, SK_VERBOSE=1)
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n)); window.__noAutoSave=true;
  const dir=process.env.SK_DIR||path.join(process.cwd(),'out','sketches'), man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  function load(file){   // как ikLoadFile: декодирование и уменьшение длинной стороны до 1600 (усреднение по площади)
    const buf=fs.readFileSync(path.join(dir,file)), ext=path.extname(file).toLowerCase(); let img;
    if(ext==='.jpg'||ext==='.jpeg'){ const j=mod('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
    else { const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
    const w0=img.width, h0=img.height, s=Math.min(1, 1600/Math.max(w0,h0)), W=Math.max(8,Math.round(w0*s)), H=Math.max(8,Math.round(h0*s));
    if(W===w0 && H===h0) return {width:W, height:H, data:img.data};
    const d=new Uint8ClampedArray(W*H*4), fx=w0/W, fy=h0/H;
    for(let y=0;y<H;y++){ const ya=y*fy, yb=(y+1)*fy, y0=Math.floor(ya), y1=Math.min(h0,Math.ceil(yb));
      for(let x=0;x<W;x++){ const xa=x*fx, xb=(x+1)*fx, x0=Math.floor(xa), x1=Math.min(w0,Math.ceil(xb)); let r=0,g=0,b=0,a=0,sw=0;
        for(let yy=y0;yy<y1;yy++){ const wy=Math.min(yy+1,yb)-Math.max(yy,ya); if(wy<=0) continue;
          for(let xx=x0;xx<x1;xx++){ const wx=Math.min(xx+1,xb)-Math.max(xx,xa); if(wx<=0) continue; const w=wx*wy, k=4*(yy*w0+xx); r+=img.data[k]*w; g+=img.data[k+1]*w; b+=img.data[k+2]*w; a+=img.data[k+3]*w; sw+=w; } }
        const o=4*(y*W+x); d[o]=r/sw; d[o+1]=g/sw; d[o+2]=b/sw; d[o+3]=a/sw; } }
    return {width:W, height:H, data:d};
  }
  const rows=[], fails=[]; let exact=0, countOK=0, detOK=0, ovAll=0, ovOK=0, noPend=0, msSum=0, nrun=0;
  for(const m of man){ if(process.env.SK_ONLY && m.name.indexOf(process.env.SK_ONLY)<0) continue;
    const img=load(m.file), t0=Date.now(); let res=null, ap=null, err=null;
    try{ res=ikRecognize(img); ap=ikApply(res); }catch(e){ err=String(e && e.stack || e).slice(0,300); }
    const ms=Date.now()-t0; msSum+=ms; nrun++;
    if(err || !ap || !ap.ok){ rows.push({name:m.name, ok:false, msg:err||(res&&res.msg)||(ap&&ap.msg)}); fails.push({name:m.name, msg:err||(res&&res.msg)||(ap&&ap.msg), gt:m.nc}); continue; }
    const sf=(img.width/m.W);   // если файл уменьшили при загрузке — эталон в тех же координатах
    const got=crossings.map(c=>({x:c.x, y:c.y, o:c.over==='A'? c.dirA : c.dirB, pend:!!c.pending}));
    const tol=Math.max(12, (2*m.pw+10)*sf*ap.k/res.f), used=new Set(); let match=0, ov=0;
    for(const g of m.gt){ const gx=g.x*sf/res.f*ap.k+ap.ox, gy=g.y*sf/res.f*ap.k+ap.oy; let bi=-1, bd=tol;
      got.forEach((q,i)=>{ if(used.has(i)) return; const d=Math.hypot(q.x-gx, q.y-gy); if(d<bd){ bd=d; bi=i; } });
      if(bi<0) continue; used.add(bi); match++; if(Math.abs(g.ox*got[bi].o.x+g.oy*got[bi].o.y)>0.6) ov++; }
    const cOK=crossings.length===m.nc, dOK=knotDet===m.det, ex=cOK && match===m.nc && ov===m.nc && dOK;
    countOK+=cOK; detOK+=dOK; exact+=ex; ovAll+=m.nc; ovOK+=ov; if(!ap.pending) noPend++;
    const row={name:m.name, ok:true, exact:ex, gt:m.nc, got:crossings.length, match, ov, det:[m.det, knotDet], pend:ap.pending, notes:res.notes, hw:+res.hw.toFixed(2), ms};
    rows.push(row); if(!ex) fails.push(row);
    if(process.env.SK_VERBOSE) console.error(m.name, 'gt', m.nc, 'got', crossings.length, 'm', match, 'ov', ov, 'det', m.det, knotDet, 'pend', ap.pending, ex?'OK':'FAIL', JSON.stringify(res.notes), ms+'ms');
  }
  try{ fs.writeFileSync(path.join(dir,'..','sketch_fails.json'), JSON.stringify(fails,null,1)); }catch(e){}
  return {n:nrun, exact, countOK, detOK, noPend, overPct:+(100*ovOK/Math.max(1,ovAll)).toFixed(1), msAvg:Math.round(msSum/Math.max(1,nrun)), fails:fails.map(f=>f.name+(f.msg? ' ('+f.msg+')' : ' gt'+f.gt+'/got'+f.got+' m'+f.match+' ov'+f.ov+' det'+(f.det||[]).join('≠')))};
})()
