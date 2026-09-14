(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={keys:null, cases:[]};
  for(const t of [20,50,100]) for(let k=0;k<4;k++){
    randomKnot(t); if(!out.keys) out.keys=Object.keys(crossings[0]);
    const viol=[]; for(let i=0;i<crossings.length;i++) for(let j=i+1;j<crossings.length;j++){ const a=crossings[i],b=crossings[j]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<21) viol.push({d:+d.toFixed(2), a:{i:a.i,j:a.j,s:a.s,t:a.t}, b:{i:b.i,j:b.j,s:b.s,t:b.t}}); }
    viol.sort((p,q)=>p.d-q.d);
    out.cases.push({t, nc:crossings.length, nSmooth:smooth.length, nViol:viol.length, viol:viol.slice(0,4)}); }
  return out; })()
