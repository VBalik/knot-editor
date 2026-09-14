const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'knotdet.js'),'utf8').split('const DIR=process.argv[2]')[0]; eval(src);
const r=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
// 2D-диаграмма своим кодом
{ const V=r.smooth.map(p=>[p[0],p[1],0]); const N=V.length; const X=V.map(p=>p[0]), Y=V.map(p=>p[1]); const cr=[];
  for(let i=0;i<N;i++){ const i1=(i+1)%N; const ax=X[i],ay=Y[i],rx=X[i1]-ax,ry=Y[i1]-ay;
    for(let j=i+2;j<N;j++){ if(i===0&&j===N-1) continue; const j1=(j+1)%N; const cx=X[j],cy=Y[j],qx=X[j1]-cx,qy=Y[j1]-cy; const den=rx*qy-ry*qx; if(Math.abs(den)<1e-12) continue;
      const s=((cx-ax)*qy-(cy-ay)*qx)/den, t=((cx-ax)*ry-(cy-ay)*rx)/den; if(s<=1e-9||s>=1-1e-9||t<=1e-9||t>=1-1e-9) continue;
      const px=ax+s*rx, py=ay+s*ry; let bi=-1,bd=1e9; r.crossings.forEach((c,k)=>{ const d=Math.hypot(c.x-px,c.y-py); if(d<bd){bd=d;bi=k;} });
      cr.push(r.crossings[bi].over==='A'? [i+s,j+t] : [j+t,i+s]); } }
  console.log('2D: пересечений в диаграмме', r.crossings.length, 'найдено', cr.length, 'det2d(редактор)', r.det2d, 'мой det диаграммы', detFromCrossings(cr).toString()); }
const z=(V,tag)=>{ const rb=robust(V,7,1); console.log(tag+': liftZ='+(function(){try{return detFromCrossings(crossings(V,[1e-3,2e-3,1])).toString();}catch(e){return 'ERR'}})()+' robust='+rb.mode+' ('+rb.agree+'/'+rb.valid+') vals='+JSON.stringify(rb.vals)); };
z(r.lift,'лифт'); z(r.start,'после старта (шум)');
console.log('gapLift/D', r.gapLift, 'gapStart/D', r.gapStart, 'inflate0', r.inflate0, 'runDet(редактор)', r.runDet);
let prev=null; for(const s of r.snaps){ const rb=robust(s.verts,3,5); const chg=prev!==null&&rb.mode!==prev; console.log(`  st=${s.st} inflate=${(+s.inflate).toFixed(3)} gmin/D=${(s.gmin/1.6).toFixed(3)} minSeg/D=${(s.minSegL0/1.6).toFixed(3)} tier=${s.tier} det=${rb.mode}(${rb.agree}/${rb.valid})${chg?'  <== СМЕНА':''}`); prev=rb.mode; }
console.log('status:', r.status);
