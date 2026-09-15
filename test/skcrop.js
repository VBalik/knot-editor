// вырезка куска исходной картинки (в координатах рабочего кадра, ×f): SK_FILE, SK_CROP=x0,y0,x1,y1,zoom
const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'out','sketches'), man=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const m=man.find(x=>x.name.indexOf(process.env.SK_FILE)>=0), buf=fs.readFileSync(path.join(dir,m.file)); let img;
if(/\.jpe?g$/.test(m.file)){ const j=require('jpeg-js').decode(buf,{useTArray:true, formatAsRGBA:true}); img={width:j.width, height:j.height, data:j.data}; }
else { const p=require('pngjs').PNG.sync.read(buf); img={width:p.width, height:p.height, data:p.data}; }
const f=+(process.env.SK_F||Math.ceil(Math.max(img.width,img.height)/1000)), [x0,y0,x1,y1,z]=process.env.SK_CROP.split(',').map(Number), zz=z||4;
const cw=(x1-x0)*f, ch=(y1-y0)*f, PNG=require('pngjs').PNG, o=new PNG({width:cw*zz, height:ch*zz});
for(let y=0;y<ch*zz;y++) for(let x=0;x<cw*zz;x++){ const sx=Math.min(img.width-1, x0*f+Math.floor(x/zz)), sy=Math.min(img.height-1, y0*f+Math.floor(y/zz)), k=4*(sy*img.width+sx), i=4*(y*cw*zz+x);
  o.data[i]=img.data[k]; o.data[i+1]=img.data[k+1]; o.data[i+2]=img.data[k+2]; o.data[i+3]=255; }
fs.writeFileSync(process.env.SK_OUT||path.join(__dirname,'out','crop.png'), PNG.sync.write(o));
console.log(JSON.stringify({file:m.file, f, size:[cw*zz, ch*zz]}));
