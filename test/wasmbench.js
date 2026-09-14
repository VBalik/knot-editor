// Стенд Wasm (чистый Node): JS-ядро _segDist (копия из index.html) против AssemblyScript segDistAll — побитовое сравнение и время
const fs=require('fs'), path=require('path');
const knots=JSON.parse(fs.readFileSync(path.join(__dirname,'wasm','knots.json'),'utf8'));
const wasmBytes=fs.readFileSync(path.join(__dirname,'wasm','segdist.wasm'));
let _csS=0,_csT=0,_csDx=0,_csDy=0,_csDz=0;
function segDistJS(_vx,_vy,_vz,i,ip,j,jp){
  const p1x=_vx[i],p1y=_vy[i],p1z=_vz[i], p2x=_vx[j],p2y=_vy[j],p2z=_vz[j];
  const d1x=_vx[ip]-p1x,d1y=_vy[ip]-p1y,d1z=_vz[ip]-p1z, d2x=_vx[jp]-p2x,d2y=_vy[jp]-p2y,d2z=_vz[jp]-p2z;
  const rx=p1x-p2x,ry=p1y-p2y,rz=p1z-p2z;
  const a=d1x*d1x+d1y*d1y+d1z*d1z, e=d2x*d2x+d2y*d2y+d2z*d2z, f=d2x*rx+d2y*ry+d2z*rz;
  let s,t; const E=1e-12;
  if(a<=E&&e<=E){ s=0; t=0; }
  else if(a<=E){ s=0; t=f/e; t=t<0?0:(t>1?1:t); }
  else{ const c=d1x*rx+d1y*ry+d1z*rz;
    if(e<=E){ t=0; s=-c/a; s=s<0?0:(s>1?1:s); }
    else{ const b=d1x*d2x+d1y*d2y+d1z*d2z, dn=a*e-b*b;
      if(dn>E){ s=(b*f-c*e)/dn; s=s<0?0:(s>1?1:s); } else s=0;
      t=(b*s+f)/e;
      if(t<0){ t=0; s=-c/a; s=s<0?0:(s>1?1:s); } else if(t>1){ t=1; s=(b-c)/a; s=s<0?0:(s>1?1:s); } } }
  const dx=(p1x+d1x*s)-(p2x+d2x*t), dy=(p1y+d1y*s)-(p2y+d2y*t), dz=(p1z+d1z*s)-(p2z+d2z*t);
  _csS=s; _csT=t; _csDx=dx; _csDy=dy; _csDz=dz;
  return Math.sqrt(dx*dx+dy*dy+dz*dz);
}
(async ()=>{
  const memory=new WebAssembly.Memory({initial:64});
  const {instance}=await WebAssembly.instantiate(wasmBytes,{env:{memory, abort(){ throw new Error('wasm abort'); }}});
  const segDistAll=instance.exports.segDistAll;
  const out={};
  for(const name of Object.keys(knots)){ const K=knots[name], n=K.n, np=K.pairs.length/2;
    const vx=Float64Array.from(K.x), vy=Float64Array.from(K.y), vz=Float64Array.from(K.z), pairs=Int32Array.from(K.pairs);
    // раскладка памяти wasm
    const offX=0, offY=offX+8*n, offZ=offY+8*n, offP=offZ+8*n, offOut=offP+4*np*2+ (8-((4*np*2)%8))%8;
    const need=offOut+8*np*6; if(memory.buffer.byteLength<need) memory.grow(Math.ceil((need-memory.buffer.byteLength)/65536));
    const mem=memory.buffer; const wx=new Float64Array(mem,offX,n), wy=new Float64Array(mem,offY,n), wz=new Float64Array(mem,offZ,n), wp=new Int32Array(mem,offP,np*2), wout=new Float64Array(mem,offOut,np*6);
    wp.set(pairs);
    const jout=new Float64Array(np*6);
    const runJS=()=>{ let gmin=Infinity; for(let k=0;k<np;k++){ const i=pairs[2*k], j=pairs[2*k+1], ip=i+1===n?0:i+1, jp=j+1===n?0:j+1; const d=segDistJS(vx,vy,vz,i,ip,j,jp); const o=6*k; jout[o]=d; jout[o+1]=_csS; jout[o+2]=_csT; jout[o+3]=_csDx; jout[o+4]=_csDy; jout[o+5]=_csDz; if(d<gmin) gmin=d; } return gmin; };
    const runW=()=>{ wx.set(vx); wy.set(vy); wz.set(vz); return segDistAll(n, np, offX, offY, offZ, offP, offOut); };   // копирование координат — как на каждом шаге
    const gJ=runJS(), gW=runW();
    let mism=0, maxd=0; for(let k=0;k<np*6;k++){ if(jout[k]!==wout[k]){ mism++; maxd=Math.max(maxd, Math.abs(jout[k]-wout[k])); } }
    const bits=(a,b)=>{ const A=new Float64Array([a,b]); const I=new BigUint64Array(A.buffer); return I[0]===I[1]; };
    const time=(fn,reps)=>{ for(let r=0;r<20;r++) fn(); const t0=process.hrtime.bigint(); for(let r=0;r<reps;r++) fn(); return Number(process.hrtime.bigint()-t0)/1e6/reps; };
    const reps=400; const tJ=[], tW=[]; for(let q=0;q<3;q++){ tJ.push(time(runJS,reps)); tW.push(time(runW,reps)); }
    const mJ=Math.min(...tJ), mW=Math.min(...tW);
    out[name]={n, pairs:np, gminJS:gJ, gminWasm:gW, gminBitEqual:bits(gJ,gW), mismatches:mism, maxAbsDiff:maxd, msJS:+mJ.toFixed(4), msWasm:+mW.toFixed(4), nsPerPairJS:+(mJ*1e6/np).toFixed(1), nsPerPairWasm:+(mW*1e6/np).toFixed(1), speedup:+(mJ/mW).toFixed(2)};
    console.log(name, JSON.stringify(out[name])); }
})();
