// объёмность лифта: габариты и σ по осям (собственные значения ковариации) базового лифта и попыток
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  function stats(){ const v=H.verts(); const n=v.length; const c=[0,0,0]; for(const p of v) for(let k=0;k<3;k++) c[k]+=p[k]/n;
    const M=[[0,0,0],[0,0,0],[0,0,0]]; for(const p of v) for(let a=0;a<3;a++) for(let b=0;b<3;b++) M[a][b]+=(p[a]-c[a])*(p[b]-c[b])/n;
    // собственные значения симметричной 3×3 (Якоби)
    let A=M.map(r=>r.slice()); for(let it=0;it<60;it++){ let p=0,q=1,mx=Math.abs(A[0][1]); if(Math.abs(A[0][2])>mx){p=0;q=2;mx=Math.abs(A[0][2]);} if(Math.abs(A[1][2])>mx){p=1;q=2;mx=Math.abs(A[1][2]);} if(mx<1e-12) break;
      const th=0.5*Math.atan2(2*A[p][q], A[q][q]-A[p][p]); const cs=Math.cos(th), sn=Math.sin(th); const B=A.map(r=>r.slice());
      for(let k=0;k<3;k++){ B[p][k]=cs*A[p][k]-sn*A[q][k]; B[q][k]=sn*A[p][k]+cs*A[q][k]; } const C=B.map(r=>r.slice()); for(let k=0;k<3;k++){ C[k][p]=cs*B[k][p]-sn*B[k][q]; C[k][q]=sn*B[k][p]+cs*B[k][q]; } A=C; }
    const ev=[A[0][0],A[1][1],A[2][2]].map(x=>Math.sqrt(Math.max(0,x))).sort((a,b)=>b-a);
    let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const p of v) for(let k=0;k<3;k++){ mn[k]=Math.min(mn[k],p[k]); mx[k]=Math.max(mx[k],p[k]); }
    return {ext:mx.map((x,k)=>+(x-mn[k]).toFixed(2)), sig:ev.map(x=>+x.toFixed(2)), iso:+(ev[2]/ev[0]).toFixed(2), sz_sxy:+(Math.sqrt(M[2][2])/Math.sqrt(0.5*(M[0][0]+M[1][1]))).toFixed(2)}; }
  for(const [name, prep] of [['trefoil', ()=>H.clickPreset('trefoil')], ['figure8', ()=>H.clickPreset('figure8')], ['rand12', ()=>{ let t=0; do{ randomKnot(12); }while(isUnknot && t++<20); }], ['rand20', ()=>{ let t=0; do{ randomKnot(20); }while(isUnknot && t++<20); }]]){
    H.el('clear').onclick(); if(H.running()) H.play(); prep();
    const rec={det2d:knotDet, N, base:stats(), liftDet:_detRobust(3), tries:[]};
    for(let k=0;k<5;k++){ liftFromDiagram(Math.random); rec.tries.push({...stats(), det:_detRobust(3)}); }
    out[name]=rec; }
  return out; })()
