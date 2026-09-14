// Безголовый стенд index.html: Node + three@0.128 + DOM-моки.
// Запуск: node harness.js <тест.js>   (тест — модуль-выражение, его результат
// печатается как JSON). Хелперы — в global.__H.
// ВАЖНО (уроки прошлого стенда): setPointerCapture БРОСАЕТ на синтетическом
// pointerId (как настоящий браузер); getElementById авто-создаёт элементы —
// поэтому отсутствие кнопки тест НЕ ловит, это известная слепая зона.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PAGE = (()=>{ if(process.env.KNOT_PAGE) return path.resolve(__dirname, "..", process.env.KNOT_PAGE);   // KNOT_PAGE=stir.html — другой файл программы (лаборатория Stir)
  const a=path.join(__dirname,'..','index.html'), b=path.join(__dirname,'..','knot_editor.html');
  return fs.existsSync(a)? a : b; })();   // 2.25: файл программы — index.html (прежнее имя knot_editor.html — запасной вариант)

// ---------- DOM-моки ----------
function makeClassList(){ const s=new Set();
  return { add:(...a)=>a.forEach(x=>s.add(x)), remove:(...a)=>a.forEach(x=>s.delete(x)),
    toggle:x=>s.has(x)?s.delete(x):s.add(x), contains:x=>s.has(x) }; }

function makeCtx2d(){
  const noop=()=>{};
  return new Proxy({ measureText:()=>({width:10}), createLinearGradient:()=>({addColorStop:noop}),
    getImageData:()=>({data:[]}), canvas:{} },
    { get:(t,k)=> (k in t)? t[k] : noop, set:()=>true });
}

const elements = new Map();
function makeEl(id){
  const listeners = {};
  const el = {
    id, value:'', textContent:'', innerHTML:'', checked:false,
    width:800, height:600, clientWidth:800, clientHeight:600, style:{}, dataset:{},
    classList: makeClassList(),
    attrs: {},
    onclick:null, oninput:null, onchange:null,
    parentElement: null,
    addEventListener:(t,f)=>{ (listeners[t]=listeners[t]||[]).push(f); },
    removeEventListener:()=>{},
    dispatch:(t,ev)=>{ for(const f of (listeners[t]||[])) f(ev); },
    dispatchEvent(ev){ this.dispatch(ev.type, ev); return true; },
    click(){ this.onclick && this.onclick(); },
    getAttribute(k){ return this.attrs[k]; },
    setAttribute(k,v){ this.attrs[k]=v; },
    getBoundingClientRect:()=>({left:0, top:0, width:800, height:600, right:800, bottom:600}),
    getContext:()=>makeCtx2d(),
    appendChild:()=>{}, remove:()=>{}, focus:()=>{},
    setPointerCapture(){ const e=new Error('NotFoundError: synthetic pointer'); e.name='NotFoundError'; throw e; },
    releasePointerCapture(){},
  };
  el.parentElement = { appendChild:()=>{}, getBoundingClientRect:el.getBoundingClientRect, clientWidth:800, clientHeight:600 };
  return el;
}
function getEl(id){ if(!elements.has(id)) elements.set(id, makeEl(id)); return elements.get(id); }

// пресет-кнопки должны существовать ДО eval: страница вешает onclick через
// querySelectorAll('button.ex') и getAttribute('data-knot')
const presetBtns = ['trefoil','figure8','cinquefoil','septafoil'].map(k=>{
  const el=makeEl('preset-'+k); el.attrs['data-knot']=k; return el; });

const documentMock = {
  getElementById: getEl,
  createElement: (tag)=>makeEl('created-'+tag+'-'+Math.random().toString(36).slice(2)),
  querySelectorAll: (sel)=> sel==='button.ex' ? presetBtns : [],
  addEventListener: ()=>{},
  documentElement: makeEl('documentElement'),
  body: { appendChild:()=>{}, removeChild:()=>{} },
};

// ---------- окружение ----------
const sandbox = global;           // работаем в глобальном контексте node
// в Node 24 часть глобалей (navigator и др.) — getter-only: перекрываем defineProperty
function def(name, value){
  try { Object.defineProperty(sandbox, name, { value, writable:true, configurable:true }); }
  catch(_) { try { sandbox[name]=value; } catch(__){} }
}
def('window', sandbox);
def('addEventListener', ()=>{});            // window.addEventListener (window===global)
def('removeEventListener', ()=>{});
def('document', documentMock);
def('navigator', { userAgent:'node-harness' });
def('location', { protocol:'file:', href:'file:///harness', host:'' });
def('getComputedStyle', ()=>({ getPropertyValue:()=>'#88aabb' }));
def('requestAnimationFrame', ()=>0);        // animate() не зацикливаем: шаги руками
def('cancelAnimationFrame', ()=>{});
def('URL', { createObjectURL:()=>'blob:harness', revokeObjectURL:()=>{} });
def('Blob', function(parts){ this.parts=parts; });
def('indexedDB', undefined);                // тихий путь сохранения отключён
def('ResizeObserver', undefined);
def('fetch', async ()=>{ throw new Error('fetch disabled in harness'); });
def('alert', ()=>{}); def('confirm', ()=>true);
def('PointerEvent', class PointerEvent {
  constructor(type, init){ this.type=type; Object.assign(this, init||{}); }
});

// three + заглушки рендера
const THREE = require('three');
sandbox.THREE = THREE;
THREE.WebGLRenderer = class {
  constructor(){ this.domElement=makeEl('gl-canvas'); this.shadowMap={enabled:false};
    this.outputEncoding=0; }
  setSize(){} setPixelRatio(){} setClearColor(){} render(){} dispose(){}
};
THREE.OrbitControls = class {
  constructor(){ this.target=new THREE.Vector3(); this.enableDamping=false; }
  update(){}
};

// ---------- страница ----------
const html = fs.readFileSync(PAGE,'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(!scripts.length){ console.error('no inline <script> found'); process.exit(1); }
for(const code of scripts){
  vm.runInThisContext(code, { filename:'index.inline.js' });
}

// ---------- хелперы ----------
function bendE(){
  const V = window.__knotVerts(); const n=V.length; let e=0;
  for(let i=0;i<n;i++){
    const a=V[(i-1+n)%n], b=V[i], c=V[(i+1)%n];
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2], vx=c[0]-b[0],vy=c[1]-b[1],vz=c[2]-b[2];
    const cx=uy*vz-uz*vy, cy=uz*vx-ux*vz, cz=ux*vy-uy*vx;
    const th=Math.atan2(Math.hypot(cx,cy,cz), ux*vx+uy*vy+uz*vz);
    e+=th*th;
  }
  return e;
}
const H = {
  el: getEl,
  dbg: ()=>window.__knotDebug(),
  verts: ()=>window.__knotVerts(),
  log: ()=>window.__knotLog(),
  set: (o)=>window.__knotSet(o),
  step: (n)=>window.__knotStep(n),
  running: ()=>window.__knotDebug().running,
  play: ()=>{ getEl('play').onclick(); },
  bE: bendE,
  det3d: ()=>{ const v=window.__knotDetProj().filter(x=>x!==null).sort((a,b)=>a-b);
    return v.length? v[Math.floor(v.length/2)] : null; },
  setSlider: (id,v)=>{ const el=getEl(id); el.value=String(v); el.oninput&&el.oninput(); },
  clickPreset: (key)=>{ const b=presetBtns.find(x=>x.attrs['data-knot']===key); b.onclick(); },
  pointer: (type,x,y)=>{ getEl('draw').dispatch(type, {clientX:x, clientY:y, pointerId:7, preventDefault:()=>{}, button:0}); },
  drawCurve: (fn,n)=>{
    const cv=getEl('draw');
    const p0=fn(0);
    cv.dispatch('pointerdown', {clientX:p0.x, clientY:p0.y, pointerId:7, preventDefault:()=>{}, button:0});
    for(let i=1;i<=n;i++){
      const p=fn(i/n);
      cv.dispatch('pointermove', {clientX:p.x, clientY:p.y, pointerId:7, preventDefault:()=>{}, button:0});
    }
    cv.dispatch('pointermove', {clientX:p0.x, clientY:p0.y, pointerId:7, preventDefault:()=>{}, button:0});
    cv.dispatch('pointerup',   {clientX:p0.x, clientY:p0.y, pointerId:7, preventDefault:()=>{}, button:0});
  },
};
global.__H = H;
global.__require = require;

// ---------- запуск теста ----------
const testFile = process.argv[2];
if(!testFile){ console.error('usage: node harness.js <test.js>'); process.exit(1); }
const testCode = fs.readFileSync(path.resolve(testFile),'utf8');
Promise.resolve(vm.runInThisContext('('+testCode+')', {filename:testFile}))
  .then(r=>{ console.log(JSON.stringify(r)); process.exit(0); })
  .catch(e=>{ console.error('TEST ERROR:', e && e.stack || e); process.exit(1); });
