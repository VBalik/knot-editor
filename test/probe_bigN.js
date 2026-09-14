(()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.clickPreset('trefoil');
  const circle=(n,R)=>{ const a=[]; for(let i=0;i<n;i++){ const t=i/n*2*Math.PI; a.push([R*Math.cos(t),R*Math.sin(t),0]); } return a; };
  const run=(n,w,r,maxB)=>{ window.__knotSetVerts(circle(n, n*0.125/(2*Math.PI))); H.setSlider('thick',w); H.setSlider('repCoef',r);
    if(!H.running()) H.play(); const infl0=window.__knotTrace().inflate; let o=null,st=0; for(let b=0;b<(maxB||200);b++){ o=H.step(25); st+=25; if(!o.running) break; } if(H.running()) H.play();
    const t=window.__knotTrace(), d=H.dbg();
    return {N, s_L0:+(sNominal()/L0).toFixed(3), thresh13s_L0:+(1.3*sNominal()/L0).toFixed(3), minGap_L0:+(minSegGap()/L0).toFixed(3), inflate0:+infl0.toFixed(3), inflateEnd:+t.inflate.toFixed(3), steps:st, settled:!(o&&o.running), status:d.status.slice(0,100)}; };
  out.circle600_w5r5=run(600,5,5,300);
  out.circle300_w10r10=run(300,10,10,300);
  out.circle260_w10r10=run(260,10,10,300);
  return out; })()
