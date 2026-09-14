(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  // синтетика: два ребра 1.3 «носик к носику» с зазором 0.05 (< gT=0.08 при ts=1), между ними шпилька из 2 рёбер
  const pts=[[-1.3,0,0],[0,0,0],[0.025,0.8,0],[0.05,0,0],[1.35,0,0]];
  // замыкание: дуга окружности снизу от (1.35,0) к (-1.3,0) единичными рёбрами
  const Rc=16, cx=0.025, cy=-Rc; const th0=Math.atan2(0-cy,1.35-cx), th1=Math.atan2(0-cy,-1.3-cx);
  const arc=Rc*(2*Math.PI-(th1-th0)); const m=Math.round(arc); // ~100 рёбер по 1
  for(let k=1;k<m;k++){ const th=th0-(2*Math.PI-(th1-th0))*k/m; pts.push([cx+Rc*Math.cos(th), cy+Rc*Math.sin(th), 0]); }
  verts=pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])); N=verts.length; allocBuffers();
  { let tl=0; for(let i=0;i<N;i++) tl+=verts[i].distanceTo(verts[(i+1)%N]); L0=tl/N; }
  _thickScale=1; crossings=[];
  const D=thickDNominal(), gT=0.05*D;
  const rep=(tag)=>({tag, N, L0:+L0.toFixed(4), gT_L0:+(gT/L0).toFixed(4), gap_gT:+(minSegGap()/gT).toFixed(3),
     e0:+(verts[0].distanceTo(verts[1])/L0).toFixed(3), e3:+(verts[3].distanceTo(verts[4])/L0).toFixed(3),
     mid03_R:+(verts[0].clone().add(verts[1]).multiplyScalar(0.5).distanceTo(verts[3].clone().add(verts[4]).multiplyScalar(0.5))/(gT+1.2*L0)).toFixed(3)});
  const out=[rep('init')];
  const p=unstickLift(300); out.push({...rep('after unstickLift(300)'), pushes:p});
  const orig=unstickLift; let calls=0, pushesTot=0; unstickLift=function(m){ calls++; const r=orig(m); pushesTot+=r; return r; };
  const sf=startFeasibility(300); out.push({...rep('after startFeasibility(300)'), err_L0:+(sf.err/L0).toExponential(2), it:sf.it, unstickCalls:calls, pushes:pushesTot});
  return out; })()
