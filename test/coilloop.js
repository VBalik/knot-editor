// спираль 3 витка + возвратная большая петля (тривиальный узел): ловушка «покой по силе»
// при неравных радиусах — по физике витки должны вырасти, петля уменьшиться
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
  const r=1, p=0.35, k=+(process.env.K||6), M=+(process.env.M||400), pts=[];
  const Mh=Math.round(M*0.62), Ml=M-Mh;
  for(let i=0;i<Mh;i++){ const t=i/Mh; const ph=6*Math.PI*t; pts.push([r*Math.cos(ph), r*Math.sin(ph), p*(3*t-1.5)]); }
  const P0=[r,0,p*1.5], P1=[r,0,-p*1.5], T0=[0,k,0], T1=[0,k,0];
  for(let i=0;i<Ml;i++){ const u=i/Ml, h00=2*u*u*u-3*u*u+1, h10=u*u*u-2*u*u+u, h01=-2*u*u*u+3*u*u, h11=u*u*u-u*u;
    pts.push([0,1,2].map(c=>h00*P0[c]+h10*T0[c]+h01*P1[c]+h11*T1[c])); }
  out.set=window.__knotSetVerts(pts);
  H.set({ms:+(process.env.MS||1)});
  const circE=4*Math.PI*Math.PI/H.dbg().N; out.circE=+circE.toFixed(4);
  out.bE0=+H.bE().toFixed(4); out.ratio0=+(H.bE()/circE).toFixed(3);
  out.mm0=window.__knotMinMode(36);
  H.play(); let o=null, st=0; const log=[]; let lastN=0, lastLog=0;
  while(true){ o=H.step(100); st+=100; const tr=window.__knotTrace();
    if(tr.saddleN!==lastN){ log.push({st, saddle:tr.saddle, ratio:+(H.bE()/circE).toFixed(3)}); lastN=tr.saddleN; }
    if(st-lastLog>=2000){ log.push({st, ratio:+(H.bE()/circE).toFixed(3), fRel:tr.fRel, quietBy:tr.quietBy}); lastLog=st; }
    if(!o.running || st>=+(process.env.BUDGET||40000)) break; }
  const tr=window.__knotTrace();
  out.run={steps:st, settled:!o.running, status:H.dbg().status, ratio:+(H.bE()/circE).toFixed(3), saddleN:tr.saddleN, lastSaddle:tr.saddle, quietBy:tr.quietBy, fRel:tr.fRel, log};
  out.mmFinal=window.__knotMinMode(36);
  return out; })()
