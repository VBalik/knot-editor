(()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  H.clickPreset('trefoil');
  { const V=H.verts(); let tl=0; for(let i=0;i<V.length;i++){const a=V[i],b=V[(i+1)%V.length]; tl+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    out.preset={N, L0:+L0.toFixed(6), actualLen:+tl.toFixed(6), NL0:+(N*L0).toFixed(6), unitLen:+unitLen().toFixed(7), unitFromActual:+(tl/3000).toFixed(7), tubeRadius:+tubeRadius.toFixed(7), halfD:+(0.5*thickCoef*unitLen()).toFixed(7), thickCoef, repCoef, s_L0:+(sNominal()/L0).toFixed(3)}; }
  // __knotSet hatch
  try{ H.set({thick:5}); out.knotSet='ok'; }catch(e){ out.knotSet='THROWS: '+e.message; }
  // synthetic single pair: N=8, L0=0.01
  N=8; L0=0.01; allocBuffers(); _inflate=1; KB_PER=0; thickCoef=5; repCoef=2;
  const mk=(x)=>[[-1,0,0],[1,0,0],[50,0,0],[50,-50,x],[0,-1,x],[0,1,x],[-50,50,x],[-50,0,0]];
  const setX=(x)=>{ const a=mk(x); verts=a.map(p=>new THREE.Vector3(p[0],p[1],p[2])); };
  const Erep=(x)=>{ setX(x); return energyGrad(false).E; };
  const u=unitLen(); out.u=u; out.kR=kRep();
  const law=(w,r)=>{ thickCoef=w; repCoef=r; const s=sNominal(), D=thickDNominal(); const rows=[];
    for(const f of [0.5,0.9,0.999,1.0,1.001,1.1,1.5,2,3,4.9,5.0,5.5,8]){ const x=f*s, E=Erep(x); const dl=x-s;
      const pred=(dl>0&&dl<4*s)? kRep()*(Math.pow(D/dl,4)-Math.pow(D/(4*s),4)) : (dl<=0?Infinity:0);
      rows.push({x_s:f, E:isFinite(E)?+E.toExponential(4):String(E), pred:isFinite(pred)?+pred.toExponential(4):String(pred), E_dl4_over_kRD4: isFinite(E)&&dl>0? +((E+kRep()*Math.pow(D/(4*s),4))*Math.pow(dl,4)/(kRep()*Math.pow(D,4))).toFixed(4):null}); }
    return {s_u:s/u, D_u:D/u, rows}; };
  out.law_w5r2=law(5,2);
  out.s_equal_w3r5_vs_w5r3={ a:(thickCoef=3,repCoef=5,sNominal()/u), b:(thickCoef=5,repCoef=3,sNominal()/u) };
  // amplitude vs w at fixed Delta = 1u
  const amp={}; for(const [w,r] of [[1,10],[10,1],[1,1],[10,10],[5,2],[2,5]]){ thickCoef=w; repCoef=r; const s=sNominal(); const E=Erep(s+1*u); amp['w'+w+'r'+r]=+E.toExponential(4); }
  out.amp_at_Delta1u=amp;
  // force discontinuity at cutoff: numerical dE/dx just below and above Delta_c
  { thickCoef=5; repCoef=2; const s=sNominal(); const h=1e-4*s; const xc=s+4*s; out.force_at_cut={below:+((Erep(xc-h)-Erep(xc-3*h))/(2*h)).toExponential(3), above:+((Erep(xc+3*h)-Erep(xc+h))/(2*h)).toExponential(3)}; }
  // hard core exactly: x = s + 1e-9*L0 * 0.5 -> inf ; x = s+ 2e-9*L0 -> finite
  { thickCoef=5; repCoef=2; const s=sNominal(); out.core={at_s:String(Erep(s)), just_above:String(Erep(s+2e-9*L0))}; }
  return out; })()
