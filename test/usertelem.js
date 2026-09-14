(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'), path=global.__require('path');
  const raw=fs.readFileSync(process.env.TELEM,'utf8'); global.fetch=async ()=>({ ok:true, json:async ()=>JSON.parse(raw) });
  document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300));
  const d=H.dbg(); const out={nc:d.crossings.length, det2d:d.knotDet, N, runs:{}};
  const run=(w,r,b,tag)=>{ H.setSlider('bendCoef',b); H.setSlider('thick',w); H.setSlider('repCoef',r); if(!H.running()) H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=10000) break; } if(H.running()) H.play();
    const M=16*Math.PI*Math.PI/N; const E0=H.bE(); const res={steps:st, EoverM:+(E0/M).toFixed(3), rvar:o.rvar, det:_detRobust(3), status:H.dbg().status.slice(0,60), fRel:+window.__knotTrace().fRel.toExponential(1), gap_s:+(minSegGapRep()/sNominal()).toFixed(2)};
    // проверка устойчивости: 4 встряски + спуск
    let best=E0, bestV=H.verts().map(p=>p.slice()); const kicks=[];
    for(let k=0;k<4;k++){ window.__knotSetVertsRaw(bestV); const kk=window.__knotKick(2, 20); if(!H.running()) H.play(); let o2=null, s2=0; while(true){ o2=H.step(100); s2+=100; if(!o2.running || s2>=6000) break; } if(H.running()) H.play();
      const E=H.bE(); kicks.push({kicked:kk.applied, steps:s2, EoverM:+(E/M).toFixed(3), det:_detRobust(3)}); if(E<best*0.995){ best=E; bestV=H.verts().map(p=>p.slice()); } }
    res.kicks=kicks; res.bestEoverM=+(best/M).toFixed(3); res.bestVerts=bestV.map(p=>p.map(x=>+x.toFixed(4))); out.runs[tag]=res; };
  run(10,10,1,'user_w10_r10_b1'); document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300));
  run(10,10,9,'w10_r10_b9'); document.getElementById('restoreLast').onclick(); await new Promise(r=>setTimeout(r,300));
  run(5,2,9,'w5_r2_b9');
  fs.writeFileSync(process.env.OUT, JSON.stringify(out)); for(const k in out.runs) delete out.runs[k].bestVerts; return out; })()
