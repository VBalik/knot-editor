// зазоры лифта/фазы допустимости: минимальное расстояние между несмежными отрезками
const fs=require('fs'), path=require('path'); const DIR=process.argv[2];
function segDist(p1,q1,p2,q2){ // Eberly / стандартный алгоритм
  const ux=q1[0]-p1[0],uy=q1[1]-p1[1],uz=q1[2]-p1[2], vx=q2[0]-p2[0],vy=q2[1]-p2[1],vz=q2[2]-p2[2], wx=p1[0]-p2[0],wy=p1[1]-p2[1],wz=p1[2]-p2[2];
  const a=ux*ux+uy*uy+uz*uz, b=ux*vx+uy*vy+uz*vz, c=vx*vx+vy*vy+vz*vz, d=ux*wx+uy*wy+uz*wz, e=vx*wx+vy*wy+vz*wz, D=a*c-b*b; let sN,sD=D,tN,tD=D;
  if(D<1e-12){ sN=0; sD=1; tN=e; tD=c; } else { sN=b*e-c*d; tN=a*e-b*d; if(sN<0){ sN=0; tN=e; tD=c; } else if(sN>sD){ sN=sD; tN=e+b; tD=c; } }
  if(tN<0){ tN=0; if(-d<0) sN=0; else if(-d>a) sN=sD; else { sN=-d; sD=a; } } else if(tN>tD){ tN=tD; if(-d+b<0) sN=0; else if(-d+b>a) sN=sD; else { sN=-d+b; sD=a; } }
  const sc=Math.abs(sN)<1e-12?0:sN/sD, tc=Math.abs(tN)<1e-12?0:tN/tD;
  const dx=wx+sc*ux-tc*vx, dy=wy+sc*uy-tc*vy, dz=wz+sc*uz-tc*vz; return Math.sqrt(dx*dx+dy*dy+dz*dz); }
function minGap(V){ const N=V.length; let m=Infinity; for(let i=0;i<N;i++){ const i1=(i+1)%N; for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const d=segDist(V[i],V[i1],V[j],V[(j+1)%N]); if(d<m) m=d; } } return m; }
const out=[];
for(const f of fs.readdirSync(DIR)){ if(!/^dump_w\d\.jsonl$/.test(f)) continue;
  for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l); const D=1.6*r.L0;
    let zmin=Infinity,zmax=-Infinity; for(const p of r.lift){ if(p[2]<zmin) zmin=p[2]; if(p[2]>zmax) zmax=p[2]; }
    out.push({i:r.i, nc:r.nc, N:r.N, L0:+r.L0.toFixed(3), gapLiftD:+(minGap(r.lift)/D).toFixed(3), gapFeasD:+(minGap(r.feas)/D).toFixed(3), zRangeL0:+((zmax-zmin)/r.L0).toFixed(2)}); } }
out.sort((a,b)=>a.i-b.i); fs.writeFileSync(path.join(DIR,'gaps.json'), JSON.stringify(out));
const q=(a,p)=>{ a=a.slice().sort((x,y)=>x-y); return a[Math.min(a.length-1,Math.floor(p*a.length))]; };
console.log('gapLiftD  min/p10/p50/p90:', q(out.map(o=>o.gapLiftD),0), q(out.map(o=>o.gapLiftD),.1), q(out.map(o=>o.gapLiftD),.5), q(out.map(o=>o.gapLiftD),.9));
console.log('gapFeasD  min/p50:', q(out.map(o=>o.gapFeasD),0), q(out.map(o=>o.gapFeasD),.5));
console.log('zRange/L0 min/p50/max:', q(out.map(o=>o.zRangeL0),0), q(out.map(o=>o.zRangeL0),.5), q(out.map(o=>o.zRangeL0),1));
for(const [a,b] of [[9,30],[30,50],[50,70],[70,101]]){ const s=out.filter(o=>o.nc>=a&&o.nc<b); console.log(`nc ${a}-${b-1}: gapLiftD p50=${q(s.map(o=>o.gapLiftD),.5)} zRange p50=${q(s.map(o=>o.zRangeL0),.5)}`); }
