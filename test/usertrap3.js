// состояние/диаграмма пользователя при разной дальности отталкивания: раскрываются ли витки
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const fs=global.__require('fs'); const out={};
  const fin=JSON.parse(fs.readFileSync('fixtures/user_20cross_final.json','utf8'));
  const T=JSON.parse(fs.readFileSync('fixtures/telemetry/knot-telemetry-20260904-165935-456.json','utf8'));
  function fromState(thick, rep, bend, budget){
    H.el('clear').onclick(); H.drawCurve(u=>{ const t=u*2*Math.PI; return {x:400+200*Math.cos(t), y:300+200*Math.sin(t)}; }, 240);
    H.setSlider('thick',thick); H.setSlider('repCoef',rep); H.setSlider('bendCoef',bend);
    window.__knotSetVerts(fin); H.set({ms:1}); window.__knotProject(60);
    const circE=4*Math.PI*Math.PI/H.dbg().N; const rec={ratio0:+(H.bE()/circE).toFixed(3)};
    H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; }
    const tr=window.__knotTrace(); Object.assign(rec,{steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,70), saddleN:tr.saddleN, quietBy:tr.quietBy, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), sEff_L0:+tr.sEff.toFixed(2)});
    fs.writeFileSync('fixtures/user_20cross_w'+thick+'r'+rep+'.json', JSON.stringify(H.verts().map(p=>p.map(x=>+x.toFixed(5)))));
    return rec; }
  function fromDiagram(thick, rep, bend, budget){
    H.el('clear').onclick(); const sm=T.diagram.smooth, M=sm.length;
    H.drawCurve(u=>{ const p=sm[Math.min(M-1, Math.floor(u*M))]; return {x:p.x, y:p.y}; }, M);
    for(const w of T.diagram.crossings){ let bi=-1, bd=1e9; crossings.forEach((c,i)=>{ const dd=Math.hypot(c.x-w.x, c.y-w.y); if(dd<bd){ bd=dd; bi=i; } }); if(bi>=0 && bd<25) crossings[bi].over=w.over; }
    updateKnotType(); syncKnot3D();
    const d=H.dbg(); const rec={nc:d.crossings.length, det:d.knotDet, N:d.N};
    H.setSlider('thick',thick); H.setSlider('repCoef',rep); H.setSlider('bendCoef',bend); H.set({ms:1});
    const circE=4*Math.PI*Math.PI/H.dbg().N;
    H.play(); let o=null, st=0; while(true){ o=H.step(100); st+=100; if(!o.running || st>=budget) break; }
    const tr=window.__knotTrace(); Object.assign(rec,{steps:st, settled:!o.running, ratio:+(H.bE()/circE).toFixed(3), status:H.dbg().status.slice(0,70), saddleN:tr.saddleN, quietBy:tr.quietBy, gminRep_s:+(tr.gminRep/tr.sEff).toFixed(3), runDet:H.dbg().runDet});
    fs.writeFileSync('fixtures/user_20cross_diag_w'+thick+'r'+rep+'.json', JSON.stringify(H.verts().map(p=>p.map(x=>+x.toFixed(5)))));
    return rec; }
  out.w10r1=fromState(10,1,2,20000); console.error('w10r1', JSON.stringify(out.w10r1));
  out.w5r2=fromState(5,2,9,20000); console.error('w5r2', JSON.stringify(out.w5r2));
  out.w10r10=fromState(10,10,2,6000); console.error('w10r10', JSON.stringify(out.w10r10));
  out.diag_w10r1=fromDiagram(10,1,2,20000); console.error('diag', JSON.stringify(out.diag_w10r1));
  return out; })()
