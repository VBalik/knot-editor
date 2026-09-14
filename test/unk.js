// тривиальные узлы разной природы → обязаны прийти в окружность
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={tag:window.__buildTag};
  function run(name, fn, npts){
    H.el('clear').onclick(); H.drawCurve(fn, npts||240);
    const d0=H.dbg();
    if(!H.running()) H.play();
    let o=null, steps=0, kicks=0, last='';
    for(let b=0;b<2000;b++){ o=H.step(25); steps+=25; const st=H.dbg().status; if(st!==last && /седла/.test(st)) kicks++; last=st; if(!o.running) break; }
    if(H.running()) H.play();
    const d=H.dbg();
    out[name]={ settled:!(o&&o.running), steps, det:d.runDet, det3d:H.det3d(), bE:+H.bE().toFixed(3), circle:+(4*Math.PI*Math.PI/d.N).toFixed(3), rvar:o&&o.rvar, kicks, status:d.status.slice(0,40) };
  }
  run('rosette3', u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; });
  run('rosette3off', u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t+0.4)+15*Math.cos(t); return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; });
  run('writheCoil', u=>{ const t=u*2*Math.PI; const r=95+75*Math.cos(3*t+0.4); return {x:400+r*Math.cos(t)*0.95+25*Math.cos(2*t), y:300+r*Math.sin(t)*0.95+25*Math.sin(2*t)}; }, 300);  // r>0: без кратной точки в центре (прежняя r=60+130cos3t проходила через центр 6 раз)
  run('lissajous', u=>{ const t=u*2*Math.PI; return {x:400+230*Math.sin(2*t), y:300+170*Math.sin(3*t+0.3)}; }, 300);
  run('doubleLoop', u=>{ const t=u*4*Math.PI; const r=150+40*Math.sin(t/2); return {x:400+r*Math.cos(t)+30*Math.cos(t/2), y:300+r*Math.sin(t)+30*Math.sin(t/2)}; }, 360);
  return out;
})()
