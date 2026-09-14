(async ()=>{ const H=global.__H; window.__noAutoSave=true;
  let s=Number(process.env.SEED||1)|0; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  const target=Number(process.env.TARGET||80), MAXST=Number(process.env.MAXST||20000), MAXMS=Number(process.env.MAXMS||400000);
  randomKnot(target);
  const rec={seed:process.env.SEED, target, nc:crossings.length, N, DnomL0:+(thickDNominal()/L0).toFixed(3)};
  // wrap energyGrad for timing
  const orig=energyGrad; let egMs=0, egCalls=0, egGrad=0;
  energyGrad=function(g){ const t=process.hrtime.bigint(); const r=orig(g); egMs+=Number(process.hrtime.bigint()-t)/1e6; egCalls++; if(g) egGrad++; return r; };
  const origPL=projectLengths; let plMs=0; projectLengths=function(k){ const t=process.hrtime.bigint(); const r=origPL(k); plMs+=Number(process.hrtime.bigint()-t)/1e6; return r; };
  const t0=Date.now(); H.play(); rec.startMs=Date.now()-t0; rec.inflate0=+_inflate.toFixed(4);
  egMs=0; egCalls=0; egGrad=0; plMs=0;
  const t1=Date.now(); let st=0, stepsInfl=null; const win=[];
  while(running && st<MAXST && Date.now()-t1<MAXMS){ relaxStep(); st++; if(stepsInfl===null && _inflate>=1) stepsInfl=st;
    if(st%1000===0) win.push({st, E:+_ePrev.toFixed(4), fRel:+_dbgDE.toExponential(2), g:+(_dbgGmin/L0).toFixed(3), D:+(thickD()/L0).toFixed(3), ms:Date.now()-t1}); }
  rec.steps=st; rec.stepsInfl=stepsInfl; rec.runMs=Date.now()-t1; rec.msPerStep=+(rec.runMs/st).toFixed(2); rec.settled=!running;
  rec.status=document.getElementById('status').textContent.slice(0,120);
  rec.egMs=Math.round(egMs); rec.egShare=+(egMs/rec.runMs).toFixed(3); rec.egCalls=egCalls; rec.egPerCall=+(egMs/egCalls).toFixed(2); rec.evalsPerStep=+(egCalls/st).toFixed(2); rec.plMs=Math.round(plMs);
  rec.fRelEnd=_dbgDE; rec.E=_ePrev; rec.win=win;
  if(running) H.play();
  return rec; })()
