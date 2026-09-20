// 4.14 (стенд): перерисовать проекции конечных 3D-форм из сохранённых точек (HK_SAVE): RP_IN=<final_*.json> RP_OUT=<png>
(async ()=>{ const fs=__require('fs'), path=__require('path'); const J=JSON.parse(fs.readFileSync(process.env.RP_IN,'utf8'));
  const vs=J.verts.map(v=>({x:v[0],y:v[1],z:v[2]}));
  return {name:J.name, N:vs.length, out:__require(path.join(process.cwd(),'proj3d.js'))(vs, jacobiEig, process.env.RP_OUT, +(process.env.RP_W||480))}; })()
