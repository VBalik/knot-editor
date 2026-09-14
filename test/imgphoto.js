// 3.5: узел по фото или картинке с диска — тот же путь, что у кнопки Image: IK_IMG=<файл, который читает sips> [IK_EXPECT="<пересечений>,<det>"]
// Картинка приводится к размеру, как в браузере (длинная сторона не больше 1600), через sips → BMP во временную папку (macOS).
// Запуск: IK_IMG=~/Desktop/knot.jpg IK_EXPECT=20,245 node harness.js imgphoto.js
(async ()=>{ const fs=__require('fs'), path=__require('path'), os=__require('os'), cp=__require('child_process'); window.__noAutoSave=true;
  const src=process.env.IK_IMG; if(!src) throw new Error('set IK_IMG=<image file>');
  const dims=cp.execFileSync('sips', ['-g','pixelWidth','-g','pixelHeight', src], {encoding:'utf8'}), w0=+(/pixelWidth:\s*(\d+)/.exec(dims)||[])[1], h0=+(/pixelHeight:\s*(\d+)/.exec(dims)||[])[1];
  const tmp=path.join(os.tmpdir(), 'imgphoto_'+process.pid+'.bmp'), args=(Math.max(w0,h0)>1600? ['-Z','1600'] : []).concat(['-s','format','bmp', src, '--out', tmp]);
  cp.execFileSync('sips', args, {stdio:'ignore'});
  const buf=fs.readFileSync(tmp); fs.unlinkSync(tmp);
  const off=buf.readUInt32LE(10), W=buf.readInt32LE(18), Hs=buf.readInt32LE(22), bpp=buf.readUInt16LE(28), H=Math.abs(Hs), row=Math.floor((bpp*W+31)/32)*4, by=bpp/8, data=new Uint8ClampedArray(W*H*4);
  for(let y=0;y<H;y++){ const sy=Hs>0? H-1-y : y; for(let x=0;x<W;x++){ const o=off+sy*row+x*by, j=4*(y*W+x); data[j]=buf[o+2]; data[j+1]=buf[o+1]; data[j+2]=buf[o]; data[j+3]=255; } }
  const t0=Date.now(), res=ikRecognize({width:W, height:H, data}), ms=Date.now()-t0, ap=ikApply(res);
  const out={file:path.basename(src), size:[w0,h0], work:[res.W||null, res.H||null], ok:!!(ap && ap.ok), msg:res.msg||null, crossings:crossings.length, det:knotDet, notes:res.notes||null, ms, status:document.getElementById('status').textContent};
  if(process.env.IK_EXPECT){ const [nc,det]=process.env.IK_EXPECT.split(',').map(Number); out.expect={crossings:nc, det}; out.pass=out.ok && crossings.length===nc && knotDet===det; }
  return out; })()
