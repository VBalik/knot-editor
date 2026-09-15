// 4.0: 50 шумных скетчей узлов на разной бумаге (мятая, грязная, клетчатая, линованная, крафт, доска)
// → файлы .png/.jpg + манифест out/sketches/manifest.json (эталон: пересечения, над/под, определитель).
// Запуск: cd test && node harness.js sketchgen.js     (SK_DIR=<папка>, SK_N=<сколько>, SK_ONLY=<имя>)
(async ()=>{ const H=global.__H, fs=__require('fs'), path=__require('path'); window.__noAutoSave=true;
  const RS=__require(path.join(process.cwd(),'ikraster.js')), PP=__require(path.join(process.cwd(),'ikpaper.js'));
  const mod=(n)=>__require(path.join(process.cwd(),'node_modules',n));
  const dir=process.env.SK_DIR||path.join(process.cwd(),'out','sketches'); fs.mkdirSync(dir,{recursive:true});
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ fn(); } finally{ Math.random=orig; } }

  const PAPERS=[   // бумага: цвет, волокна, разлиновка, пятна, соринки, помятость
    {id:'plain',   paper:[250,249,245], fiber:5},
    {id:'grid',    paper:[239,235,223], fiber:7,  grid:{step:19, w:1.5, color:[152,168,178], a:0.5, angle:0.01}},
    {id:'gridblue',paper:[245,245,241], fiber:5,  grid:{step:25, w:1.2, color:[120,150,192], a:0.55, angle:-0.02}},
    {id:'ruled',   paper:[247,245,236], fiber:6,  rules:{step:27, w:1.4, color:[128,160,196], a:0.6, angle:0.012}, margin:{x:0.11, w:1.8, color:[204,112,112], a:0.6}},
    {id:'dots',    paper:[249,247,241], fiber:5,  dotgrid:{step:22, r:1.1, color:[150,150,162], a:0.6}},
    {id:'kraft',   paper:[197,167,125], fiber:12},
    {id:'aged',    paper:[233,217,181], fiber:9,  stains:{n:5, a:0.28, col:[150,120,80]}},
    {id:'crumpled',paper:[241,239,231], fiber:7,  crumple:{amp:0.17, folds:5}},
    {id:'dirty',   paper:[234,229,215], fiber:9,  stains:{n:6, a:0.42, col:[118,94,64]}, specks:{n:110}},
    {id:'napkin',  paper:[248,247,244], fiber:15, blur:1},
    {id:'crumgrid',paper:[236,232,220], fiber:8,  grid:{step:21, w:1.4, color:[160,132,136], a:0.45, angle:0.03}, crumple:{amp:0.13, folds:3}},
    {id:'dirtgrid',paper:[231,226,210], fiber:9,  grid:{step:18, w:1.3, color:[150,160,170], a:0.5, angle:-0.015}, stains:{n:4, a:0.35, col:[124,100,70]}, specks:{n:70}, marks:{n:3, w:3.5, a:0.75}},
    {id:'board',   paper:[27,29,35],    fiber:6,  dark:true},
  ];
  const PENS=[   // перо: толщина (для кадра 900×700), разброс, цвет, прозрачность, размер разрыва, разрывы пера
    {id:'gel',    w:5.5, wVar:0.12, ink:[28,30,38],  alpha:0.96, gapK:2.2},
    {id:'ball',   w:3.6, wVar:0.30, ink:[42,58,140], alpha:0.90, gapK:2.7, breaks:2},
    {id:'pencil', w:4.4, wVar:0.35, ink:[96,96,102], alpha:0.74, gapK:2.4, breaks:3, dbl:{dx:1.3, dy:-0.9, a:0.45}},
    {id:'marker', w:11,  wVar:0.15, ink:[30,35,45],  alpha:0.98, gapK:1.8},
    {id:'fine',   w:2.5, wVar:0.20, ink:[22,22,28],  alpha:0.95, gapK:4.0, breaks:1},
    {id:'red',    w:5.0, wVar:0.20, ink:[172,42,46], alpha:0.94, gapK:2.3, ghost:{w:1.5, dx:1.6, dy:-1.2, a:0.35, color:[120,120,126]}},
    {id:'chalk',  w:9.0, wVar:0.40, ink:[232,236,244],alpha:0.85, gapK:2.0, breaks:4},
  ];
  const CARE=[   // аккуратность руки и качество съёмки: увод формы (wob), дрожание (shake), свет, шум, JPEG
    {id:'neat',   wob:0,  shake:0.6, noise:4,  blur:0, persp:0,    light:0.12, vignette:0.12, shadow:0,    jpeg:0},
    {id:'ok',     wob:3,  shake:1.6, noise:9,  blur:1, persp:0.02, light:0.26, vignette:0.28, shadow:0.18, jpeg:88},
    {id:'rough',  wob:6,  shake:2.8, noise:13, blur:1, persp:0.05, light:0.38, vignette:0.42, shadow:0.3,  jpeg:76},
    {id:'sloppy', wob:10, shake:4.5, noise:17, blur:2, persp:0.08, light:0.48, vignette:0.52, shadow:0.4,  jpeg:62},
  ];
  const KNOTS=[{key:'trefoil'},{key:'figure8'},{key:'cinquefoil'},{key:'septafoil'},{nc:3},{nc:4},{nc:5},{nc:6},{nc:7},{nc:8},{nc:9},{nc:10},{nc:12},{nc:14},{nc:16},{nc:18},{nc:20},{nc:24}];
  const SIZES=[[900,700],[1100,850],[1280,960],[1500,1120],[1600,1200]];

  const N=+(process.env.SK_N||50), S0=+(process.env.SK_SEED0||9000), OF=+(process.env.SK_OFF||0), man=[];   // SK_SEED0/SK_OFF — независимая проверочная партия (другие узлы, шум и сочетания)
  for(let i=OF;i<OF+N;i++){
    let pa=PAPERS[i%PAPERS.length]; const care=CARE[(i*3)%CARE.length], kn=KNOTS[i%KNOTS.length], sz=SIZES[i%SIZES.length];
    let pen=PENS[(i*5)%PENS.length];
    if(pa.dark && pen.id!=='chalk') pen=PENS[6]; else if(!pa.dark && pen.id==='chalk') pen=PENS[(i*5+1)%6];   // мел — только на тёмной доске
    const seed=S0+i*137, name=('s'+(i<10?'0':'')+i)+'_'+pa.id+'_'+pen.id+'_'+care.id+'_'+(kn.key||('r'+kn.nc)), W=sz[0], Hh=sz[1];
    if(process.env.SK_ONLY && name.indexOf(process.env.SK_ONLY)<0) continue;
    H.el('clear').onclick();
    if(kn.key) H.clickPreset(kn.key); else seeded(seed, ()=>randomKnot(kn.nc));
    updateKnotType(); const gtDet=knotDet, sm=smooth.map(p=>({x:p.x, y:p.y}));
    let minx=1e9, maxx=-1e9, miny=1e9, maxy=-1e9; for(const p of sm){ if(p.x<minx)minx=p.x; if(p.x>maxx)maxx=p.x; if(p.y<miny)miny=p.y; if(p.y>maxy)maxy=p.y; }
    const span=Math.max(maxx-minx, maxy-miny)||1, nrm=(p)=>[(p.x-minx)/span, (p.y-miny)/span];   // в [0,1]² с сохранением пропорций
    const R=RS.rng(seed), PR=PP.persp(care.persp, R), wp=sm.map(p=>{ const u=nrm(p); return PR.fwd(u[0],u[1]); });
    let ux0=1e9, ux1=-1e9, uy0=1e9, uy1=-1e9; for(const q of wp){ if(q[0]<ux0)ux0=q[0]; if(q[0]>ux1)ux1=q[0]; if(q[1]<uy0)uy0=q[1]; if(q[1]>uy1)uy1=q[1]; }
    const mg=0.06+0.06*R(), k=Math.min(W*(1-2*mg)/Math.max(1e-6,ux1-ux0), Hh*(1-2*mg)/Math.max(1e-6,uy1-uy0)), ox=W/2-k*(ux0+ux1)/2, oy=Hh/2-k*(uy0+uy1)/2;
    const sc=Math.min(W/900, Hh/700), fit=(q)=>({x:q[0]*k+ox, y:q[1]*k+oy});
    let ipts=wp.map(fit);
    if(care.wob) ipts=RS.wobble(ipts, care.wob*sc, seed+7).pts;                       // увод формы: плавное поле смещений
    if(care.shake) ipts=PP.shake(ipts, {amp:care.shake*sc, modes:5, wl0:16*sc, wl1:150*sc}, seed+11);   // дрожание руки вдоль штриха
    const pw=pen.w*sc, cumW=RS.arcTable(ipts);
    const toW=(s)=>{ let lo=0, hi=cumLen.length-1; while(lo<hi){ const mid=(lo+hi+1)>>1; if(cumLen[mid]<=s) lo=mid; else hi=mid-1; }
      const a=cumLen[lo], b=(lo+1<cumLen.length)? cumLen[lo+1] : totalLen2D, f=b-a>1e-9? (s-a)/(b-a) : 0; return cumW[lo]+f*(cumW[lo+1]-cumW[lo]); };
    const gaps=[]; for(const c of crossings){ const su=toW(c.over==='A'? c.sB : c.sA), g=pen.gapK*pw*(0.8+0.4*R()); gaps.push({s0:su-g, s1:su+g}); }   // разрыв нижней пряди, размер «от руки»
    // эталон берём с ГОТОВОЙ кривой картинки (перспектива, увод и дрожание уже в ней): точка — середина между прядями, направление — касательная верхней пряди
    const np=ipts.length, at=(s)=>{ let lo=0, hi=cumLen.length-1; while(lo<hi){ const mid=(lo+hi+1)>>1; if(cumLen[mid]<=s) lo=mid; else hi=mid-1; }
      const a=cumLen[lo], b=(lo+1<cumLen.length)? cumLen[lo+1] : totalLen2D, f=b-a>1e-9? (s-a)/(b-a) : 0, p0=ipts[lo%np], p1=ipts[(lo+1)%np];
      return {x:p0.x+(p1.x-p0.x)*f, y:p0.y+(p1.y-p0.y)*f, i:lo}; };
    const tanAt=(s)=>{ const q=at(s), a=ipts[(q.i-2+np)%np], b=ipts[(q.i+3)%np], L=Math.hypot(b.x-a.x, b.y-a.y)||1; return {x:(b.x-a.x)/L, y:(b.y-a.y)/L}; };
    const gt=crossings.map(c=>{ const pa=at(c.sA), pb=at(c.sB), t=tanAt(c.over==='A'? c.sA : c.sB);
      return {x:+((pa.x+pb.x)/2).toFixed(2), y:+((pa.y+pb.y)/2).toFixed(2), ox:+t.x.toFixed(4), oy:+t.y.toFixed(4)}; });
    const kb=[Math.min(...ipts.map(p=>p.x))-40*sc, Math.min(...ipts.map(p=>p.y))-40*sc, Math.max(...ipts.map(p=>p.x))+40*sc, Math.max(...ipts.map(p=>p.y))+40*sc];
    const style={paper:pa.paper, fiber:pa.fiber, grid:pa.grid && Object.assign({}, pa.grid, {step:pa.grid.step*sc, w:pa.grid.w*sc}),
      rules:pa.rules && Object.assign({}, pa.rules, {step:pa.rules.step*sc, w:pa.rules.w*sc}), margin:pa.margin && Object.assign({}, pa.margin, {w:pa.margin.w*sc}),
      dotgrid:pa.dotgrid && Object.assign({}, pa.dotgrid, {step:pa.dotgrid.step*sc, r:pa.dotgrid.r*sc}),
      stains:pa.stains, specks:pa.specks && {n:Math.round(pa.specks.n*sc)}, marks:pa.marks && Object.assign({}, pa.marks, {keep:kb, w:pa.marks.w*sc}),
      crumple:pa.crumple, ink:pen.ink, alpha:pen.alpha, w:pw, wVar:pen.wVar, breaks:pen.breaks,
      dbl:pen.dbl && {w:pw*0.55, dx:pen.dbl.dx*sc, dy:pen.dbl.dy*sc, a:pen.dbl.a}, ghost:pen.ghost && Object.assign({}, pen.ghost, {w:pen.ghost.w*sc, dx:pen.ghost.dx*sc, dy:pen.ghost.dy*sc}),
      light:care.light, vignette:care.vignette, shadow:care.shadow, noise:care.noise, blur:Math.max(care.blur, pa.blur||0)};
    const t0=Date.now(), img=PP.sketch({W, H:Hh, pts:ipts, gaps, style, seed:seed+3});
    let file;
    if(care.jpeg){ file=name+'.jpg'; const j=mod('jpeg-js').encode({data:Buffer.from(img.data.buffer), width:img.width, height:img.height}, care.jpeg); fs.writeFileSync(path.join(dir,file), j.data); }
    else { file=name+'.png'; const PNG=mod('pngjs').PNG, p=new PNG({width:img.width, height:img.height}); p.data=Buffer.from(img.data.buffer); fs.writeFileSync(path.join(dir,file), PNG.sync.write(p)); }
    man.push({file, name, paper:pa.id, pen:pen.id, care:care.id, knot:kn.key||('r'+kn.nc), W, H:Hh, pw:+pw.toFixed(2), det:gtDet, nc:crossings.length, gt});
    console.error(name, crossings.length+'x', 'det', gtDet, (Date.now()-t0)+'ms');
  }
  fs.writeFileSync(path.join(dir,'manifest.json'), JSON.stringify(man,null,1));
  return {dir, n:man.length, papers:[...new Set(man.map(m=>m.paper))].length, pens:[...new Set(man.map(m=>m.pen))].length, crossings:man.map(m=>m.nc)};
})()
