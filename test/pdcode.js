// 4.14 (стенд): PD-КОД ДИАГРАММЫ ИЗ ДАННЫХ ПРОГРАММЫ (соглашение KnotTheory / Regina.fromPD: X[i,j,k,l], i — входящее ребро
// нижней пряди, далее против часовой стрелки; рёбра нумеруются 1..2n по ходу кривой). Нужны crossings[] программы:
// {sA, sB, over:'A'|'B', dirA, dirB} — дуговые позиции и касательные обеих прядей (экранные координаты, y вниз).
// Использование из теста: __require(path.join(process.cwd(),'pdcode.js'))(crossings)
module.exports=function(crossings){
  const n=crossings.length; if(!n) return [];
  const ev=[]; crossings.forEach((c,ci)=>{ ev.push({s:c.sA,ci,pass:'A'}); ev.push({s:c.sB,ci,pass:'B'}); });
  ev.sort((a,b)=>a.s-b.s);
  const m=ev.length, at=new Map(); ev.forEach((e,k)=>at.set(e.ci+e.pass, k));   // ребро k идёт от события k к k+1, метка k+1
  const pd=[];
  crossings.forEach((c,ci)=>{ const o=c.over, u=(o==='A'?'B':'A'), ku=at.get(ci+u), ko=at.get(ci+o);
    const inU=((ku-1+m)%m)+1, outU=ku+1, inO=((ko-1+m)%m)+1, outO=ko+1;
    const du=(u==='A'?c.dirA:c.dirB), dov=(o==='A'?c.dirA:c.dirB);
    const cr=du.x*dov.y-du.y*dov.x;                 // экранное произведение; математическое (y вверх) = -cr
    // против часовой от входящего нижнего ребра первым идёт ВЫХОДЯЩЕЕ верхнее ребро, если cross_math(u,o) < 0
    const j=(-cr<0)? outO : inO, l=(-cr<0)? inO : outO;
    pd.push([inU, j, outU, l]); });
  return pd; };
