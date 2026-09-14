// 3.4: узел по картинке — синтетические изображения известных диаграмм (пресеты и случайные) в разных стилях;
// проверка: число пересечений, над/под на месте каждого пересечения, определитель. IK_DEV=<папка> — ядро из черновых файлов.
// Запуск: node harness.js imgknot.js   (IK_STYLES=clean,sketch  IK_N=4,9,16  IK_SEEDS=3  IK_VERBOSE=1)
(async ()=>{ const H=global.__H, fs=__require('fs'), path=__require('path'), vm=__require('vm'); window.__noAutoSave=true;
  if(process.env.IK_DEV) for(const f of ['ik1.js','ik2.js','ik3.js','ik4.js','ik5.js']) vm.runInThisContext(fs.readFileSync(path.join(process.env.IK_DEV,f),'utf8'), {filename:f});
  const RS=__require(path.join(process.cwd(),'ikraster.js'));
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }
  const STY={ clean:{w:5, gapK:2.2}, thin:{w:2, gapK:4.5}, thick:{w:13, gapK:1.6}, touch1:{w:6, gapK:1.0, gapK2:2.6}, touch2:{w:6, gapK:0.8, alt:true},
    sketch:{w:4, wVar:0.3, gapK:2.8, wob:5, noise:10, light:0.35, blur:1, breaks:2, ink:[40,45,70], bg:[236,232,220]},
    nogap:{w:5, gapK:0, alt:true}, dark:{w:5, gapK:2.2, bg:[14,18,26], ink:[140,215,255]}, photo:{w:5, gapK:2.4, noise:14, light:0.7, blur:1, bg:[200,196,188], ink:[30,30,40]} };
  const styles=(process.env.IK_STYLES||Object.keys(STY).join(',')).split(','), Ns=(process.env.IK_N||'3,5,8,12,18,26').split(',').map(Number), nSeeds=+(process.env.IK_SEEDS||2);
  const cases=[]; for(const key of ['trefoil','figure8','cinquefoil','septafoil']) cases.push({key});
  for(const nc of Ns) for(let s=0;s<nSeeds;s++) cases.push({nc, seed:5000+nc*37+s*101});
  const out={}, fails=[];
  for(const st of styles){ const S=STY[st]; const agg={n:0, exact:0, countOK:0, detOK:0, overAll:0, overOK:0, ms:0, err:0};
    for(const cs of cases){ H.el('clear').onclick();
      if(cs.key) H.clickPreset(cs.key); else seeded(cs.seed, ()=>randomKnot(cs.nc));
      if(S.alt) assignAlternating();
      updateKnotType(); const gtDet=knotDet, sm=smooth.map(p=>({x:p.x,y:p.y}));
      let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9; for(const p of sm){ minx=Math.min(minx,p.x); maxx=Math.max(maxx,p.x); miny=Math.min(miny,p.y); maxy=Math.max(maxy,p.y); }
      const IW=900, IH=700, kI=Math.min(IW*0.84/(maxx-minx), IH*0.84/(maxy-miny)), oxI=IW/2-kI*(minx+maxx)/2, oyI=IH/2-kI*(miny+maxy)/2;
      let ipts=sm.map(p=>({x:p.x*kI+oxI, y:p.y*kI+oyI})), field=null; if(S.wob){ const wb=RS.wobble(ipts, S.wob, cs.seed||3); ipts=wb.pts; field=wb.field; }
      const cumW=RS.arcTable(ipts), toW=(s)=>{ let lo=0, hi=cumLen.length-1; while(lo<hi){ const mid=(lo+hi+1)>>1; if(cumLen[mid]<=s) lo=mid; else hi=mid-1; } const a=cumLen[lo], b=(lo+1<cumLen.length)? cumLen[lo+1] : totalLen2D, f=b-a>1e-9? (s-a)/(b-a) : 0; return cumW[lo]+f*(cumW[lo+1]-cumW[lo]); };   // позиция разрыва — по дуге САМОЙ (дрожащей) кривой картинки
      const gaps=[]; if(S.gapK>0) for(const c of crossings){ const su=toW(c.over==='A'? c.sB : c.sA), g=S.gapK*S.w, g2=(S.gapK2||S.gapK)*S.w; gaps.push({s0:su-g, s1:su+g2}); }   // gapK2: несимметричный разрыв (касание с одной стороны)
      const gt=crossings.map(c=>{ let x=c.x*kI+oxI, y=c.y*kI+oyI; if(field){ const d=field(x,y); x+=d.dx; y+=d.dy; } const o=c.over==='A'? c.dirA : c.dirB; return {x, y, ox:o.x, oy:o.y}; });
      const img=RS.raster({W:IW, H:IH, pts:ipts, gaps, w:S.w, wVar:S.wVar, bg:S.bg, ink:S.ink, noise:S.noise, light:S.light, blur:S.blur, breaks:S.breaks, seed:(cs.seed||17)+styles.indexOf(st)});
      let res=null, ap=null; const t0=Date.now();
      try{ res=ikRecognize(img); ap=ikApply(res); }catch(e){ agg.err++; fails.push({st, cs, err:String(e && e.stack || e).slice(0,300)}); continue; }
      agg.ms+=Date.now()-t0; agg.n++;
      const name=cs.key||('r'+cs.nc+'#'+cs.seed);
      if(!ap || !ap.ok){ fails.push({st, name, gt:gt.length, msg:(res&&res.msg)||(ap&&ap.msg)}); continue; }
      const got=crossings.map(c=>({x:c.x, y:c.y, o:c.over==='A'? c.dirA : c.dirB})), tol=Math.max(10, (2*S.w+8)*ap.k/res.f);
      let matched=0, ovOK=0, ovFlip=0; const usedG=new Set();
      for(const g of gt){ const gx=g.x/res.f*ap.k+ap.ox, gy=g.y/res.f*ap.k+ap.oy; let bi=-1, bd=tol; got.forEach((q,i)=>{ if(usedG.has(i)) return; const d=Math.hypot(q.x-gx,q.y-gy); if(d<bd){ bd=d; bi=i; } });
        if(bi<0) continue; usedG.add(bi); matched++; const dd=Math.abs(g.ox*got[bi].o.x+g.oy*got[bi].o.y); if(dd>0.6) ovOK++; else ovFlip++; }
      if(S.alt && ovFlip>ovOK){ const t=ovOK; ovOK=ovFlip; ovFlip=t; }   // чередование без подсказок — с точностью до зеркала
      const countOK=crossings.length===gt.length, detOK=knotDet===gtDet, exact=countOK && matched===gt.length && ovOK===gt.length && detOK;
      agg.countOK+=countOK; agg.detOK+=detOK; agg.exact+=exact; agg.overAll+=gt.length; agg.overOK+=ovOK;
      if(!exact) fails.push({st, name, gt:gt.length, got:crossings.length, matched, ovOK, det:[gtDet,knotDet], notes:res.notes, hw:+res.hw.toFixed(2)});
      if(process.env.IK_VERBOSE) console.error(st, name, 'gt', gt.length, 'got', crossings.length, 'm', matched, 'ov', ovOK, 'det', gtDet, knotDet, exact?'OK':'FAIL', JSON.stringify(res.notes), res.ms+'ms');
    }
    out[st]={n:agg.n, exact:agg.exact, countOK:agg.countOK, detOK:agg.detOK, overPct:+(100*agg.overOK/Math.max(1,agg.overAll)).toFixed(1), msAvg:Math.round(agg.ms/Math.max(1,agg.n)), err:agg.err};
    console.error(st, JSON.stringify(out[st])); }
  try{ fs.mkdirSync(path.join(process.cwd(),'out'),{recursive:true}); fs.writeFileSync(path.join(process.cwd(),'out','imgknot_fails.json'), JSON.stringify(fails,null,1)); }catch(e){}
  return {summary:out, fails:fails.slice(0,12)};
})()
