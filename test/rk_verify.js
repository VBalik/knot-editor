// ПРОВЕРКА ТОПОЛОГИИ кампании randknots: робастный определитель (мода по 15
// случайным проекциям) для стартового лифта и для финальной формы; зазор финала.
(async ()=>{
  const H=global.__H; window.__noAutoSave=true;
  const fs=global.__require('fs'), vm=global.__require('vm');
  vm.runInThisContext(fs.readFileSync('rk_gen.js','utf8'));
  const RK=global.__RK;
  const W=+(process.env.WORKER||0), NW=+(process.env.WORKERS||1), DIR=process.env.DIR;
  const TOTAL=+(process.env.TOTAL||100), baseSeed=+(process.env.SEED||20260903);
  const finals={};
  for(let w=0;w<NW;w++){ const p=DIR+'/rk_w'+w+'.verts.jsonl'; if(!fs.existsSync(p)) continue;
    for(const l of fs.readFileSync(p,'utf8').split('\n')){ if(!l.trim()) continue; const o=JSON.parse(l); finals[o.i]=o; } }
  let rs=99; const rr=()=>{ rs=(rs*1103515245+12345)&0x7fffffff; return rs/0x7fffffff; };
  function robustDet(V){ const vals=[]; const n=V.length;
    for(let k=0;k<5;k++){
      // случайный поворот (Родригес)
      const ax=rr()-0.5, ay=rr()-0.5, az=rr()-0.5, al=Math.hypot(ax,ay,az)||1, ux=ax/al,uy=ay/al,uz=az/al, th=rr()*Math.PI, c=Math.cos(th), s=Math.sin(th), mc=1-c;
      const R=[[c+ux*ux*mc, ux*uy*mc-uz*s, ux*uz*mc+uy*s],[uy*ux*mc+uz*s, c+uy*uy*mc, uy*uz*mc-ux*s],[uz*ux*mc-uy*s, uz*uy*mc+ux*s, c+uz*uz*mc]];
      const A=V.map(p=>[R[0][0]*p[0]+R[0][1]*p[1]+R[0][2]*p[2], R[1][0]*p[0]+R[1][1]*p[1]+R[1][2]*p[2], R[2][0]*p[0]+R[2][1]*p[1]+R[2][2]*p[2]]);
      window.__knotSetVertsRaw(A);
      for(const d of window.__knotDetProj()) vals.push(d);
    }
    window.__knotSetVertsRaw(V);
    const ok=vals.filter(x=>x!==null && isFinite(x)); const cnt={}; for(const x of ok) cnt[x]=(cnt[x]||0)+1;
    let mode=null, mc=0; for(const k in cnt){ if(cnt[k]>mc){ mc=cnt[k]; mode=+k; } }
    return {mode, agree:mc, valid:ok.length, total:vals.length, vals:ok.slice(0,15)};
  }
  const out=[];
  for(let i=0;i<TOTAL;i++){ if(i%NW!==W) continue;
    let seed=(baseSeed+i*7919)&0x7fffffff; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
    const target=10+Math.round(90*i/(TOTAL-1)); const rec={i, target};
    try{
      let best=null;
      for(let att=0; att<70; att++){
        let K=Math.round(Math.sqrt(target/0.27))+Math.floor(rnd()*3)-1; K=Math.max(4, Math.min(32, K));
        const p=0.25+0.15*rnd();
        const pts=RK.fourier(rnd,K,p); const off=RK.countCross(pts);
        if(att<60 && Math.abs(off-target)>Math.max(3, 0.15*target)) continue;
        const st=RK.bestStart(pts, 60); if(att<60 && st.clearance<25) continue;
        document.getElementById('clear').onclick(); RK.drawPts(H, pts, st.idx);
        const d=H.dbg(); const nc=d.crossings?d.crossings.length:0; if(!d.N || nc<1) continue;
        const err=Math.abs(nc-target);
        if(!best || err<best.err) best={err, nc, K, p, att, clearance:st.clearance, pts, start:st.idx};
        if(err<=Math.max(2, 0.1*target)) break;
      }
      document.getElementById('clear').onclick(); RK.drawPts(H, best.pts, best.start);
      let d=H.dbg(); const nc=d.crossings.length;
      for(let b=0;b<nc;b++){ const want=rnd()<0.5?'A':'B'; const cs=H.dbg().crossings; if(cs[b] && cs[b].over!==want) H.pointer('pointerdown', cs[b].x, cs[b].y); }
      d=H.dbg(); rec.nc=nc; rec.N=d.N; rec.det2d=d.knotDet;
      const V0=H.verts().map(p=>p.slice());
      rec.start=robustDet(V0);
      const f=finals[i]; if(!f) throw new Error('нет финальных вершин');
      if(f.verts.length!==d.N) throw new Error('N не совпал: '+f.verts.length+' vs '+d.N);
      window.__knotSetVertsRaw(f.verts);
      rec.gapEndD = (typeof minSegGap==='function') ? +(minSegGap()/(1.6*L0)).toFixed(3) : null;
      rec.end=robustDet(f.verts);
      rec.liftFaithful = rec.start.mode===rec.det2d;
      rec.topoPreserved = rec.start.mode!==null && rec.start.mode===rec.end.mode;
    }catch(e){ rec.err=String(e&&e.message||e); }
    out.push(rec);
  }
  return out;
})()
