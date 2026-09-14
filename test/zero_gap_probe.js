// Прямой зонд к претензии: принудительно совпавшие (или почти) непрядьевые отрезки
// на старте физики. GAP — целевой зазор в долях L0 (0 = точное пересечение).
(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  const GAP=+(process.env.GAP||0), STEPS=+(process.env.STEPS||500), PRESET=process.env.PRESET||'trefoil';
  H.clickPreset(PRESET); H.setSlider('bendCoef',9); H.setSlider('thick',5); H.setSlider('repCoef',5);
  if(H.running()) H.play();                    // пресет мог автозапустить физику — стоп
  const n=N, i=Math.floor(n*0.15), j=Math.floor(n*0.55), ip=(i+1)%n, jp=(j+1)%n;
  // середина отрезка i, перпендикуляр к нему; отрезок j кладём через середину со сдвигом GAP·L0 по нормали
  const a=verts[i], b=verts[ip]; const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,mz=(a.z+b.z)/2;
  let tx=b.x-a.x,ty=b.y-a.y,tz=b.z-a.z; const tl=Math.hypot(tx,ty,tz); tx/=tl;ty/=tl;tz/=tl;
  let ux=-ty,uy=tx,uz=0; let ul=Math.hypot(ux,uy,uz); if(ul<1e-9){ux=1;uy=0;uz=0;ul=1;} ux/=ul;uy/=ul;uz/=ul;
  const wx=ty*uz-tz*uy, wy=tz*ux-tx*uz, wz=tx*uy-ty*ux; // нормаль к обоим
  verts[j].set(mx-0.5*L0*ux+GAP*L0*wx, my-0.5*L0*uy+GAP*L0*wy, mz-0.5*L0*uz+GAP*L0*wz);
  verts[jp].set(mx+0.5*L0*ux+GAP*L0*wx, my+0.5*L0*uy+GAP*L0*wy, mz+0.5*L0*uz+GAP*L0*wz);
  const out={preset:PRESET, N:n, i,j, GAP, sN_L0:+(sNominal()/L0).toFixed(3)};
  out.before={gap_L0:minSegGap()/L0, closest:_closestSeg(verts[i],verts[ip],verts[j],verts[jp]).dist/L0};
  const t0=Date.now(); H.play(); out.startMs=Date.now()-t0;
  const eg=energyGrad(false); const tr=window.__knotTrace();
  out.afterStart={inflate:_inflate, sEff_L0:sExcl()/L0, gap_L0:minSegGap()/L0, gminEG_L0:eg.gmin/L0, E:eg.E, unstick:tr.unstick, running:H.running(), status:H.dbg().status.slice(0,80)};
  const rows=[]; const V0=H.verts();
  for(let b=0;b<STEPS/50;b++){ const o=H.step(50); const t=window.__knotTrace();
    const V=H.verts(); let mv=0; for(let k=0;k<V.length;k++) mv=Math.max(mv, Math.hypot(V[k][0]-V0[k][0],V[k][1]-V0[k][1],V[k][2]-V0[k][2]));
    rows.push({st:stepCounter, E:_ePrev, fRel:+t.fRel.toExponential(2), inflate:+_inflate.toExponential(2), stall:_inflStall, jam:_inflJammed, stuck:_stuck, settle:settleCount, gap_L0:+(minSegGap()/L0).toExponential(2), drift_L0:+(mv/L0).toExponential(2), tier:t.tier, running:o.running, status:o.status.slice(0,70)});
    if(!o.running) break; }
  out.rows=rows.filter((r,k)=>k<3||k%3===0||!r.running);
  out.final={running:H.running(), status:H.dbg().status.slice(0,100), E:_ePrev};
  if(H.running()) H.play();
  return out; })()
