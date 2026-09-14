// Независимый инвариант: определитель узла |Δ(−1)| по 3D-ломаной (Node, BigInt).
// Проекция вдоль случайного направления → пересечения отрезков → дуги Виртингера →
// точный целочисленный определитель (Барейс). Запуск: WORKER=i WORKERS=n node knotdet.js DIR
const fs=require('fs'), path=require('path');
function bareiss(M){ const n=M.length; if(n===0) return 1n;
  M=M.map(r=>r.map(x=>BigInt(x))); let prev=1n, sign=1n;
  for(let k=0;k<n-1;k++){
    if(M[k][k]===0n){ let sw=-1; for(let r=k+1;r<n;r++){ if(M[r][k]!==0n){ sw=r; break; } } if(sw<0) return 0n;
      const t=M[k]; M[k]=M[sw]; M[sw]=t; sign=-sign; }
    for(let i=k+1;i<n;i++) for(let j=k+1;j<n;j++) M[i][j]=(M[i][j]*M[k][k]-M[i][k]*M[k][j])/prev;
    prev=M[k][k]; }
  return sign*M[n-1][n-1]; }
function crossings(V,d){ const N=V.length; const dl=Math.hypot(d[0],d[1],d[2]); d=[d[0]/dl,d[1]/dl,d[2]/dl];
  const a=Math.abs(d[0])<0.9?[1,0,0]:[0,1,0];
  let e1=[d[1]*a[2]-d[2]*a[1], d[2]*a[0]-d[0]*a[2], d[0]*a[1]-d[1]*a[0]]; const l1=Math.hypot(...e1); e1=e1.map(x=>x/l1);
  const e2=[d[1]*e1[2]-d[2]*e1[1], d[2]*e1[0]-d[0]*e1[2], d[0]*e1[1]-d[1]*e1[0]];
  const X=new Float64Array(N), Y=new Float64Array(N), Z=new Float64Array(N);
  for(let i=0;i<N;i++){ const v=V[i]; X[i]=v[0]*e1[0]+v[1]*e1[1]+v[2]*e1[2]; Y[i]=v[0]*e2[0]+v[1]*e2[1]+v[2]*e2[2]; Z[i]=v[0]*d[0]+v[1]*d[1]+v[2]*d[2]; }
  const out=[];
  for(let i=0;i<N;i++){ const i1=(i+1)%N; const ax=X[i],ay=Y[i], rx=X[i1]-ax, ry=Y[i1]-ay; const rl=Math.hypot(rx,ry);
    for(let j=i+2;j<N;j++){ if(i===0 && j===N-1) continue; const j1=(j+1)%N;
      const cx=X[j],cy=Y[j], qx=X[j1]-cx, qy=Y[j1]-cy;
      const den=rx*qy-ry*qx; if(Math.abs(den)<=1e-12*(rl*Math.hypot(qx,qy)+1e-30)) continue;
      const cax=cx-ax, cay=cy-ay; const s=(cax*qy-cay*qx)/den; if(s<=1e-9||s>=1-1e-9) continue;
      const t=(cax*ry-cay*rx)/den; if(t<=1e-9||t>=1-1e-9) continue;
      const zi=Z[i]+s*(Z[i1]-Z[i]), zj=Z[j]+t*(Z[j1]-Z[j]); const pi=i+s, pj=j+t;
      out.push(zi>zj? [pi,pj] : [pj,pi]); } }
  return out; }
function detFromCrossings(cr){ const n=cr.length; if(n===0) return 1n;
  const under=cr.map((c,idx)=>[c[1],idx]).sort((a,b)=>a[0]-b[0]); const upos=under.map(u=>u[0]); const idxOf=new Map(under.map((u,m)=>[u[1],m]));
  const arcOf=p=>{ let lo=0,hi=n; while(lo<hi){ const mid=(lo+hi)>>1; if(upos[mid]<=p) lo=mid+1; else hi=mid; } return ((lo-1)%n+n)%n; };
  const M=[]; for(let c=0;c<n;c++) M.push(new Array(n).fill(0));
  for(let c=0;c<n;c++){ const m=idxOf.get(c), over=arcOf(cr[c][0]), inn=((m-1)%n+n)%n, out=m; M[c][over]+=2; M[c][inn]-=1; M[c][out]-=1; }
  const sub=M.slice(0,n-1).map(r=>r.slice(0,n-1)); const d=bareiss(sub); return d<0n?-d:d; }
function rng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function gauss(r){ const u=r()||1e-12, v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function robust(V, ndir, seed){ const r=rng(seed); const vals=[];
  for(let k=0;k<ndir;k++){ const d=[gauss(r),gauss(r),gauss(r)]; try{ vals.push(detFromCrossings(crossings(V,d)).toString()); }catch(e){ vals.push(null); } }
  const ok=vals.filter(x=>x!==null); const cnt={}; for(const x of ok) cnt[x]=(cnt[x]||0)+1;
  let mode=null, mc=0; for(const k in cnt) if(cnt[k]>mc){ mc=cnt[k]; mode=k; }
  return {mode, agree:mc, valid:ok.length, vals}; }
const DIR=process.argv[2], W=+(process.env.WORKER||0), NW=+(process.env.WORKERS||1);
const dumps={}, finals={};
for(const f of fs.readdirSync(DIR)){ if(/^dump_w\d\.jsonl$/.test(f)) for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(l.trim()){ const r=JSON.parse(l); dumps[r.i]=r; } }
  if(/^rk_w\d\.verts\.jsonl$/.test(f)) for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(l.trim()){ const r=JSON.parse(l); finals[r.i]=r.verts; } } }
const res=[];
for(const i of Object.keys(dumps).map(Number).sort((a,b)=>a-b)){ if(i%NW!==W) continue; const rec=dumps[i];
  const out={i, nc:rec.nc, N:rec.N, det2d:rec.det2d, runDet:rec.runDet, runUnknot:rec.runUnknot};
  try{ out.liftZ=detFromCrossings(crossings(rec.lift,[1e-3,2e-3,1])).toString(); }catch(e){ out.liftZ=null; }
  out.lift=robust(rec.lift,7,100+i); out.feas=robust(rec.feas,7,200+i); out.final=finals[i]? robust(finals[i],7,300+i) : null;
  res.push(out); }
fs.writeFileSync(path.join(DIR,'exact_w'+W+'.json'), JSON.stringify(res));
console.log('worker',W,'done',res.length);
