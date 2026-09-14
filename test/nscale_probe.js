(async ()=>{
  let _seed=12345; Math.random=()=>{ _seed=(_seed*1103515245+12345)&0x7fffffff; return _seed/0x7fffffff; };
  const H=global.__H; window.__noAutoSave=true;
  const runTo=(maxB)=>{ if(!H.running()) H.play(); let o=null,st=0; for(let b=0;b<(maxB||600);b++){ o=H.step(25); st+=25; if(!o.running) break; } const wr=H.running(); if(wr) H.play(); return {settled:!wr, steps:st, status:H.dbg().status.slice(0,80)}; };
  const split=(E)=>{ const g=energyGrad(false); const Eb=kBend()*H.bE(); return {N, L0:+L0.toFixed(4), u_L0:+(unitLen()/L0).toFixed(4), s_L0:+(sNominal()/L0).toFixed(3), E:g.E, Ebend:Eb, Erep:g.E-Eb, ratio:(g.E-Eb)/Eb, gmin_s:+(g.gmin/sNominal()).toFixed(3), inflate:_inflate}; };
  const dbl=()=>{ const V=H.verts(), n=V.length, arr=[]; for(let i=0;i<n;i++){ const a=V[i], b=V[(i+1)%n]; arr.push(a); arr.push([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); } window.__knotSetVerts(arr); };
  const out={};
  // 1) СТАТИКА: та же форма, разные N
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2);
  out.eq225=runTo(800); out.static={};
  _inflate=1; out.static.N225=split();
  dbl(); _inflate=1; out.static.N450=split();
  dbl(); _inflate=1; out.static.N900=split();
  out.static.ratio_Erep_450_225=out.static.N450.Erep/out.static.N225.Erep;
  out.static.ratio_Ebend_450_225=out.static.N450.Ebend/out.static.N225.Ebend;
  out.static.ratio_Erep_900_450=out.static.N900.Erep/out.static.N450.Erep;
  out.static.ratio_Ebend_900_450=out.static.N900.Ebend/out.static.N450.Ebend;
  // 2) ДИНАМИКА: равновесие при N=450 из той же формы
  H.clickPreset('trefoil'); H.setSlider('thick',5); H.setSlider('repCoef',2); runTo(800);
  const m225=split(); dbl(); const r450=runTo(1000); const m450=split();
  out.dyn={N225:{gmin_s:m225.gmin_s, ratio:m225.ratio}, N450:Object.assign(r450,{gmin_s:m450.gmin_s, ratio:m450.ratio, inflate:m450.inflate})};
  // 3) chooseN диапазон по пресетам
  out.presetN={}; for(const k of ['trefoil','figure8','cinquefoil','septafoil']){ H.clickPreset(k); out.presetN[k]=N; }
  return out; })()
