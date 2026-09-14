(async ()=>{ const H=global.__H; window.__noAutoSave=true; const out={};
  // baseline: normal canvas, random knot works
  randomKnot(20); out.normal={crossings:crossings.length, closedCurve, N, status:document.getElementById('status').textContent.slice(0,70)};
  const snap=verts.map(v=>[v.x,v.y,v.z]);
  const cv=document.getElementById('draw');
  const origRect=cv.getBoundingClientRect;
  // real mechanism: hidden canvas → zero rect → fitCanvas sets width=max(1,0)=1
  cv.getBoundingClientRect=()=>({left:0,top:0,width:0,height:0,right:0,bottom:0});
  fitCanvas();
  cv.clientWidth=0; cv.clientHeight=0;
  out.afterFitCanvas={width:cv.width,height:cv.height,clientWidth:cv.clientWidth};
  const fitted=fitToCanvas([{x:-1,y:-1},{x:1,y:1},{x:1,y:-1}]);
  out.fitToCanvasSample=fitted.map(p=>({x:+p.x.toFixed(3),y:+p.y.toFixed(3)}));
  randomKnot(20);
  let same=verts.length===snap.length && verts.every((v,i)=>Math.abs(v.x-snap[i][0])<1e-12&&Math.abs(v.y-snap[i][1])<1e-12&&Math.abs(v.z-snap[i][2])<1e-12);
  out.hidden={crossings:crossings.length, closedCurve, smoothLen:smooth.length, rawLen:raw.length, N, vertsUnchanged:same, status:document.getElementById('status').textContent.slice(0,90)};
  // scenario B: canvas sized while visible, then hidden (clientWidth=0, width stays 800*DPR)
  cv.getBoundingClientRect=origRect; cv.clientWidth=800; cv.clientHeight=600; fitCanvas();
  cv.clientWidth=0; cv.clientHeight=0;
  out.scenarioB_width=cv.width;
  randomKnot(20); out.scenarioB={crossings:crossings.length, closedCurve, status:document.getElementById('status').textContent.slice(0,70)};
  cv.clientWidth=800; cv.clientHeight=600;
  return out; })()
