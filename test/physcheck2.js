// Зонд 2: физическая СЕМАНТИКА ползунков и баланса сил.
// У проволоки с энергией изгиба + отталкиванием равновесная форма зависит
// только от ОТНОШЕНИЯ жёсткость/отталкивание: (3,3) ≈ (9,9); рост
// отталкивания при той же жёсткости раздувает узел (bE ниже); тривиальный
// узел — окружность при ЛЮБЫХ ползунках.
// Запуск: node harness.js physcheck2.js
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const out={ tag:window.__buildTag };
  function run(prep, bend, rep){
    prep();
    H.setSlider('bendCoef', bend); H.setSlider('repCoef', rep);
    if(!H.running()) H.play();
    let o=null, steps=0;
    for(let b=0;b<400;b++){ o=H.step(25); steps+=25; if(!o.running) break; }
    if(H.running()) H.play();
    const d=H.dbg();
    // масштаб формы: средний радиус от центроида в единицах L0
    const V=H.verts(); let cx=0,cy=0,cz=0; for(const p of V){cx+=p[0];cy+=p[1];cz+=p[2];}
    cx/=V.length; cy/=V.length; cz/=V.length;
    let rm=0; for(const p of V) rm+=Math.hypot(p[0]-cx,p[1]-cy,p[2]-cz); rm/=V.length;
    return { settled:!(o&&o.running), steps, bE:+H.bE().toFixed(3), det:H.det3d(),
      minSegL0:o&&o.minSegL0, rMeanL0:+(rm/d.L0).toFixed(2), tD:d.tD };
  }
  const tref=()=>H.clickPreset('trefoil');
  out.ratioTest = {
    b3r3: run(tref,3,3), b9r9: run(tref,9,9),          // одинаковое отношение → ждём ~одинаковую форму
    b9r1: run(tref,9,1), b3r1: run(tref,3,1),          // разное отношение → разная форма
  };
  out.repTrend = { r1:run(tref,9,1), r3:run(tref,9,3), r6:run(tref,9,6), r10:run(tref,9,10) };
  const unk=()=>{ H.el('clear').onclick();
    H.drawCurve(u=>{ const t=u*2*Math.PI; const r=140+60*Math.sin(3*t);
      return {x:400+r*Math.cos(t), y:300+r*Math.sin(t)}; }, 240); };
  out.unknotAnySlider = { b1r10:run(unk,1,10), b10r1:run(unk,10,1), b5r5:run(unk,5,5) };
  out.unknotAnySlider.bEcircle = +(4*Math.PI*Math.PI/H.dbg().N).toFixed(3);
  return out;
})()
