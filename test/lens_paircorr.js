// LENS (i): size of the pair correction d at crossings (anchor jumps) with the 2.21 amplitude vs the old one
(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  const src=liftFromDiagram.toString();
  const inj='if(have<need){ const d=(need-have)/2; ov.z+=d; un.z-=d; }';
  if(!src.includes(inj)) return {err:'pattern'};
  const patched=(rep)=>(0,eval)('('+src.replace(rep[0],rep[1]).replace(inj, 'if(have<need){ const d=(need-have)/2; ov.z+=d; un.z-=d; window.__pc.push(d/window.__L0est); } window.__pcNeed.push(need/window.__L0est); window.__pcAmp.push(Math.max(Math.abs(ov.z),Math.abs(un.z))/window.__L0est);')+')');
  const fNew=patched(['0.8+0.4*rnd()','0.8+0.4*rnd()']), fOld=patched(['0.8+0.4*rnd()','0.3+0.7*rnd()']);
  for(const [name,target] of [['rand12',12],['rand20',20],['rand30',30]]){
    H.el('clear').onclick(); if(H.running()) H.play(); let t=0; do{ randomKnot(target); }while(isUnknot && t++<30);
    window.__L0est=totalLen2D*worldScale/chooseN(totalLen2D*worldScale);
    const rec={cross:crossings.length, L0est:+window.__L0est.toFixed(4), L0:+L0.toFixed(4)};
    for(const [tag,f] of [['new',fNew],['old',fOld]]){ window.__pc=[]; window.__pcNeed=[]; window.__pcAmp=[];
      for(let k=0;k<6;k++) f(Math.random);
      const pc=window.__pc, mx=pc.length? Math.max(...pc):0, mean=pc.length? pc.reduce((a,b)=>a+b,0)/pc.length:0;
      rec[tag]={corrections:pc.length, perLift:+(pc.length/6).toFixed(1), d_L0est_max:+mx.toFixed(2), d_mean:+mean.toFixed(2), anchorAmp_L0est_max:+Math.max(...window.__pcAmp).toFixed(2), need_L0est_max:+Math.max(...window.__pcNeed).toFixed(2)}; }
    out[name]=rec; console.error(name, JSON.stringify(rec)); }
  return out; })()
