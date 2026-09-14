(async ()=>{ let _seed=777; Math.random=()=>{ _seed=(_seed*1103515245+12345)&0x7fffffff; return _seed/0x7fffffff; };
  const H=global.__H; window.__noAutoSave=true; const out={};
  const fgap=()=>{ let gF=Infinity,gA=Infinity,cdA=-1,cdF=-1; for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+1;j<N;j++){ const jp=(j+1)%N; const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue; const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<gA){gA=x;cdA=cd;} const wArg=(cd*L0/(2*Math.max(x,1e-12))-1)/0.15; if(wArg<=0) continue; if(x<gF){gF=x;cdF=cd;} } } return {gA,cdA,gF,cdF}; };
  const runTo=(maxB)=>{ if(!H.running()) H.play(); const infl0=window.__knotTrace().inflate; let o=null,st=0; for(let b=0;b<maxB;b++){ o=H.step(25); st+=25; if(!o.running) break; } const wr=H.running(); if(wr) H.play(); return {settled:!wr, steps:st, infl0:+infl0.toFixed(3)}; };
  const rep=(tag,r)=>{ const g=fgap(), s=sNominal(); out[tag]=Object.assign(r,{N, w:thickCoef, r:repCoef, wr_N:(thickCoef+repCoef)*N, sN_L0:+(s/L0).toFixed(3), thr_1p9L0:+(1.9*L0/s).toFixed(3), gminAll_L0:+(g.gA/L0).toFixed(3), cdAll:g.cdA, gminF_L0:+(g.gF/L0).toFixed(3), gminF_s:+(g.gF/s).toFixed(3), cdF:g.cdF, inflate:+window.__knotTrace().inflate.toFixed(3), quietBy:window.__knotTrace().quietBy, det3d:H.det3d(), status:H.dbg().status.slice(0,90)}); };
  // (a) трилистник N=225 → удвоение → 450, w=r=10
  const dbl=()=>{ const V=H.verts(), n=V.length, arr=[]; for(let i=0;i<n;i++){ const a=V[i], b=V[(i+1)%n]; arr.push(a); arr.push([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); } window.__knotSetVerts(arr); };
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); runTo(600); dbl(); H.setSlider('thick',10); H.setSlider('repCoef',10);
  rep('a_tref450_w10r10', runTo(1500));
  // (b) UI-путь: кривая от руки с многими пересечениями (эпитрохоида), w=r=10
  document.getElementById('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+150*Math.cos(t)+90*Math.cos(6*t), y:300+150*Math.sin(t)-90*Math.sin(6*t)}; }, 400);
  out.b_cross=crossings?crossings.length:null; out.b_N=N;
  H.setSlider('thick',10); H.setSlider('repCoef',10);
  rep('b_drawn_w10r10', runTo(1500));
  // (c) тот же рисунок, w+r маленькие — контроль
  document.getElementById('clear').onclick();
  H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+150*Math.cos(t)+90*Math.cos(6*t), y:300+150*Math.sin(t)-90*Math.sin(6*t)}; }, 400);
  H.setSlider('thick',3); H.setSlider('repCoef',2);
  rep('c_drawn_w3r2', runTo(1500));
  return out; })()
