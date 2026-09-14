// диагностика ловушек: профиль кривизны, зазоры, вершины финала (спираль+петля и восьмёрка с неравными лепестками)
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const fs=global.__require('fs');
  function profile(){ const v=H.verts(); const n=v.length; const th=[]; for(let i=0;i<n;i++){ const a=v[(i-1+n)%n], b=v[i], c=v[(i+1)%n];
      const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], e2=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
      const cr=[e1[1]*e2[2]-e1[2]*e2[1], e1[2]*e2[0]-e1[0]*e2[2], e1[0]*e2[1]-e1[1]*e2[0]];
      th.push(Math.atan2(Math.hypot(...cr), e1[0]*e2[0]+e1[1]*e2[1]+e1[2]*e2[2])*n/(2*Math.PI)); }
    const B=40, prof=[]; for(let b=0;b<B;b++){ let s=0,c=0; for(let i=Math.floor(b*n/B); i<Math.floor((b+1)*n/B); i++){ s+=th[i]; c++; } prof.push(+(s/c).toFixed(2)); }
    let tot=0; for(const t of th) tot+=t; return {prof, turning:+(tot/n).toFixed(3)}; }
  function runCase(name, pts, budget){
    H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
    const set=window.__knotSetVerts(pts); H.set({ms:1});
    const circE=4*Math.PI*Math.PI/H.dbg().N;
    const rec={set, ratio0:+(H.bE()/circE).toFixed(3)};
    H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; }
    const tr=window.__knotTrace(); const d=H.dbg();
    Object.assign(rec,{steps:st, settled:!o.running, status:d.status, ratio:+(H.bE()/circE).toFixed(3), quietBy:tr.quietBy, fRel:tr.fRel, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), sEff:tr.sEff, saddle:tr.saddle, minSegL0:o.minSegL0}, profile());
    fs.writeFileSync(process.env.SP+'/trap_'+name+'.json', JSON.stringify(H.verts().map(p=>p.map(x=>+x.toFixed(5)))));
    out[name]=rec; }
  { const r=1, p=0.35, k=6, M=400, pts=[]; const Mh=Math.round(M*0.62), Ml=M-Mh;
    for(let i=0;i<Mh;i++){ const t=i/Mh; const ph=6*Math.PI*t; pts.push([r*Math.cos(ph), r*Math.sin(ph), p*(3*t-1.5)]); }
    const P0=[r,0,p*1.5], P1=[r,0,-p*1.5], T0=[0,k,0], T1=[0,k,0];
    for(let i=0;i<Ml;i++){ const u=i/Ml, h00=2*u*u*u-3*u*u+1, h10=u*u*u-2*u*u+u, h01=-2*u*u*u+3*u*u, h11=u*u*u-u*u;
      pts.push([0,1,2].map(c=>h00*P0[c]+h10*T0[c]+h01*P1[c]+h11*T1[c])); }
    runCase('coilloop', pts, 40000); }
  { const M=400, pts=[]; for(let i=0;i<M;i++){ const t=i/M*2*Math.PI; const a=1+0.7*Math.max(0,Math.cos(t))**2; pts.push([a*Math.cos(t), a*Math.sin(t)*Math.cos(t), 0.12*Math.sin(t)]); }
    runCase('fig8uneq', pts, 40000); }
  return out; })()
