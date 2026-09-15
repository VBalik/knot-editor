// 3.5/3.9: узел по фото или картинке с диска — тот же путь, что у кнопки Image: IK_IMG=<.jpg|.jpeg|.png> [IK_EXPECT="<пересечений>,<det>"]
// Декодирование на чистом JS (jpeg-js, pngjs — работает и в облаке на Linux, без macOS sips); картинка приводится к размеру, как в браузере:
// длинная сторона не больше 1600 (Math.round, как в ikLoadFile), уменьшение усреднением по площади. Прозрачность PNG сохраняется (её учитывает _ikPrep).
// Запуск: cd test && IK_IMG=/путь/knot.jpg IK_EXPECT=20,245 node harness.js imgphoto.js
(async ()=>{ const fs=__require('fs'), path=__require('path'), mod=(n)=>__require(path.join(process.cwd(),'node_modules',n)); window.__noAutoSave=true;
  const src=process.env.IK_IMG; if(!src) throw new Error('set IK_IMG=<image file: .jpg, .jpeg or .png>');
  const buf=fs.readFileSync(src), ext=path.extname(src).toLowerCase(); let img;
  if(ext==='.jpg' || ext==='.jpeg'){ const j=mod('jpeg-js').decode(buf, {useTArray:true, formatAsRGBA:true, maxMemoryUsageInMB:1024}); img={width:j.width, height:j.height, data:j.data}; }
  else if(ext==='.png'){ const p=mod('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
  else throw new Error('imgphoto.js reads .jpg, .jpeg and .png only (convert the file first)');
  const w0=img.width, h0=img.height, sc=Math.min(1, 1600/Math.max(w0,h0)), W=Math.max(8, Math.round(w0*sc)), H=Math.max(8, Math.round(h0*sc));
  let data=img.data;
  if(W!==w0 || H!==h0){ const d=new Uint8ClampedArray(W*H*4), fx=w0/W, fy=h0/H;   // усреднение по площади: доля каждого исходного пикселя в целевом
    for(let y=0;y<H;y++){ const ya=y*fy, yb=(y+1)*fy, y0=Math.floor(ya), y1=Math.min(h0, Math.ceil(yb));
      for(let x=0;x<W;x++){ const xa=x*fx, xb=(x+1)*fx, x0=Math.floor(xa), x1=Math.min(w0, Math.ceil(xb)); let r=0,g=0,b=0,a=0,s=0;
        for(let yy=y0; yy<y1; yy++){ const wy=Math.min(yy+1,yb)-Math.max(yy,ya); if(wy<=0) continue;
          for(let xx=x0; xx<x1; xx++){ const wx=Math.min(xx+1,xb)-Math.max(xx,xa); if(wx<=0) continue; const w=wx*wy, k=4*(yy*w0+xx); r+=img.data[k]*w; g+=img.data[k+1]*w; b+=img.data[k+2]*w; a+=img.data[k+3]*w; s+=w; } }
        const o=4*(y*W+x); d[o]=r/s; d[o+1]=g/s; d[o+2]=b/s; d[o+3]=a/s; } }
    data=d; }
  const t0=Date.now(), res=ikRecognize({width:W, height:H, data}), ms=Date.now()-t0, ap=ikApply(res);
  const out={file:path.basename(src), size:[w0,h0], input:[W,H], work:[res.W||null, res.H||null], ok:!!(ap && ap.ok), msg:res.msg||null, crossings:crossings.length, det:knotDet, pending:(typeof pendingCount==='function'? pendingCount() : null), notes:res.notes||null, ms, status:document.getElementById('status').textContent};
  if(process.env.IK_EXPECT){ const [nc,det]=process.env.IK_EXPECT.split(',').map(Number); out.expect={crossings:nc, det}; out.pass=out.ok && crossings.length===nc && knotDet===det; }
  return out; })()
