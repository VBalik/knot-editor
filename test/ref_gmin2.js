(async ()=>{ let _seed=777; Math.random=()=>{ _seed=(_seed*1103515245+12345)&0x7fffffff; return _seed/0x7fffffff; };
  const H=global.__H; window.__noAutoSave=true; const out={};
  const fgap=()=>{ let gF=Infinity,gA=Infinity,cdA=-1,cdF=-1; for(let i=0;i<N;i++){ const ip=(i+1)%N; for(let j=i+1;j<N;j++){ const jp=(j+1)%N; const cd=Math.min(j-i,N-(j-i)); if(cd<=2) continue; const x=_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist; if(x<gA){gA=x;cdA=cd;} const wArg=(cd*L0/(2*Math.max(x,1e-12))-1)/0.15; if(wArg<=0) continue; if(x<gF){gF=x;cdF=cd;} } } return {gA,cdA,gF,cdF}; };
  const runTo=(maxB)=>{ if(!H.running()) H.play(); const infl0=window.__knotTrace().inflate; let o=null,st=0; for(let b=0;b<maxB;b++){ o=H.step(25); st+=25; if(!o.running) break; } const wr=H.running(); if(wr) H.play(); return {settled:!wr, steps:st, infl0:+infl0.toFixed(3)}; };
  const rep=(tag,r)=>{ const g=fgap(), s=sNominal(); out[tag]=Object.assign(r,{N, cross:crossings?crossings.length:null, w:thickCoef, r:repCoef, wr_N:(thickCoef+repCoef)*N, sN_L0:+(s/L0).toFixed(3), gminAll_L0:+(g.gA/L0).toFixed(3), cdAll:g.cdA, gminF_L0:+(g.gF/L0).toFixed(3), gminF_s:+(g.gF/s).toFixed(3), cdF:g.cdF, inflate:+window.__knotTrace().inflate.toFixed(3), det3d:H.det3d(), status:H.dbg().status.slice(0,90)}); };
  for(const [k,w,r] of [[13,10,10],[13,5,5],[13,3,2]]){
    document.getElementById('clear').onclick();
    H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+150*Math.cos(t)+80*Math.cos(k*t), y:300+150*Math.sin(t)-80*Math.sin(k*t)}; }, 600);
    H.setSlider('thick',w); H.setSlider('repCoef',r);
    rep('k'+k+'_w'+w+'r'+r, runTo(1500));
  }
  return out; })()
