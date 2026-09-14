// Зонд линейного поиска L-BFGS на рисунке пользователя: как часто ярус 0
// пробует, на каком делении принимает, как часто проваливается целиком
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), path=global.__require('path');
  const dir=path.join(process.cwd(),'..','telemetry');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort();
  const raw=fs.readFileSync(path.join(dir, process.env.TELEM||files[files.length-1]),'utf8');
  global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick();
  await new Promise(r=>setTimeout(r,300));
  const sob=+(process.env.SOB||80); window.__knotSet({sob, momentum:+(process.env.MOM||0.85)});
  H.setSlider('bendCoef', 10); H.setSlider('repCoef', 3);
  if(!H.running()) H.play();
  const STEPS=+(process.env.STEPS||1200);
  const acc={0:new Array(9).fill(0),1:new Array(9).fill(0),2:new Array(9).fill(0)}; // индекс 8 = провал
  const mv={0:[],1:[],2:[]}; let tried={0:0,1:0,2:0}; const fails0=[];
  for(let b=0;b<STEPS/50;b++){
    window.__trialLog=[];
    H.step(50);
    // сгруппировать по шагу и ярусу
    const byStep={};
    for(const e of window.__trialLog){ const k=e.st+':'+e.tier; (byStep[k]=byStep[k]||[]).push(e); }
    for(const k in byStep){ const es=byStep[k], tier=es[0].tier; tried[tier]++;
      const last=es[es.length-1], ok = last.dE<0;      // последняя попытка принята?
      if(ok){ acc[tier][es.length-1]++; mv[tier].push(last.moveL0); }
      else { acc[tier][8]++; if(tier===0 && fails0.length<6) fails0.push(es.map(e=>[e.moveL0, e.dE, e.pred, e.dot])); }
    }
  }
  const q=a=>{ if(!a.length) return null; a.sort((x,y)=>x-y); return {n:a.length, p10:a[Math.floor(a.length*0.1)], med:a[Math.floor(a.length*0.5)], p90:a[Math.floor(a.length*0.9)], max:a[a.length-1]}; };
  const t=window.__knotTrace();
  return { sob, STEPS, tried, acceptedAtHalving:acc, moveL0:{t0:q(mv[0]), t1:q(mv[1]), t2:q(mv[2])}, fails0, bE:+H.bE().toFixed(3), lb:t.lb, fRel:+t.fRel.toFixed(4) };
})()
