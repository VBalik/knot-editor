// 3.9: картинка узла без разрывов (самопересекающаяся кривая) — у пересечений без видимого разрыва белые кружки (проход не выбран),
// Physics недоступна, пока не выбраны все; первый клик по кружку выбирает проход (предложенный), следующие — меняют.
// Картинка с разрывами, пресет — без белых кружков, Physics доступна. Вердикт — out.ok.
(async ()=>{ const H=global.__H, path=__require('path'); window.__noAutoSave=true; window.__noWorkers=true; const out={}, checks={};
  const RS=__require(path.join(process.cwd(),'ikraster.js')), play=H.el('play'), st=()=>H.dbg().status;
  // трилистник сплошной кривой — 3 пересечения без разрывов
  const tre=[]; for(let i=0;i<1200;i++){ const t=i/1200*2*Math.PI; tre.push({x:450+95*(Math.sin(t)+2*Math.sin(2*t)), y:360+95*(Math.cos(t)-2*Math.cos(2*t))}); }
  H.el('clear').onclick();
  const ap=ikApply(ikRecognize(RS.raster({W:900, H:700, pts:tre, gaps:[], w:5, seed:4})));
  out.load={ok:ap.ok, nc:crossings.length, pending:pendingCount(), apPending:ap.pending, disabled:!!play.disabled, title:play.title, status:st()};
  checks.allPending=!!ap.ok && crossings.length===3 && pendingCount()===3 && ap.pending===3;
  checks.playDisabled=!!play.disabled && /white circle/.test(play.title||'');
  checks.statusAsks=/white circles/.test(st()) && !/det \d/.test(st());
  play.onclick(); out.clickPlay={running:H.running(), status:st()};
  checks.playRefuses=!H.running() && /choose over or under/.test(st());
  const c0=crossings[0], over0=c0.over;
  tryToggleCrossing({x:c0.x, y:c0.y});
  out.first={pending:c0.pending, over:c0.over, over0, left:pendingCount(), disabled:!!play.disabled, status:st()};
  checks.firstClickChooses=c0.pending===false && c0.over===over0 && pendingCount()===2 && !!play.disabled;
  tryToggleCrossing({x:c0.x, y:c0.y});
  checks.secondClickFlips=c0.over!==over0 && pendingCount()===2;
  for(const c of crossings.slice(1)) tryToggleCrossing({x:c.x, y:c.y});
  out.done={left:pendingCount(), disabled:!!play.disabled, title:play.title, status:st(), det:knotDet};
  checks.allSetEnables=pendingCount()===0 && !play.disabled && /all crossings set/.test(st());
  play.onclick(); out.run={running:H.running()}; checks.playStarts=H.running(); if(H.running()) play.onclick();
  // картинка с разрывами: пресет трилистника, у нижних прядей разрывы — белых кружков нет
  H.el('clear').onclick(); H.clickPreset('trefoil');
  const sm=smooth.map(p=>({x:p.x, y:p.y})); let minx=1e9, maxx=-1e9, miny=1e9, maxy=-1e9;
  for(const p of sm){ minx=Math.min(minx,p.x); maxx=Math.max(maxx,p.x); miny=Math.min(miny,p.y); maxy=Math.max(maxy,p.y); }
  const kI=Math.min(900*0.84/(maxx-minx), 700*0.84/(maxy-miny)), oxI=450-kI*(minx+maxx)/2, oyI=350-kI*(miny+maxy)/2;
  const ipts=sm.map(p=>({x:p.x*kI+oxI, y:p.y*kI+oyI})), gaps=crossings.map(c=>{ const su=(c.over==='A'? c.sB : c.sA)*kI; return {s0:su-11, s1:su+11}; });
  const ap2=ikApply(ikRecognize(RS.raster({W:900, H:700, pts:ipts, gaps, w:5, seed:5})));
  out.gapped={ok:ap2.ok, nc:crossings.length, pending:pendingCount(), disabled:!!play.disabled, status:st()};
  checks.gappedNoPending=!!ap2.ok && crossings.length===3 && pendingCount()===0 && !play.disabled && /press ▶ Physics/.test(st());
  H.el('clear').onclick(); H.clickPreset('figure8');
  checks.presetNoPending=pendingCount()===0 && !play.disabled;
  out.checks=checks; out.ok=Object.values(checks).every(Boolean);
  return out; })()
