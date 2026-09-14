// ЮНИТ-ПРОВЕРКА ядра пар Wasm (test/wasm/pairs.wasm) против JS pairEval на реальных данных: узел после STEPS шагов, список Верле и ключи
// ячеек строятся функциями страницы; в ОТДЕЛЬНУЮ память копируются координаты/середины/силы изгиба/список; pairPass обязан дать
// бит-в-бит те же E, gmin, gminRep, gmin3 и силы, что energyGrad(true) (JS-путь: window.__noWasm=true). KNOTS=rand30,rand60 STEPS=300,1500
(async ()=>{ const H=global.__H; window.__noAutoSave=true; window.__noWasm=true; const out={};
  const fs=process.mainModule.require('fs'), path=process.mainModule.require('path');
  const bytes=fs.readFileSync(path.resolve(path.dirname(process.mainModule.filename),'wasm','pairs.wasm'));
  const mem=new WebAssembly.Memory({initial:64}); const {instance}=await WebAssembly.instantiate(bytes,{env:{memory:mem, abort(){ throw new Error('abort'); }}});
  const pairPass=instance.exports.pairPass;
  function seeded(seed, fn){ const orig=Math.random; let sd=seed; Math.random=()=>{ sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff; return sd/0x7fffffff; }; try{ return fn(); } finally{ Math.random=orig; } }
  const defs={ trefoil:{mk:()=>H.clickPreset('trefoil'), sl:[5,2,9]}, rand30:{mk:()=>{ let t=0; do{ randomKnot(30); }while(isUnknot && t++<30); }, sl:[3,1,9], seed:4343},
    rand60:{mk:()=>{ let t=0; do{ randomKnot(60); }while(isUnknot && t++<30); }, sl:[3,1,9], seed:4444} };
  const KNOTS=(process.env.KNOTS||'trefoil,rand30,rand60').split(','), STEPS=(process.env.STEPS||'300,1500').split(',').map(Number);
  const bitsEq=(a,b)=>{ const A=new Float64Array([a,b]); const I=new BigUint64Array(A.buffer); return I[0]===I[1]; };
  for(const name of KNOTS){ const d=defs[name]; if(!d) continue;
    for(const ST of STEPS){
      H.el('clear').onclick(); if(H.running()) H.play(); H.setSlider('thick',d.sl[0]); H.setSlider('repCoef',d.sl[1]); H.setSlider('bendCoef',d.sl[2]);
      const rec=seeded(d.seed||9001, ()=>{ d.mk(); H.set({ms:1}); H.play(); let o=null, st=0; while(st<ST){ o=H.step(100); st+=100; if(!o.running) break; }
        const n=N, hasKR=(_kRmul && _inflate>=1)? 1 : 0;
        // эталон JS: полный energyGrad (изгиб + пары)
        const ref=energyGrad(true); const refG3=_egLast3, refRep=_lastGminRep; const rfx=Float64Array.from(_fx), rfy=Float64Array.from(_fy), rfz=Float64Array.from(_fz);
        // изгиб отдельно: пустой список Верле (список уже построен и актуален; _vlStart подменяем на нули, потом возвращаем)
        const vlS=Int32Array.from(_vlStart), vlJ=Int32Array.from(_vlJ.subarray(0, _vlStart[n])); _vlStart.fill(0); const bend=energyGrad(true); _vlStart.set(vlS);
        const bfx=Float64Array.from(_fx), bfy=Float64Array.from(_fy), bfz=Float64Array.from(_fz);
        // те же константы, что в energyGrad
        const S=sExcl(), DC=TAIL_CUT*S, R=S+DC+1.5*L0, uU=unitLen()*_inflate, u4=uU*uU*uU*uU, tailU=u4/(DC*DC*DC*DC), tailF=4*u4/(DC*DC*DC*DC*DC), kR=kRep();
        // раскладка отдельной памяти
        let p=16; const f64=(k)=>{ const a=p; p+=8*k; return a; }, i32=(k)=>{ const a=p; p+=(4*k+7)&~7; return a; };
        const L={vx:f64(n),vy:f64(n),vz:f64(n),mx:f64(n),my:f64(n),mz:f64(n),fx:f64(n),fy:f64(n),fz:f64(n),kR:f64(n),gcX:i32(n),gcY:i32(n),gcZ:i32(n),ordK:i32(n),vlStart:i32(n+1),res:f64(4),vlJ:i32(vlJ.length)};
        if(mem.buffer.byteLength<p) mem.grow(Math.ceil((p-mem.buffer.byteLength)/65536));
        const B=mem.buffer, F=(off,k)=>new Float64Array(B,off,k), I=(off,k)=>new Int32Array(B,off,k);
        F(L.vx,n).set(_vx); F(L.vy,n).set(_vy); F(L.vz,n).set(_vz); F(L.mx,n).set(_mx); F(L.my,n).set(_my); F(L.mz,n).set(_mz);
        F(L.fx,n).set(bfx); F(L.fy,n).set(bfy); F(L.fz,n).set(bfz); if(hasKR) F(L.kR,n).set(_kRmul);
        I(L.gcX,n).set(_gcX.subarray(0,n)); I(L.gcY,n).set(_gcY.subarray(0,n)); I(L.gcZ,n).set(_gcZ.subarray(0,n)); I(L.vlStart,n+1).set(vlS); I(L.vlJ,vlJ.length).set(vlJ);
        const E=pairPass(n, 1, hasKR, L.vx,L.vy,L.vz, L.mx,L.my,L.mz, L.fx,L.fy,L.fz, L.gcX,L.gcY,L.gcZ, L.vlStart, L.vlJ, L.ordK, L.kR, L.res, S, DC, R, L0, kR, u4, tailU, tailF, bend.E);
        const res=F(L.res,4); const gmin=res[0], gminRep=res[1], gmin3=res[2], inf=res[3];
        const Ew=inf? Infinity : E; const g3w=(gmin3<=R*(1-1e-9)-Math.sqrt(_lmax2))? gmin3 : -1;
        const wfx=F(L.fx,n), wfy=F(L.fy,n), wfz=F(L.fz,n); let mism=0, maxd=0;
        for(let i=0;i<n;i++){ for(const [a,b] of [[rfx[i],wfx[i]],[rfy[i],wfy[i]],[rfz[i],wfz[i]]]){ if(!bitsEq(a,b)){ mism++; maxd=Math.max(maxd, Math.abs(a-b)); } } }
        let pairs=0; for(let i=0;i<n;i++){ for(let q=vlS[i];q<vlS[i+1];q++){ const j=vlJ[q]; const mdx=_mx[j]-_mx[i], mdy=_my[j]-_my[i], mdz=_mz[j]-_mz[i]; if(mdx*mdx+mdy*mdy+mdz*mdz<=R*R) pairs++; } }
        return {N:n, steps:st, hasKR, inflate:+(+_inflate).toFixed(4), listLen:vlJ.length, spherePairs:pairs, E_js:ref.E, E_wasm:Ew, E_eq:bitsEq(ref.E,Ew),
          gmin_eq:bitsEq(ref.gmin,gmin), gminRep_eq:bitsEq(refRep,gminRep) && bitsEq(ref.gminRep,gminRep), gmin3_eq:bitsEq(refG3,g3w), gmin3:g3w, forceMismatch:mism, forceMaxDiff:maxd,
          ok:bitsEq(ref.E,Ew) && bitsEq(ref.gmin,gmin) && bitsEq(ref.gminRep,gminRep) && bitsEq(refG3,g3w) && mism===0}; });
      out[name+'@'+ST]=rec; console.error(name+'@'+ST, JSON.stringify(rec)); } }
  out.allOk=Object.keys(out).every(k=>out[k].ok); return out; })()
