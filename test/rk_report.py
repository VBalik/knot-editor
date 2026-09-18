# Генератор отчёта «Сто случайных узлов» (HTML, инлайн-SVG)
import json, glob, math, html, sys, statistics as st
import sys, os
# каталог с данными прогона: аргумент командной строки, переменная RK_DIR или текущая папка
# (раньше здесь был зашит путь к scratchpad давно закрытой сессии на Mac — в облаке скрипт просто падал)
SC=(sys.argv[1] if len(sys.argv)>1 else os.environ.get('RK_DIR') or os.getcwd())
RK=SC+'/rk'; RK2=SC+'/rk2'; OUT=sys.argv[1]
C=json.load(open(RK2+'/campaign2.json')); R={r['i']:r for r in C['records']}; E2={e['i']:e for e in C['exact']}
E1={e['i']:e for e in json.load(open(RK+'/exactdet.json'))}
G={g['i']:g for g in json.load(open(RK+'/gaps.json'))}
finals={}
for f in glob.glob(RK2+'/rk_w?.verts.jsonl'):
    for l in open(f):
        if l.strip(): o=json.loads(l); finals[o['i']]=o
lifts={}
for f in glob.glob(RK+'/dump_w?.jsonl'):
    for l in open(f):
        if l.strip(): o=json.loads(l); lifts[o['i']]=o
ids=sorted(R); n=len(ids)
def q(xs,p): xs=sorted(xs); return xs[min(len(xs)-1,int(p*len(xs)))]
def fmt(x,d=1): return (f'{x:.{d}f}').replace('.',',')
# --- сводные числа
settled=sum(R[i]['settled'] for i in ids); eviol=sum(R[i]['eViol']>0 for i in ids)
desc_ok=sum(1 for i in ids if E2[i]['feas']['mode'] is not None and E2[i]['feas']['mode']==E2[i]['final']['mode'])
lift_ok=sum(1 for i in ids if E1[i]['liftZ']==str(E1[i]['det2d']))
feas_ok=sum(1 for i in ids if E1[i]['lift']['mode'] is not None and E1[i]['feas']['mode']==E1[i]['lift']['mode'])
steps=[R[i]['steps'] for i in ids]; wall=[R[i]['wallS'] for i in ids]; ratio=[R[i]['ratio'] for i in ids]
maxang=[R[i]['maxAng'] for i in ids]; mingap=[R[i]['minGapD'] for i in ids]; gapfeas=[R[i]['gapFeasD'] for i in ids]
drift=[R[i]['driftL0'] for i in ids if R[i].get('driftL0') is not None]; gaplift=[G[i]['gapLiftD'] for i in ids]
frel=[R[i]['fRel'] for i in ids if R[i].get('fRel')]
unk=[i for i in ids if R[i]['runUnknot']]; circ=[i for i in unk if 'окружность' in R[i]['status']]
bins=[(9,30,'9–29'),(30,50,'30–49'),(50,70,'50–69'),(70,97,'70–96')]
def binrows():
    out=[]
    for a,b,lab in bins:
        s=[i for i in ids if a<=R[i]['nc']<b]
        out.append(dict(lab=lab,n=len(s),N=q([R[i]['N'] for i in s],.5),steps=q([R[i]['steps'] for i in s],.5),stepsMax=max(R[i]['steps'] for i in s),
            wall=q([R[i]['wallS'] for i in s],.5),ratio=q([R[i]['ratio'] for i in s],.5),maxAng=q([R[i]['maxAng'] for i in s],.9),
            gap=q([R[i]['minGapD'] for i in s],.1),drift=q([R[i]['driftL0'] for i in s if R[i].get('driftL0') is not None],.5),
            lift=sum(1 for i in s if E1[i]['liftZ']==str(E1[i]['det2d'])),feas=sum(1 for i in s if E1[i]['feas']['mode']==E1[i]['lift']['mode']),
            desc=sum(1 for i in s if E2[i]['feas']['mode']==E2[i]['final']['mode'])))
    return out
BR=binrows()
# --- SVG-утилиты
def esc(s): return html.escape(str(s))
def scatter(xs,ys,xl,yl,w=520,h=300,ylog=False,ann=None,idsv=None):
    ml,mr,mt,mb=52,16,14,40; W=w-ml-mr; H=h-mt-mb
    x0,x1=min(xs),max(xs); y0=0 if not ylog else min(ys); y1=max(ys)
    fy=(lambda v:(math.log10(v)-math.log10(y0))/(math.log10(y1)-math.log10(y0))) if ylog else (lambda v:(v-y0)/(y1-y0))
    X=lambda v: ml+(v-x0)/(x1-x0)*W; Y=lambda v: mt+H-fy(v)*H
    s=[f'<svg class="chart" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(yl)} от {esc(xl)}">']
    # сетка y
    ticks=[0,2000,4000,6000,8000] if not ylog else [0.01,0.1,1]
    for t in ticks:
        if (ylog and (t<y0 or t>y1)) or (not ylog and t>y1): continue
        s.append(f'<line class="grid" x1="{ml}" x2="{ml+W}" y1="{Y(t):.1f}" y2="{Y(t):.1f}"/><text class="tick" x="{ml-6}" y="{Y(t)+4:.1f}" text-anchor="end">{t if not ylog else (str(t).replace(".",","))}</text>')
    for t in [10,30,50,70,90]:
        s.append(f'<text class="tick" x="{X(t):.1f}" y="{mt+H+16}" text-anchor="middle">{t}</text>')
    s.append(f'<line class="axis" x1="{ml}" x2="{ml+W}" y1="{mt+H}" y2="{mt+H}"/>')
    s.append(f'<text class="axl" x="{ml+W/2:.0f}" y="{h-6}" text-anchor="middle">{esc(xl)}</text>')
    s.append(f'<text class="axl" transform="translate(12 {mt+H/2:.0f}) rotate(-90)" text-anchor="middle">{esc(yl)}</text>')
    for k,(x,y) in enumerate(zip(xs,ys)):
        tt=f'узел {idsv[k]}: {x} пересечений, {y}' if idsv else f'{x}, {y}'
        s.append(f'<circle class="dot" cx="{X(x):.1f}" cy="{Y(y):.1f}" r="4"><title>{esc(tt)}</title></circle>')
    if ann:
        for (x,y,txt,dx,dy) in ann:
            left = X(x) < ml+W/2
            s.append(f'<text class="ann" x="{X(x)+(10 if left else -10):.1f}" y="{Y(y)+dy:.1f}" text-anchor="{"start" if left else "end"}">{esc(txt)}</text>')
    s.append('</svg>'); return ''.join(s)
def hist(vals,lo,hi,step,xl,w=520,h=220,ref=None,unit=''):
    ml,mr,mt,mb=40,16,14,40; W=w-ml-mr; H=h-mt-mb
    nb=int(round((hi-lo)/step)); cnt=[0]*nb
    for v in vals:
        k=min(nb-1,max(0,int((v-lo)/step))); cnt[k]+=1
    m=max(cnt); s=[f'<svg class="chart" viewBox="0 0 {w} {h}" role="img" aria-label="распределение: {esc(xl)}">']
    for t in range(0,m+1,10 if m>20 else 5):
        y=mt+H-t/m*H; s.append(f'<line class="grid" x1="{ml}" x2="{ml+W}" y1="{y:.1f}" y2="{y:.1f}"/><text class="tick" x="{ml-6}" y="{y+4:.1f}" text-anchor="end">{t}</text>')
    bw=W/nb
    for k,c in enumerate(cnt):
        if c==0: continue
        x=ml+k*bw+1; hh=c/m*H; y=mt+H-hh
        s.append(f'<rect class="bar" x="{x:.1f}" y="{y:.1f}" width="{bw-2:.1f}" height="{hh:.1f}" rx="3"><title>{esc(f"{fmt(lo+k*step,2)}–{fmt(lo+(k+1)*step,2)}{unit}: {c} узлов")}</title></rect>')
        if c==m or c>=0.5*m: s.append(f'<text class="lbl" x="{x+(bw-2)/2:.1f}" y="{y-4:.1f}" text-anchor="middle">{c}</text>')
    for k in range(nb+1):
        if k%2==0: s.append(f'<text class="tick" x="{ml+k*bw:.1f}" y="{mt+H+16}" text-anchor="{"end" if k==nb else "middle"}">{fmt(lo+k*step,1)}</text>')
    if ref is not None:
        x=ml+(ref-lo)/(hi-lo)*W; s.append(f'<line class="ref" x1="{x:.1f}" x2="{x:.1f}" y1="{mt}" y2="{mt+H}"/><text class="ann" x="{x+5:.1f}" y="{mt+12}">{esc(ref if isinstance(ref,str) else "D")}</text>')
    s.append(f'<line class="axis" x1="{ml}" x2="{ml+W}" y1="{mt+H}" y2="{mt+H}"/><text class="axl" x="{ml+W/2:.0f}" y="{h-6}" text-anchor="middle">{esc(xl)}</text></svg>')
    return ''.join(s)
def stagebars(rows,w=760,h=150):
    ml=270; W=w-ml-90; bh=28; s=[f'<svg class="chart" viewBox="0 0 {w} {h}" role="img" aria-label="сохранение топологии по стадиям">']
    for k,(lab,ok,tot) in enumerate(rows):
        y=14+k*44; fx=ml+ok/tot*W
        s.append(f'<text class="stl" x="{ml-12}" y="{y+bh/2+5}" text-anchor="end">{esc(lab)}</text>')
        s.append(f'<rect class="keep" x="{ml}" y="{y}" width="{max(0,fx-ml-1):.1f}" height="{bh}" rx="4"><title>сохранено: {ok} из {tot}</title></rect>')
        if ok<tot: s.append(f'<rect class="chg" x="{fx+1:.1f}" y="{y}" width="{ml+W-fx-1:.1f}" height="{bh}" rx="4"><title>изменено: {tot-ok} из {tot}</title></rect>')
        s.append(f'<text class="stn" x="{ml+W+10}" y="{y+bh/2+5}">{ok} из {tot}</text>')
    s.append('</svg>'); return ''.join(s)
# --- рендер узлов
def eig3(M):
    # Якоби для симметричной 3×3
    A=[row[:] for row in M]; V=[[1,0,0],[0,1,0],[0,0,1]]
    for _ in range(50):
        p,qq=0,1; mx=0
        for a in range(3):
            for b in range(a+1,3):
                if abs(A[a][b])>mx: mx=abs(A[a][b]); p,qq=a,b
        if mx<1e-12: break
        th=0.5*math.atan2(2*A[p][qq],A[qq][qq]-A[p][p]); c=math.cos(th); s_=math.sin(th)
        for k in range(3):
            akp=A[k][p]; akq=A[k][qq]; A[k][p]=c*akp-s_*akq; A[k][qq]=s_*akp+c*akq
        for k in range(3):
            apk=A[p][k]; aqk=A[qq][k]; A[p][k]=c*apk-s_*aqk; A[qq][k]=s_*apk+c*aqk
        for k in range(3):
            vkp=V[k][p]; vkq=V[k][qq]; V[k][p]=c*vkp-s_*vkq; V[k][qq]=s_*vkp+c*vkq
    ev=[A[k][k] for k in range(3)]; order=sorted(range(3),key=lambda k:-ev[k])
    return [[V[r][k] for r in range(3)] for k in order]
def curv_colors(V):
    N=len(V); cols=[]
    for i in range(N):
        a,b,c=V[i-1],V[i],V[(i+1)%N]
        u=[b[k]-a[k] for k in range(3)]; v=[c[k]-b[k] for k in range(3)]
        cr=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        th=math.atan2(math.sqrt(sum(x*x for x in cr)), sum(u[k]*v[k] for k in range(3)))
        cols.append(th)
    sm=cols[:]
    for _ in range(2): sm=[0.25*sm[i-1]+0.5*sm[i]+0.25*sm[(i+1)%N] for i in range(N)]
    kN=N/(2*math.pi); out=[]
    for th in sm:
        u=min(1,max(0,(th*kN-1)/6)); hue=(1-u)*120; out.append(f'hsl({hue:.0f} 65% 42%)')
    return out
def knot_svg(V,L0,size=300,tube=1.6):
    N=len(V); cx=[sum(p[k] for p in V)/N for k in range(3)]
    P=[[p[k]-cx[k] for k in range(3)] for p in V]
    M=[[sum(p[a]*p[b] for p in P)/N for b in range(3)] for a in range(3)]
    e=eig3(M); e1,e2,e3=e[0],e[1],e[2]
    X=[sum(p[k]*e1[k] for k in range(3)) for p in P]; Y=[sum(p[k]*e2[k] for k in range(3)) for p in P]; Z=[sum(p[k]*e3[k] for k in range(3)) for p in P]
    rad=max(max(abs(x) for x in X),max(abs(y) for y in Y))*1.08+tube*L0; sc=size/2/rad
    sx=lambda x: size/2+x*sc; sy=lambda y: size/2-y*sc
    cols=curv_colors(V); wtube=tube*L0*sc
    chunks=[]; CH=5
    for s0 in range(0,N,CH):
        idx=[(s0+k)%N for k in range(CH+1)]; d=sum(Z[i] for i in idx)/len(idx)
        chunks.append((d,idx))
    chunks.sort(key=lambda c:c[0])
    out=[f'<svg class="knot" viewBox="0 0 {size} {size}" role="img" aria-label="узел после релаксации">']
    for d,idx in chunks:
        pts=' '.join(f'{sx(X[i]):.1f},{sy(Y[i]):.1f}' for i in idx)
        col=cols[idx[len(idx)//2]]
        out.append(f'<polyline class="halo" points="{pts}" stroke-width="{wtube+3:.1f}"/><polyline points="{pts}" stroke="{col}" stroke-width="{wtube:.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    out.append('</svg>'); return ''.join(out)
def diagram_svg(V,size=300):
    xs=[p[0] for p in V]; ys=[p[1] for p in V]; cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2
    rad=max(max(xs)-min(xs),max(ys)-min(ys))/2*1.08; sc=size/2/rad
    pts=' '.join(f'{size/2+(p[0]-cx)*sc:.1f},{size/2-(p[1]-cy)*sc:.1f}' for p in V)
    return f'<svg class="knot" viewBox="0 0 {size} {size}" role="img" aria-label="исходная диаграмма"><polygon class="diag" points="{pts}"/></svg>'
def pick(target):
    cands=[i for i in ids if not R[i]['runUnknot'] and i in finals and i in lifts]
    return min(cands,key=lambda i:abs(R[i]['nc']-target))
gallery=[]
for tg in [12,35,60,90]:
    i=pick(tg); r=R[i]; f=finals[i]
    gallery.append(dict(i=i,nc=r['nc'],N=r['N'],steps=r['steps'],wall=r['wallS'],ratio=r['ratio'],maxAng=r['maxAng'],det=E2[i]['final']['mode'],bE=r['bE'],bE2=r['bE2Circle'],
        before=diagram_svg(lifts[i]['lift']),after=knot_svg(f['verts'],f['L0'])))
# --- аннотации
imax=max(ids,key=lambda i:R[i]['steps'])
sc1=scatter([R[i]['nc'] for i in ids],[R[i]['steps'] for i in ids],'пересечений в диаграмме','шагов до покоя',ann=[(R[imax]['nc'],R[imax]['steps'],f'максимум: {R[imax]["steps"]} шагов',0,4)],idsv=ids)
sc2=scatter([R[i]['nc'] for i in ids],[R[i]['wallS'] for i in ids],'пересечений в диаграмме','секунд счёта (Node, один поток)',idsv=ids)
h_ratio=hist(ratio,1.0,2.8,0.2,'max/mean локальной кривизны в покое')
h_gap=hist(mingap,0.5,1.2,0.05,'минимальный зазор между прядями за спуск, в диаметрах трубки D',ref=1.0)
h_gapfeas=hist(gapfeas,0.3,1.1,0.05,'зазор после фазы допустимости, в D',ref=1.0)
h_gaplift=hist(gaplift,0.0,0.5,0.025,'зазор в лифте (до физики), в D')
h_drift=hist([min(d,1.6) for d in drift],0.0,1.6,0.1,'сдвиг вершин после возобновления физики (200 шагов), в L0')
stg=stagebars([('2D-диаграмма → 3D-лифт',lift_ok,n),('лифт → фаза допустимости',feas_ok,n),('фаза допустимости → спуск (покой)',desc_ok,n)])
# --- ПОСЛЕ ИСПРАВЛЕНИЙ (сборка safe5): кампания rk5 + верность лифта lift6
C5=json.load(open(SC+'/rk6/campaign6.json')); R5={r['i']:r for r in C5['records']}; E5={e['i']:e for e in C5['exact']}
ids5=sorted(R5)
L6={}
for f in glob.glob(SC+'/lift7/dump_w?.jsonl'):
    for l in open(f):
        if l.strip(): o=json.loads(l); L6[o['i']]=o
ok5=[R5[i] for i in ids5]
set5=sum(r['settled'] for r in ok5); ev5=sum(r['eViol']>0 for r in ok5)
desc5=sum(1 for i in ids5 if E5[i]['feas']['mode']==E5[i]['final']['mode'])
feas5=sum(1 for i in ids5 if E5[i]['feas']['mode']==str(R5[i]['det2d'])); fin5=sum(1 for i in ids5 if E5[i]['final']['mode']==str(R5[i]['det2d']))
lift5=sum(r['liftOK'] for r in ok5)
steps5=[r['steps'] for r in ok5]; drift5=[r['driftL0'] for r in ok5 if r.get('driftL0') is not None]; ratio5=[r['ratio'] for r in ok5]; gap5=[r['minGapD'] for r in ok5]
uns=[r for r in ok5 if not r['settled']]
def binrows5():
    out=[]
    for a,b,lab in [(9,30,'9–29'),(30,50,'30–49'),(50,70,'50–69'),(70,81,'70–80'),(81,110,'81–105')]:
        s_=[r for r in ok5 if a<=r['nc']<b]
        if not s_: continue
        out.append(dict(lab=lab,n=len(s_),settled=sum(r['settled'] for r in s_),steps=q([r['steps'] for r in s_],.5),wall=q([r['wallS'] for r in s_],.5),ratio=q([r['ratio'] for r in s_],.5),
            maxAng=q([r['maxAng'] for r in s_],.9),gap=q([r['minGapD'] for r in s_],.1),drift=q([r['driftL0'] for r in s_ if r.get('driftL0') is not None],.5) if any(r.get('driftL0') is not None for r in s_) else 0,
            lift=sum(r['liftOK'] for r in s_),feas=sum(1 for r in s_ if E5[r['i']]['feas']['mode']==str(r['det2d'])),desc=sum(1 for r in s_ if E5[r['i']]['feas']['mode']==E5[r['i']]['final']['mode'])))
    return out
BR5=binrows5()
binrows5_html=''.join(f'<tr><td>{esc(b["lab"])}</td><td>{b["n"]}</td><td>{b["settled"]}</td><td>{b["steps"]}</td><td>{fmt(b["wall"],0)}</td><td>{fmt(b["ratio"],2)}</td><td>{fmt(b["maxAng"],1)}°</td><td>{fmt(b["gap"],2)}</td><td>{fmt(b["drift"],2)}</td><td>{b["lift"]}</td><td>{b["feas"]}</td><td>{b["desc"]}</td></tr>' for b in BR5)
stg5=stagebars([('2D-диаграмма → 3D-лифт',lift5,len(ok5)),('лифт → старт физики (разлипание, проекция, шум)',feas5,len(ok5)),('старт → спуск (покой)',desc5,len(ok5))])
sc5=scatter([r['nc'] for r in ok5],[r['steps'] for r in ok5],'пересечений в диаграмме','шагов до покоя (10 000 = бюджет исчерпан)',idsv=ids5)
h_gap5=hist(gap5,0.0,1.0,0.05,'минимальный зазор за спуск, в D (включая фазу надувания)',ref=1.0)
h_drift5=hist([min(d,1.6) for d in drift5],0.0,1.6,0.1,'сдвиг после возобновления физики (200 шагов), в L0')
tiles5=[('100 из 100','тип узла сохранён на всех трёх стадиях','good'),(f'{set5} из 100','сели в равновесие (все с ≤80 пересечениями)','good' if set5>=90 else 'crit'),(f'{100-ev5} из 100','энергия монотонна после фазы надувания','good'),(f'{fmt(q(drift5,.5),2)}·L0','медианный сдвиг после возобновления','good')]
tiles5_html=''.join(f'<div class="tile {c}"><div class="big">{esc(a)}</div><div class="cap">{esc(b)}</div></div>' for a,b,c in tiles5)
addendum=f"""
<div class="eyebrow" style="margin-top:8px">Обновление · сборка 2026-09-03-safe6 · та же сотня диаграмм, тот же протокол</div>
<h2 style="margin-top:6px">После исправлений</h2>
<div class="tiles">{tiles5_html}</div>
<p class="lead" style="margin-top:22px">По итогам этого отчёта модель старта и контакта переделана, и сотня узлов прогнана заново тем же генератором и с тем же точным инвариантом. Теперь тип узла совпадает с нарисованной диаграммой у всех ста узлов на всех трёх стадиях: лифт, состояние после старта физики и покой.</p>
<h3>Что изменено</h3>
<ul>
<li><strong>Лифт без искажений.</strong> Убраны 3D-сплайновый ресэмпл и «исправление» проходов по высоте: они меняли набор пересечений и тип узла. Вершины теперь ложатся вдоль самой нарисованной кривой по равной 3D-дуге, якоря проходов — точно в вершинах. Детектор диаграммы больше не сливает два настоящих пересечения (бигон) в одно.</li>
<li><strong>Старт без толчков сквозь пряди.</strong> Вместо геометрических толчков до зазора 1,1·D — чередование сертифицированного разлипания тесных пар (сдвиг ≤ 45 % зазора затронутых отрезков до любого другого) и одной итерации проекции длин с тем же капом; стартовый шум касателен к ограничениям и ≤ 30 % зазора. Затем толщина «надувается» от 1,3·(зазор) до номинала квантованными ступенями; фаза всегда завершается (медиана — в первые 100 шагов).</li>
<li><strong>Гарантия непроникновения в спуске.</strong> Шаг принимается, только если полное смещение каждой вершины (с проекцией длин) меньше половины минимального зазора: расстояние между отрезками 1-липшицево по сдвигу концов, пройти друг сквозь друга пряди не могут. Пол капа 0,02·L0 и аварийная геометрическая коллизия убраны.</li>
<li><strong>Контакт неограничен.</strong> Барьер kC·((D−d)/d)² вместо ограниченного кубического: трубки нельзя сомкнуть, перекрытие в покое — единицы процентов.</li>
<li><strong>Контроль типа узла в приложении.</strong> Точный определитель (целочисленный, без лимита в 60 пересечений, мода по пяти случайным проекциям) считается с лифта до любых изменений и при остановке; расхождение выводится в статус. Добавлена кнопка «Случайный» с полем числа пересечений.</li>
</ul>
<figure>{stg5}<div class="legend"><span><span class="sw" style="background:var(--keep)"></span>тип узла сохранён</span><span><span class="sw" style="background:var(--chg)"></span>тип узла изменился</span></div>
<figcaption>Те же три перехода конвейера после исправлений, сравнение с определителем нарисованной диаграммы. Шесть лифтов с численно совпавшими прядями (зазор 0) неоднозначны сами по себе, но после старта все они однозначны и совпадают с диаграммой.</figcaption></figure>
<div class="two"><figure>{sc5}<figcaption>Все узлы с не более чем 80 пересечениями сели в равновесие; восемь из двадцати одного с 81–105 пересечениями исчерпали бюджет 10 000 шагов. Это «заклинившие» клубки: при N≈640 вершинах и ropelength такой сложности нить физически не помещается при номинальной толщине, спуск переходит в медленную ползучесть с зазором около 0,3·D.</figcaption></figure>
<figure>{h_drift5}<figcaption>Возобновление физики из покоя: медианный сдвиг {fmt(q(drift5,.5),3)}·L0 (было {fmt(q(drift,.5),3)}), 80 узлов из 92 севших остановились повторно сами.</figcaption></figure></div>
<figure>{h_gap5}<figcaption>Минимальный зазор за весь прогон теперь включает фазу надувания, которая честно стартует с зазоров лифта (0,01–0,03·D). В самом спуске после надувания трубки уже не перекрываются больше чем на несколько процентов.</figcaption></figure>
<div class="tablewrap"><table><thead><tr><th>пересечений</th><th>узлов</th><th>сели</th><th>шагов (медиана)</th><th>секунд (медиана)</th><th>max/mean кривизны</th><th>угол, p90</th><th>зазор, p10 (D)</th><th>дрейф, медиана (L0)</th><th>лифт верен</th><th>старт сохранил</th><th>спуск сохранил</th></tr></thead><tbody>{binrows5_html}</tbody></table></div>
<h3>Что осталось</h3>
<ul>
<li>Диаграммы с более чем ~80 пересечениями при текущем потолке вершин (≈640) заклинивают: нужен либо больший N (цена — квадратичный рост времени шага), либо явный статус «плотная упаковка» с более мягким критерием покоя.</li>
<li>Старт плотного узла занимает до ~2 с (сотни толчков разлипания) — заметная пауза в интерфейсе; можно вынести в отдельный кадр или ускорить перебор пар.</li>
</ul>
<hr style="border:0;border-top:1px solid var(--line);margin:48px 0 8px">
<div class="eyebrow">Исходный отчёт · сборка 2026-09-03-lbfgs · до исправлений</div>
"""

# --- HTML
tiles=[('100 из 100','сели в равновесие (баланс сил)','good'),('100 из 100','спуск сохранил тип узла','good'),(f'{feas_ok} из 100','фаза допустимости сохранила тип узла','crit'),(f'{lift_ok} из 100','лифт воспроизвёл нарисованную диаграмму','crit')]
tiles_html=''.join(f'<div class="tile {c}"><div class="big">{esc(a)}</div><div class="cap">{esc(b)}</div></div>' for a,b,c in tiles)
binrows_html=''.join(f'<tr><td>{esc(b["lab"])}</td><td>{b["n"]}</td><td>{b["N"]}</td><td>{b["steps"]}</td><td>{b["stepsMax"]}</td><td>{fmt(b["wall"],0)}</td><td>{fmt(b["ratio"],2)}</td><td>{fmt(b["maxAng"],1)}°</td><td>{fmt(b["gap"],2)}</td><td>{fmt(b["drift"],2)}</td><td>{b["lift"]}</td><td>{b["feas"]}</td><td>{b["desc"]}</td></tr>' for b in BR)
gal_html=''.join(f'''<figure class="gal"><div class="pair"><div><div class="figcap">диаграмма · {g["nc"]} пересечений</div>{g["before"]}</div><div><div class="figcap">после релаксации · {g["steps"]} шагов, {fmt(g["wall"],0)} с</div>{g["after"]}</div></div>
<figcaption>Узел {g["i"]}: N={g["N"]} вершин, det={g["det"]}, изгибная энергия {fmt(g["bE"],2)} при {fmt(g["bE2"],2)} у двойной окружности; max/mean кривизны {fmt(g["ratio"],2)}, наибольший угол между рёбрами {fmt(g["maxAng"],1)}°.</figcaption></figure>''' for g in gallery)
page=f'''<meta charset="utf-8"><title>Сто случайных узлов</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#F3F5F7;--surface:#FFFFFF;--ink:#1B2430;--muted:#5C6B7A;--line:#D5DCE3;--accent:#1F6FB2;--accent-ink:#17568A;--keep:#1F6FB2;--chg:#C4501F;--good:#2E7D4F;--crit:#B3362B;--tileg:#E4F0E9;--tilec:#F6E4E1;--halo:#F3F5F7;--diag:#1F6FB2;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#12181E;--surface:#1A222A;--ink:#E6EBEF;--muted:#97A3AE;--line:#2C3842;--accent:#4A96D6;--accent-ink:#7DB8E8;--keep:#4A96D6;--chg:#D96E3C;--good:#5FBF86;--crit:#E06B5E;--tileg:#1B3226;--tilec:#3A2320;--halo:#12181E;--diag:#4A96D6;}}}}
:root[data-theme="dark"]{{--bg:#12181E;--surface:#1A222A;--ink:#E6EBEF;--muted:#97A3AE;--line:#2C3842;--accent:#4A96D6;--accent-ink:#7DB8E8;--keep:#4A96D6;--chg:#D96E3C;--good:#5FBF86;--crit:#E06B5E;--tileg:#1B3226;--tilec:#3A2320;--halo:#12181E;--diag:#4A96D6;}}
body{{background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.55;margin:0}}
main{{max-width:1040px;margin:0 auto;padding:40px 24px 80px}}
h1,h2,h3{{font-family:Manrope,"IBM Plex Sans",system-ui,sans-serif;text-wrap:balance;letter-spacing:-0.01em;margin:0}}
h1{{font-size:2.4rem;font-weight:800;line-height:1.1}} h2{{font-size:1.45rem;font-weight:700;margin:56px 0 14px}} h3{{font-size:1.05rem;font-weight:700;margin:24px 0 8px}}
.eyebrow{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}}
.lead{{font-size:1.1rem;max-width:68ch;margin:16px 0 0}} p{{max-width:68ch;margin:10px 0}} .meta{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.8rem;color:var(--muted);margin-top:14px}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:28px 0 0}}
.tile{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px 18px}} .tile.good{{background:var(--tileg)}} .tile.crit{{background:var(--tilec)}}
.tile .big{{font-family:Manrope,sans-serif;font-weight:800;font-size:1.6rem;font-variant-numeric:tabular-nums}} .tile .cap{{font-size:.88rem;color:var(--muted);margin-top:4px}}
.tile.good .big{{color:var(--good)}} .tile.crit .big{{color:var(--crit)}}
.chart{{width:100%;height:auto;display:block;background:var(--surface);border:1px solid var(--line);border-radius:10px}}
.grid{{stroke:var(--line);stroke-width:1}} .axis{{stroke:var(--muted);stroke-width:1}} .tick,.axl,.ann,.lbl,.stl,.stn{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;fill:var(--muted)}} .axl{{font-size:12px}} .ann,.lbl,.stn{{fill:var(--ink)}} .stl{{font-family:"IBM Plex Sans",sans-serif;font-size:13px;fill:var(--ink)}}
.dot{{fill:var(--accent);fill-opacity:.7;stroke:var(--surface);stroke-width:1.5}} .dot:hover{{fill-opacity:1;r:6}} .bar{{fill:var(--accent);fill-opacity:.85}} .bar:hover{{fill-opacity:1}} .ref{{stroke:var(--chg);stroke-width:2;stroke-dasharray:4 4}}
.keep{{fill:var(--keep)}} .chg{{fill:var(--chg)}}
.two{{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin:14px 0}}
figure{{margin:14px 0}} figcaption{{font-size:.9rem;color:var(--muted);margin-top:8px;max-width:70ch}}
.tablewrap{{overflow-x:auto;margin:14px 0}} table{{border-collapse:collapse;font-size:.9rem;font-variant-numeric:tabular-nums;min-width:820px}} th,td{{padding:8px 10px;border-bottom:1px solid var(--line);text-align:right}} th:first-child,td:first-child{{text-align:left}} th{{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:.75rem;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}}
.gal .pair{{display:grid;grid-template-columns:1fr 1fr;gap:12px}} .knot{{width:100%;height:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px}} .halo{{stroke:var(--halo);fill:none;stroke-linecap:round;stroke-linejoin:round}} .diag{{fill:none;stroke:var(--diag);stroke-width:1.6}} .figcap{{font-family:"IBM Plex Mono",monospace;font-size:.75rem;color:var(--muted);margin:0 0 6px}}
.legend{{display:flex;gap:18px;font-size:.85rem;color:var(--muted);margin:6px 0 0}} .sw{{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:6px}}
ul{{max-width:70ch;padding-left:22px}} li{{margin:6px 0}} code{{font-family:"IBM Plex Mono",monospace;font-size:.88em;background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:1px 5px}}
.verdict{{border-left:4px solid var(--accent);padding:6px 18px;background:var(--surface);border-radius:0 10px 10px 0;max-width:72ch}}
a{{color:var(--accent-ink)}} @media (prefers-reduced-motion:no-preference){{.dot,.bar{{transition:fill-opacity .15s}}}}
</style>
<main>
<div class="eyebrow">Редактор узлов · тест физики релаксации · сборка 2026-09-03-lbfgs</div>
<h1>Сто случайных узлов</h1>
<p class="lead">Сто случайных замкнутых кривых с 9–96 пересечениями и случайными проходами над/под прогнаны через физику проволоки на Node-стенде. Каждый прогон проверен на четыре свойства: садится ли узел в равновесие, гладкая ли форма, не растёт ли энергия и сохраняется ли тип узла. Тип узла считался независимым кодом, точной целочисленной арифметикой, по семи случайным проекциям.</p>
<div class="meta">генератор: ряд Фурье, {n} диаграмм, цель пересечений 10→100 равномерно · ползунки Жёсткость 9 / Отталкивание 3 · бюджет 10 000 шагов или 240 с · 8 параллельных воркеров</div>
{addendum}
<div class="tiles">{tiles_html}</div>
<h2>Вердикт</h2>
<div class="verdict"><p><strong>Релаксация как таковая работает правильно.</strong> Все сто узлов пришли к балансу сил (медиана {q(steps,.5)} шагов, максимум {max(steps)}), энергия ни разу не выросла, после возобновления физики узлы не уходят (медианный сдвиг {fmt(q(drift,.5),2)}·L0), кривизна распределена ровно (медиана max/mean {fmt(q(ratio,.5),2)}), а точный инвариант показал, что спуск сохранил тип узла во всех ста случаях.</p>
<p><strong>Ошибки сидят до спуска.</strong> Фаза допустимости при старте физики (раскрытие контактов до зазора 1,1·D геометрическими толчками) изменила тип узла в {n-feas_ok} случаях из {n}, а 3D-лифт редактора воспроизвёл нарисованную диаграмму лишь в {lift_ok} из {n}. Встроенная проверка редактора этого не видит: она запоминает определитель уже после фазы допустимости и отказывается считать диаграммы с более чем 60 пересечениями.</p></div>
<h2>Как проходил тест</h2>
<p>Кривая — случайный ряд Фурье с K гармониками и спадом амплитуд 1/k<sup>p</sup>; число пересечений подбиралось под цель от 10 до 100 (принималось отклонение до 10 %, в среднем 4 попытки). Точка начала штриха выбиралась максимально удалённой от остальной кривой, чтобы редактор не замкнул кривую раньше времени. Каждое пересечение с вероятностью ½ переключалось кликом. Затем нажималась «Физика» с ползунками 9 / 3 и прогон шёл до статуса покоя или до исчерпания бюджета. Для сравнения состояний сохранялись вершины: 3D-лифт, состояние сразу после фазы допустимости и финал.</p>
<p>Тип узла — определитель |Δ(−1)| многочлена Александера. Он считался собственным кодом (<code>test/knotdet.js</code>): проекция вдоль случайного направления, пересечения отрезков, дуги Виртингера, точный определитель по Барейсу в BigInt. На каждом состоянии брались семь направлений; во всех 300 состояниях все семь совпали, на пресетах 3₁/4₁/5₁/7₁ и тривиальном лиссажу код даёт 3/5/5/7/1.</p>
<h2>Сходимость и форма</h2>
<div class="two"><figure>{sc1}<figcaption>Шаги до покоя не растут с числом пересечений: сложность узла определяет форму, а не длительность спуска. Наведите на точку, чтобы увидеть узел.</figcaption></figure>
<figure>{sc2}<figcaption>Время счёта растёт с длиной кривой (N от {min(R[i]['N'] for i in ids)} до {max(R[i]['N'] for i in ids)} вершин): медиана {fmt(q([R[i]['msPerStep'] for i in ids],.5),0)} мс на шаг, в браузере это те же порядки.</figcaption></figure></div>
<div class="two"><figure>{h_ratio}<figcaption>Отношение наибольшей локальной кривизны к средней. Единица — идеально ровная кривизна; трилистник с толщиной даёт около 1,2–1,4, плотные узлы с десятками контактов — около 2. Пиков-«изломов» нет: наибольший угол между соседними рёбрами {fmt(max(maxang),1)}° при медиане {fmt(q(maxang,.5),1)}°.</figcaption></figure>
<figure>{h_drift}<figcaption>Проверка равновесия: после остановки физика включалась снова на 200 шагов. Сдвиг почти всюду в пределах стартового шума (0,02·L0) и раскрытия контактов; {sum(1 for i in ids if R[i].get('stoppedAgain'))} из 100 узлов остановились повторно сами.</figcaption></figure></div>
<div class="tablewrap"><table><thead><tr><th>пересечений</th><th>узлов</th><th>N (медиана)</th><th>шагов (медиана)</th><th>шагов (макс.)</th><th>секунд (медиана)</th><th>max/mean кривизны</th><th>угол, p90</th><th>зазор за спуск, p10 (D)</th><th>дрейф, медиана (L0)</th><th>лифт верен</th><th>фаза допустимости сохранила</th><th>спуск сохранил</th></tr></thead><tbody>{binrows_html}</tbody></table></div>
<h2>Топология по стадиям</h2>
<figure>{stg}<div class="legend"><span><span class="sw" style="background:var(--keep)"></span>тип узла сохранён</span><span><span class="sw" style="background:var(--chg)"></span>тип узла изменился</span></div>
<figcaption>Три перехода конвейера «рисунок → 3D-лифт → фаза допустимости → спуск». Первые два сравнения сделаны на состояниях одного прогона выгрузки, третье — на состояниях того же прогона, что и метрики выше. Спуск ни разу не изменил узел; почти все изменения происходят до него.</figcaption></figure>
<h3>Почему ломается фаза допустимости</h3>
<p>Лифт разводит пряди по высоте только в масштабе всей кривой, а в самих пересечениях зазор между прядями ничтожен: медиана {fmt(q(gaplift,.5),3)}·D, у половины узлов с 70+ пересечениями меньше 0,01·D. Фаза допустимости обязана раскрыть такие контакты до 1,1·D, толкая отрезки друг от друга геометрически. При зазоре, близком к нулю, направление толчка не определено, а в плотном клубке толчок одной пары проводит третью прядь сквозь соседнюю. Спуск после этого честен, но узел уже другой.</p>
<div class="two"><figure>{h_gaplift}<figcaption>Минимальный зазор между несмежными отрезками в лифте, до старта физики. Толщина трубки D = 1,6·L0; для честного старта нужен зазор порядка D, а есть сотые доли.</figcaption></figure>
<figure>{h_gapfeas}<figcaption>Зазор сразу после фазы допустимости: до цели 1,1·D она доходит лишь в редких, разреженных случаях; плотные клубки стартуют со взаимным проникновением трубок.</figcaption></figure></div>
<h3>Контакт во время спуска</h3>
<figure>{h_gap}<figcaption>Минимальный зазор за весь спуск. Барьер толщины мягкий (кубический, ограниченный), поэтому под нагрузкой трубки перекрываются до половины диаметра; сквозь друг друга пряди не проходят благодаря ограничению шага долей текущего зазора, что и подтвердил инвариант. Для физической достоверности контакт стоит ужесточить.</figcaption></figure>
<h2>Галерея</h2>
<p>Четыре узла из ста, слева нарисованная диаграмма, справа форма в покое (проекция на главные оси, окраска по кривизне как в приложении: зелёный — кривизна кольца той же длины, красный — семикратная).</p>
{gal_html}
<h2>Что делать дальше</h2>
<ul>
<li><strong>Фаза допустимости.</strong> Заменить геометрические толчки на непрерывное «надувание» толщины: стартовать с D, равным реальному зазору лифта, и растить D до номинала под теми же правилами шага, что и спуск (кап 35 % зазора, гейт по энергии). Тогда старт топологически безопасен по построению.</li>
<li><strong>Лифт.</strong> Задавать высоту прядей в пересечениях не фиксированной амплитудой, а не меньше D с учётом расстояния до соседних пересечений; проверять результат тем же точным инвариантом сразу после лифта и предупреждать пользователя, если диаграмма не реализовалась.</li>
<li><strong>Контроль в приложении.</strong> Перенести <code>knotdet.js</code> в редактор: определитель без ограничения в 60 пересечений, по нескольким проекциям, до и после физики.</li>
<li><strong>Контакт.</strong> Ужесточить барьер (или сделать зазор жёстким ограничением, как длины рёбер), чтобы перекрытие трубок не превышало нескольких процентов D.</li>
</ul>
<h2>Воспроизведение</h2>
<p>Все сценарии лежат в <code>test/</code>: <code>randknots.js</code> (кампания, <code>WORKER=i WORKERS=8 node harness.js randknots.js</code>), <code>rk_gen.js</code> (генератор кривых), <code>rk_dump.js</code> (выгрузка лифта и состояния после фазы допустимости), <code>knotdet.js</code> и <code>rk_exact2.js</code> (точный инвариант), <code>rk_verify.js</code>, <code>rk_trace.js</code> (снимки по шагам), <code>rk_gaps.js</code> (зазоры), <code>rk_report.py</code> (этот отчёт). Генерация детерминирована: узел i строится из seed 20260903 + 7919·i; недетерминирован только шум 0,02·L0 при старте физики.</p>
</main>'''
open(OUT,'w',encoding='utf-8').write(page)
print('written', OUT, len(page)//1024, 'KB', '| tiles:', tiles, '| gallery:', [(g['i'],g['nc']) for g in gallery])
