// ФИЗИЧЕСКАЯ ЭКСПЕРТИЗА каждого узла кампании (закон жёсткого ядра + 1/Δ⁴):
// по финальным вершинам — жёсткость длин, зазор к ядру, контакты, кривизна
// против радиуса ядра, нижняя граница Милнора, топология (точный инвариант).
const fs=require('fs'), path=require('path');
const gsrc=fs.readFileSync(path.join(__dirname,'rk_gaps.js'),'utf8').split('const out=[];')[0].replace("const fs=require('fs'), path=require('path'); const DIR=process.argv[2];",""); eval(gsrc);
const DIR=process.argv[2];
const R={}, V={}, E={};
for(const f of fs.readdirSync(DIR)){
  if(/^rk_w\d\.jsonl$/.test(f)) for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(l.trim()){ const r=JSON.parse(l); R[r.i]=r; } }
  if(/^rk_w\d\.verts\.jsonl$/.test(f)) for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){ if(l.trim()){ const r=JSON.parse(l); V[r.i]=r; } }
  if(/^exact2_w\d\.json$/.test(f)) for(const r of JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'))) E[r.i]=r;
}
const out=[];
for(const i of Object.keys(R).map(Number).sort((a,b)=>a-b)){
  const r=R[i], v=V[i]; if(!v || r.err){ out.push({i, err:r.err||'нет вершин'}); continue; }
  const P=v.verts, N=P.length, L0=v.L0, s=r.sL0*L0, D=r.DL0*L0;
  // длины рёбер
  let lenErr=0; for(let k=0;k<N;k++){ const a=P[k], b=P[(k+1)%N]; lenErr=Math.max(lenErr, Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])-L0)/L0); }
  // кривизна: углы; κ ≈ θ/L0; предел ядра: радиус ≥ ~s/2 ⇒ κ·s ≤ 2 (арк-фильтр допускает ~1.4)
  let thMax=0, thSum=0, bE=0; const ths=[];
  for(let k=0;k<N;k++){ const a=P[(k-1+N)%N], b=P[k], c=P[(k+1)%N]; const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], w=[c[0]-b[0],c[1]-b[1],c[2]-b[2]];
    const cr=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]; const th=Math.atan2(Math.hypot(...cr), u[0]*w[0]+u[1]*w[1]+u[2]*w[2]); ths.push(th); thSum+=th; bE+=th*th; if(th>thMax) thMax=th; }
  if(r.bE!==undefined){ bE=r.bE; }              // живые значения прогона (дамп вершин округлён до 1e-3)
  if(r.maxAng!==undefined){ thMax=r.maxAng*Math.PI/180; }
  const kappaS=thMax/L0*s;                      // максимальная кривизна в единицах 1/s
  // зазоры: минимум и число контактных пар (Δ < D) среди несмежных (cd>2)
  let gmin=Infinity, contacts=0, near=0;
  for(let a=0;a<N;a++){ for(let b=a+3;b<N;b++){ if(N-(b-a)<=2) continue; const d=segDist(P[a],P[(a+1)%N],P[b],P[(b+1)%N]); if(d<gmin) gmin=d; if(d<s+D) contacts++; if(d<s+3*D) near++; } }
  const nontriv = r.runDet!==1 && !r.runUnknot;
  const milnor = nontriv ? 16*Math.PI*Math.PI/N : 4*Math.PI*Math.PI/N;   // Σθ² ≥ (Σθ)²/N, Σθ ≥ 4π для нетривиального (Милнор/Фари)
  const ex=E[i]; const topo = ex ? (ex.feas.mode===ex.final.mode && ex.final.mode===String(r.det2d)) : null;
  const lenErrLive = (r.lenErr!==undefined)? +r.lenErr : lenErr;   // дамп вершин округлён до 1e-3 — берём ошибку длин из прогона
  const checks={
    rigid: lenErrLive<1e-6,                          // струна нерастяжима
    core: gmin>s,                                 // ядро не нарушено (x > s всюду)
    bend: kappaS<=2.0,                            // не согнута круче радиуса ядра
    milnor: bE>=milnor*0.999,                     // нижняя граница полной кривизны
    settled: !!r.settled && !r.jammed,
    balance: r.fRel!==null && r.fRel<0.02*4*Math.PI/N*1.0001,
    topo: topo===true,
    mono: r.eViol===0,
    circle: !r.runUnknot || /circle/.test(r.status),
    drift: r.driftL0===undefined || r.driftL0<0.5,
  };
  let verdict, why=[];
  if(!checks.rigid) why.push('рёбра не равны ('+lenErrLive.toExponential(1)+')');
  if(!checks.core) why.push('нарушено ядро: зазор '+(gmin/s).toFixed(3)+'·s');
  if(!checks.bend) why.push('изгиб круче ядра: κ·s='+kappaS.toFixed(2));
  if(!checks.milnor) why.push('энергия ниже границы Милнора — топология?');
  if(!checks.topo) why.push('тип узла: лифт/старт/финал расходятся');
  if(!checks.mono) why.push('энергия росла после надувания');
  if(!checks.circle) why.push('тривиальный узел не стал окружностью');
  if(!checks.drift) why.push('дрейф после возобновления '+r.driftL0+'·L0');
  if(why.length) verdict='НАРУШЕНИЕ';
  else if(r.jammed) verdict='заклинен: нить не помещается';
  else if(!r.settled) verdict='не сел за бюджет';
  else verdict='физично';
  out.push({i, nc:r.nc, N, det:r.det2d, w:r.w, r:r.r, sL0:r.sL0, DL0:r.DL0, steps:r.steps, wallS:r.wallS, settled:r.settled, jammed:r.jammed, inflateEnd:r.inflateEnd,
    bE:+bE.toFixed(3), milnor:+milnor.toFixed(3), bEoverMilnor:+(bE/milnor).toFixed(2), thMaxDeg:+(thMax*180/Math.PI).toFixed(1), ratio:+((r.ratio!==undefined)? r.ratio : thMax/(thSum/N)).toFixed(2), kappaS:+kappaS.toFixed(2), quietBy:r.quietBy||'', stoppedAgain:r.stoppedAgain,
    gminS:+(gmin/s).toFixed(3), gminD:+((gmin-s)/D).toFixed(2), contacts, near, lenErr:+lenErrLive.toExponential(1), fRel:r.fRel, driftL0:r.driftL0, rvar:r.rvar, topo, checks, verdict, why});
}
fs.writeFileSync(path.join(DIR,'phys.json'), JSON.stringify(out));
const cnt={}; for(const o of out){ cnt[o.verdict||'err']=(cnt[o.verdict||'err']||0)+1; }
console.log('вердикты:', JSON.stringify(cnt));
for(const o of out) if(o.verdict==='НАРУШЕНИЕ' || o.err) console.log('  i='+o.i, o.err||('nc='+o.nc+' '+o.why.join('; ')));
const q=(a,p)=>{ a=a.filter(x=>x!=null).sort((x,y)=>x-y); return a[Math.min(a.length-1,Math.floor(p*a.length))]; };
const ok=out.filter(o=>!o.err);
console.log('gmin/s p10/p50/p90:', q(ok.map(o=>o.gminS),.1), q(ok.map(o=>o.gminS),.5), q(ok.map(o=>o.gminS),.9), '| κ·s p50/max:', q(ok.map(o=>o.kappaS),.5), Math.max(...ok.map(o=>o.kappaS)), '| bE/Milnor p50/p90:', q(ok.map(o=>o.bEoverMilnor),.5), q(ok.map(o=>o.bEoverMilnor),.9), '| contacts p50/max:', q(ok.map(o=>o.contacts),.5), Math.max(...ok.map(o=>o.contacts)), '| lenErr max:', Math.max(...ok.map(o=>o.lenErr)));
