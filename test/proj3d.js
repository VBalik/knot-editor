// 4.14 (стенд): ПРОЕКЦИЯ 3D-КРИВОЙ В PNG для отчётов стенда. Оси — главные оси инерции (вид вдоль наименьшей), глубина — цветом
// (ближе — жёлто-зелёный, дальше — синий), дальние отрезки рисуются первыми. Использование из теста:
//   __require(path.join(process.cwd(),'proj3d.js'))(verts, jacobiEig, file, W)   // verts — [{x,y,z}…] замкнутой кривой
const fs=require('fs'), path=require('path');
module.exports=function(verts, jacobiEig, file, W){
  W=W||480; const N=verts.length, Hh=W; let cx=0,cy=0,cz=0; for(const v of verts){ cx+=v.x; cy+=v.y; cz+=v.z; } cx/=N; cy/=N; cz/=N;
  let a=0,b=0,d=0,e=0,f=0,g=0; for(const v of verts){ const x=v.x-cx, y=v.y-cy, z=v.z-cz; a+=x*x; b+=x*y; d+=x*z; e+=y*y; f+=y*z; g+=z*z; }
  const ei=jacobiEig([[a/N,b/N,d/N],[b/N,e/N,f/N],[d/N,f/N,g/N]]), ord=[0,1,2].sort((i,j)=>ei.vals[j]-ei.vals[i]);
  const e1=Array.from(ei.vecs[ord[0]]), e2=Array.from(ei.vecs[ord[1]]), e3=Array.from(ei.vecs[ord[2]]);
  const P=verts.map(v=>{ const x=v.x-cx, y=v.y-cy, z=v.z-cz; return [x*e1[0]+y*e1[1]+z*e1[2], x*e2[0]+y*e2[1]+z*e2[2], x*e3[0]+y*e3[1]+z*e3[2]]; });
  let R=0; for(const p of P) R=Math.max(R, Math.hypot(p[0],p[1])); const sc=(W/2-24)/Math.max(1e-9,R);
  let zmin=Infinity, zmax=-Infinity; for(const p of P){ zmin=Math.min(zmin,p[2]); zmax=Math.max(zmax,p[2]); }
  const PNG=require(path.join(process.cwd(),'node_modules','pngjs')).PNG, o=new PNG({width:W,height:Hh}); o.data.fill(255);
  const put=(x,y,col)=>{ x|=0; y|=0; if(x<0||y<0||x>=W||y>=Hh) return; const i=4*(y*W+x); o.data[i]=col[0]; o.data[i+1]=col[1]; o.data[i+2]=col[2]; o.data[i+3]=255; };
  const disc=(x,y,r,col)=>{ for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(dx*dx+dy*dy<=r*r) put(x+dx,y+dy,col); };
  const idx=P.map((p,i)=>i).sort((i,j)=>P[i][2]-P[j][2]);
  for(const i of idx){ const p=P[i], q=P[(i+1)%N], t=(p[2]-zmin)/Math.max(1e-9,zmax-zmin);
    const col=[Math.round(40+150*(1-t)), Math.round(70+120*(1-t)), Math.round(200-120*(1-t))];
    const x0=W/2+p[0]*sc, y0=Hh/2-p[1]*sc, x1=W/2+q[0]*sc, y1=Hh/2-q[1]*sc, L=Math.hypot(x1-x0,y1-y0), m=Math.max(1,Math.ceil(L));
    for(let k=0;k<=m;k++) disc(x0+(x1-x0)*k/m, y0+(y1-y0)*k/m, 2, col); }
  fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, PNG.sync.write(o)); return file; };
