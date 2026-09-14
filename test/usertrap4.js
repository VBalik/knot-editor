// диаграмма пользователя (telemetry 16:59, det 11): многостарт с контролем растяжения; разные дальности отталкивания
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const T=JSON.parse(fs.readFileSync('fixtures/telemetry/knot-telemetry-20260904-165935-456.json','utf8'));
  function ext(v){ let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const p of v) for(let c=0;c<3;c++){ mn[c]=Math.min(mn[c],p[c]); mx[c]=Math.max(mx[c],p[c]); } return mx.map((x,c)=>+(x-mn[c]).toFixed(2)); }
  async function fromDiagram(name, thick, rep, bend, ms, budget){
    H.el('clear').onclick(); if(H.running()) H.play();
    H.setSlider('thick',thick); H.setSlider('repCoef',rep); H.setSlider('bendCoef',bend);
    global.fetch=async ()=>({ ok:true, json:async ()=>T });
    document.getElementById('restoreLast').onclick();
    await new Promise(r=>setTimeout(r,400));
    updateKnotType(); syncKnot3D(); H.set({ms});
    const d=H.dbg(); const rec={nc:d.crossings.length, det:d.knotDet, N:d.N, liftExt:ext(H.verts())};
    const circE=4*Math.PI*Math.PI/d.N;
    H.play(); rec.runDet=H.dbg().runDet; rec.startExt=ext(H.verts());
    let o=null, st=0, lastRound=0; const rounds=[{round:0, ext:ext(H.verts())}];
    while(true){ o=H.step(50); st+=50; const tr=window.__knotTrace();
      if(tr.msRound!==lastRound){ rounds.push({round:tr.msRound, st, ext:ext(H.verts()), prevE:tr.msEnergies[tr.msEnergies.length-1], saddle:tr.saddle}); lastRound=tr.msRound; }
      if(!o.running || st>=budget) break; }
    const tr=window.__knotTrace();
    Object.assign(rec,{steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,120), msEnergies:tr.msEnergies, saddleN:tr.saddleN, lastSaddle:tr.saddle, quietBy:tr.quietBy, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), rounds});
    fs.writeFileSync('fixtures/user_20cross_'+name+'.json', JSON.stringify(H.verts().map(p=>p.map(x=>+x.toFixed(5)))));
    console.error(name, JSON.stringify(rec)); return rec; }
  out.ms5_w10r10=await fromDiagram('ms5_w10r10', 10,10,2, 5, 6000);
  out.ms1_w10r1=await fromDiagram('ms1_w10r1', 10,1,2, 1, 20000);
  out.ms1_w5r2=await fromDiagram('ms1_w5r2', 5,2,9, 1, 20000);
  return out; })()
