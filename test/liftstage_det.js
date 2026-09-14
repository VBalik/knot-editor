const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n')){ if(!l.trim()) continue; const r=JSON.parse(l);
  // независимый 2D det
  const V=r.smooth.map(p=>[p[0],p[1],0]); const N=V.length; const X=V.map(p=>p[0]), Y=V.map(p=>p[1]); const cr=[];
  for(let i=0;i<N;i++){ const i1=(i+1)%N; const ax=X[i],ay=Y[i],rx=X[i1]-ax,ry=Y[i1]-ay; for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const j1=(j+1)%N; const cx=X[j],cy=Y[j],qx=X[j1]-cx,qy=Y[j1]-cy; const den=rx*qy-ry*qx; if(Math.abs(den)<1e-12) continue; const s=((cx-ax)*qy-(cy-ay)*qx)/den, t=((cx-ax)*ry-(cy-ay)*rx)/den; if(s<=1e-9||s>=1-1e-9||t<=1e-9||t>=1-1e-9) continue; const px=ax+s*rx, py=ay+s*ry; let bi=-1,bd=1e9; r.crossings.forEach((c,k)=>{ const dd=Math.hypot(c.x-px,c.y-py); if(dd<bd){bd=dd;bi=k;} }); cr.push(r.crossings[bi].over==='A'? [i+s,j+t] : [j+t,i+s]); } }
  const d2=detFromCrossings(cr).toString();
  const rp=robust(r.pre,5,3), ro=robust(r.post,5,4);
  console.log(`i=${r.i} nc=${r.nc} N=${r.N} det2d(ред)=${r.det2d} мой2D=${d2} (${cr.length} пер.) | до enforce: ${rp.mode} (${rp.agree}/${rp.valid}) | после enforce (fixed=${r.fixed}): ${ro.mode} (${ro.agree}/${ro.valid})`); }
