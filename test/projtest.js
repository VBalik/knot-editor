(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  H.clickPreset('cinquefoil');
  // возмутить и спроецировать: проверка сходимости и идемпотентности
  const V=window.__knotVerts(); const N=V.length, L0=H.dbg().L0;
  for(let i=0;i<N;i++){ V[i][0]+=0.2*L0*(Math.random()-0.5); V[i][1]+=0.2*L0*(Math.random()-0.5); V[i][2]+=0.2*L0*(Math.random()-0.5); }
  window.__knotSetVertsRaw(V);
  const err=()=>{ const W=window.__knotVerts(); let m=0; for(let i=0;i<N;i++){ const a=W[i], b=W[(i+1)%N]; m=Math.max(m, Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])-L0)); } return m/L0; };
  const out={errBefore:+err().toExponential(2)};
  window.__knotProject(6); out.errAfter=+err().toExponential(2);
  const W1=window.__knotVerts(); window.__knotProject(6); const W2=window.__knotVerts();
  let mv=0; for(let i=0;i<N;i++) mv=Math.max(mv, Math.hypot(W2[i][0]-W1[i][0],W2[i][1]-W1[i][1],W2[i][2]-W1[i][2]));
  out.idempotencyMoveL0=+(mv/L0).toExponential(2);
  return out;
})()
