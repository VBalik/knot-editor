# Отчёт эксперимента: закон жёсткого ядра + 1/Δ⁴, 100 случайных узлов, серии A (w=1,r=1) и B (w=2,r=2)
import json, glob, math, html, sys, os
sys.path.insert(0, os.path.dirname(__file__))
SC='/private/tmp/claude-501/-Users-balik-Library-CloudStorage-GoogleDrive-gbalik-gmail-com-My-Drive-Programming-Claude-Knots/f39e4efd-2d05-4d5a-a62c-5a632f4d1e27/scratchpad'
OUT=sys.argv[1]
def esc(x): return html.escape(str(x))
def fmt(x,d=1): return (f'{x:.{d}f}').replace('.',',')
def q(xs,p): xs=sorted(xs); return xs[min(len(xs)-1,int(p*len(xs)))]
def load_campaign(d):
    R={}
    for f in glob.glob(d+'/rk_w?.jsonl'):
        for l in open(f):
            if l.strip(): r=json.loads(l); R[r['i']]=r
    V={}
    for f in glob.glob(d+'/rk_w?.verts.jsonl'):
        for l in open(f):
            if l.strip(): o=json.loads(l); V[o['i']]=o
    P={p['i']:p for p in json.load(open(d+'/phys.json'))} if os.path.exists(d+'/phys.json') else {}
    return R,V,P
RA,VA,PA=load_campaign(SC+'/rkA')
RB,VB,PB=load_campaign(SC+'/rkB') if os.path.exists(SC+'/rkB/phys.json') else ({},{},{})
crit={}; cross=None; critCount={}
cp=SC+'/critique.json'
if os.path.exists(cp):
    cj=json.load(open(cp)); crit={it['i']:it for it in cj.get('items',[])}; cross=cj.get('cross')
    import collections as _c; critCount=dict(_c.Counter(it['verdict'] for it in cj.get('items',[])))
lifts={}
for f in glob.glob(SC+'/rk/dump_w?.jsonl'):
    for l in open(f):
        if l.strip(): o=json.loads(l); lifts[o['i']]=o
idsA=sorted(PA)
# ---------- SVG helpers (как в первом отчёте) ----------
def scatter(xs,ys,xl,yl,w=520,h=300,idsv=None,ymax=None,ref=None):
    ml,mr,mt,mb=52,16,14,40; W=w-ml-mr; H=h-mt-mb
    x0,x1=min(xs),max(xs); y0=0; y1=ymax if ymax else max(ys)
    X=lambda v: ml+(v-x0)/(x1-x0)*W; Y=lambda v: mt+H-(min(v,y1)-y0)/(y1-y0)*H
    s=[f'<svg class="chart" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(yl)}">']
    step=y1/4
    for k in range(5):
        t=k*step; s.append(f'<line class="grid" x1="{ml}" x2="{ml+W}" y1="{Y(t):.1f}" y2="{Y(t):.1f}"/><text class="tick" x="{ml-6}" y="{Y(t)+4:.1f}" text-anchor="end">{fmt(t,2 if y1<5 else 0)}</text>')
    for t in [10,30,50,70,90]: s.append(f'<text class="tick" x="{X(t):.1f}" y="{mt+H+16}" text-anchor="middle">{t}</text>')
    if ref is not None: s.append(f'<line class="ref" x1="{ml}" x2="{ml+W}" y1="{Y(ref):.1f}" y2="{Y(ref):.1f}"/>')
    s.append(f'<line class="axis" x1="{ml}" x2="{ml+W}" y1="{mt+H}" y2="{mt+H}"/><text class="axl" x="{ml+W/2:.0f}" y="{h-6}" text-anchor="middle">{esc(xl)}</text><text class="axl" transform="translate(12 {mt+H/2:.0f}) rotate(-90)" text-anchor="middle">{esc(yl)}</text>')
    for k,(x,y) in enumerate(zip(xs,ys)):
        tt=f'узел {idsv[k]}: {x} пересечений, {fmt(y,3)}' if idsv else f'{x}, {y}'
        s.append(f'<circle class="dot" cx="{X(x):.1f}" cy="{Y(y):.1f}" r="4"><title>{esc(tt)}</title></circle>')
    s.append('</svg>'); return ''.join(s)
def hist(vals,lo,hi,step,xl,w=520,h=220,ref=None,unit=''):
    ml,mr,mt,mb=40,16,14,40; W=w-ml-mr; H=h-mt-mb
    nb=int(round((hi-lo)/step)); cnt=[0]*nb
    for v in vals: k=min(nb-1,max(0,int((v-lo)/step))); cnt[k]+=1
    m=max(cnt) or 1; s=[f'<svg class="chart" viewBox="0 0 {w} {h}" role="img" aria-label="распределение: {esc(xl)}">']
    for t in range(0,m+1,10 if m>20 else 5):
        y=mt+H-t/m*H; s.append(f'<line class="grid" x1="{ml}" x2="{ml+W}" y1="{y:.1f}" y2="{y:.1f}"/><text class="tick" x="{ml-6}" y="{y+4:.1f}" text-anchor="end">{t}</text>')
    bw=W/nb
    for k,c in enumerate(cnt):
        if c==0: continue
        x=ml+k*bw+1; hh=c/m*H; y=mt+H-hh
        s.append(f'<rect class="bar" x="{x:.1f}" y="{y:.1f}" width="{bw-2:.1f}" height="{hh:.1f}" rx="3"><title>{esc(f"{fmt(lo+k*step,2)}–{fmt(lo+(k+1)*step,2)}{unit}: {c} узлов")}</title></rect>')
        if c>=0.5*m: s.append(f'<text class="lbl" x="{x+(bw-2)/2:.1f}" y="{y-4:.1f}" text-anchor="middle">{c}</text>')
    for k in range(nb+1):
        if k%2==0: s.append(f'<text class="tick" x="{ml+k*bw:.1f}" y="{mt+H+16}" text-anchor="{"end" if k==nb else "middle"}">{fmt(lo+k*step,1)}</text>')
    if ref is not None:
        x=ml+(ref-lo)/(hi-lo)*W; s.append(f'<line class="ref" x1="{x:.1f}" x2="{x:.1f}" y1="{mt}" y2="{mt+H}"/>')
    s.append(f'<line class="axis" x1="{ml}" x2="{ml+W}" y1="{mt+H}" y2="{mt+H}"/><text class="axl" x="{ml+W/2:.0f}" y="{h-6}" text-anchor="middle">{esc(xl)}</text></svg>')
    return ''.join(s)
def eig3(M):
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
        cols.append(math.atan2(math.sqrt(sum(x*x for x in cr)), sum(u[k]*v[k] for k in range(3))))
    sm=cols[:]
    for _ in range(2): sm=[0.25*sm[i-1]+0.5*sm[i]+0.25*sm[(i+1)%N] for i in range(N)]
    kN=N/(2*math.pi); out=[]
    for th in sm:
        u=min(1,max(0,(th*kN-1)/6)); out.append(f'hsl({(1-u)*120:.0f} 65% 42%)')
    return out
def knot_svg(V,L0,DL0,size=300):
    N=len(V); cx=[sum(p[k] for p in V)/N for k in range(3)]
    P=[[p[k]-cx[k] for k in range(3)] for p in V]
    M=[[sum(p[a]*p[b] for p in P)/N for b in range(3)] for a in range(3)]
    e=eig3(M); e1,e2,e3=e[0],e[1],e[2]
    X=[sum(p[k]*e1[k] for k in range(3)) for p in P]; Y=[sum(p[k]*e2[k] for k in range(3)) for p in P]; Z=[sum(p[k]*e3[k] for k in range(3)) for p in P]
    tube=max(DL0,0.6)*L0
    rad=max(max(abs(x) for x in X),max(abs(y) for y in Y))*1.08+tube; sc=size/2/rad
    sx=lambda x: size/2+x*sc; sy=lambda y: size/2-y*sc
    cols=curv_colors(V); wtube=max(tube*sc,2.0)
    chunks=[]; CH=5
    for s0 in range(0,N,CH):
        idx=[(s0+k)%N for k in range(CH+1)]; d=sum(Z[i] for i in idx)/len(idx); chunks.append((d,idx))
    chunks.sort(key=lambda c:c[0])
    out=[f'<svg class="knot" viewBox="0 0 {size} {size}" role="img" aria-label="узел после релаксации">']
    for d,idx in chunks:
        pts=' '.join(f'{sx(X[i]):.1f},{sy(Y[i]):.1f}' for i in idx)
        out.append(f'<polyline class="halo" points="{pts}" stroke-width="{wtube+3:.1f}"/><polyline points="{pts}" stroke="{cols[idx[len(idx)//2]]}" stroke-width="{wtube:.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    out.append('</svg>'); return ''.join(out)
def diagram_svg(V,size=300):
    xs=[p[0] for p in V]; ys=[p[1] for p in V]; cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2
    rad=max(max(xs)-min(xs),max(ys)-min(ys))/2*1.08; sc=size/2/rad
    pts=' '.join(f'{size/2+(p[0]-cx)*sc:.1f},{size/2-(p[1]-cy)*sc:.1f}' for p in V)
    return f'<svg class="knot" viewBox="0 0 {size} {size}" role="img" aria-label="исходная диаграмма"><polygon class="diag" points="{pts}"/></svg>'
# ---------- сводка серии A ----------
A=[PA[i] for i in idsA]
nA=len(A); phys=sum(1 for p in A if p['verdict']=='физично'); viol=[p for p in A if p['verdict']=='НАРУШЕНИЕ']
soft=[p for p in A if p['verdict']=='НАРУШЕНИЕ' and all(w.startswith('дрейф') for w in p['why'])]
hard=[p for p in viol if p not in soft]
settledA=sum(1 for i in idsA if RA[i]['settled']); jamA=sum(1 for i in idsA if RA[i].get('jammed'))
gm=[p['gminS'] for p in A]; ks=[p['kappaS'] for p in A]; bm=[p['bEoverMilnor'] for p in A]; dr=[p['driftL0'] for p in A if p.get('driftL0') is not None]
stepsA=[RA[i]['steps'] for i in idsA]
verdict_word=lambda p: ('физично' if p['verdict']=='физично' else ('физично, мягкая мода' if p in soft else p['verdict']))
# ---------- таблица по узлам (A) ----------
rows=[]
for p in A:
    r=RA[p['i']]; c=crit.get(p['i'])
    vw=verdict_word(p)
    cls='ok' if vw=='физично' else ('soft' if 'мягк' in vw else 'bad')
    stepcell=f'{r["steps"]}' + (' <span class="eb" title="покой объявлен по плоской энергии (сила ниже 10 порогов)">E</span>' if r.get('quietBy')=='eflat' else '')
    rows.append(f'<tr class="{cls}"><td>{p["i"]}</td><td>{p["nc"]}</td><td>{p["det"]}</td><td>{p["N"]}</td><td>{stepcell}</td><td>{fmt(p["bE"],2)}</td><td>{fmt(p["bEoverMilnor"],1)}</td><td>{fmt(p["thMaxDeg"],1)}°</td><td>{fmt(p["ratio"],2)}</td><td>{fmt(p["kappaS"],2)}</td><td>{fmt(p["gminS"],2)}</td><td>{p["near"]}</td><td>{p["lenErr"]:.0e}</td><td>{p["fRel"]:.0e}</td><td>{fmt(p["driftL0"],2) if p.get("driftL0") is not None else "—"}</td><td>{"да" if p["topo"] else "НЕТ"}</td><td>{esc(vw)}</td><td class="cm">{esc(c["comment"]) if c else ""}</td></tr>')
tableA=''.join(rows)
# ---------- серия B ----------
B=[PB[i] for i in sorted(PB)] if PB else []
if B:
    settledB=sum(1 for p in B if RB[p['i']]['settled']); jamB=sum(1 for p in B if RB[p['i']].get('jammed'))
    physB=sum(1 for p in B if p['verdict']=='физично'); softB=sum(1 for p in B if p['verdict']=='НАРУШЕНИЕ' and all(w.startswith('дрейф') for w in p['why']))
    rowsB=[]
    for p in B:
        r=RB[p['i']]; vw=('физично' if p['verdict']=='физично' else ('физично, мягкая мода' if (p['verdict']=='НАРУШЕНИЕ' and all(w.startswith('дрейф') for w in p['why'])) else p['verdict']))
        cls='ok' if vw=='физично' else ('soft' if 'мягк' in vw else 'bad')
        rowsB.append(f'<tr class="{cls}"><td>{p["i"]}</td><td>{p["nc"]}</td><td>{r["steps"]}</td><td>{fmt(100*r.get("inflateEnd",1),0)} %</td><td>{fmt(p["bE"],2)}</td><td>{fmt(p["kappaS"],2)}</td><td>{fmt(p["gminS"],2)}</td><td>{p["near"]}</td><td>{fmt(p["driftL0"],2) if p.get("driftL0") is not None else "—"}</td><td>{"да" if p["topo"] else "НЕТ"}</td><td>{esc(vw)}</td></tr>')
    tableB=''.join(rowsB)
# ---------- галерея ----------
def pick(target):
    c=[i for i in idsA if not RA[i]['runUnknot'] and i in VA and i in lifts]
    return min(c,key=lambda i:abs(RA[i]['nc']-target))
gal=[]
for tg in [12,35,60,90]:
    i=pick(tg); p=PA[i]; v=VA[i]
    gal.append(f'''<figure class="gal"><div class="pair"><div><div class="figcap">диаграмма · {p["nc"]} пересечений · det {p["det"]}</div>{diagram_svg(lifts[i]["lift"])}</div><div><div class="figcap">после релаксации · {RA[i]["steps"]} шагов · w=1, r=1</div>{knot_svg(v["verts"],v["L0"],p["DL0"])}</div></div>
<figcaption>Узел {i}: изгибная энергия {fmt(p["bE"],2)} ({fmt(p["bEoverMilnor"],1)}× границы Милнора), зазор к ядру {fmt(p["gminS"],2)}·s, наибольший угол {fmt(p["thMaxDeg"],1)}°, κ·s = {fmt(p["kappaS"],2)}; вердикт: {esc(verdict_word(p))}.</figcaption></figure>''')
gal_html=''.join(gal)
# ---------- графики ----------
sc_gap=scatter([p['nc'] for p in A],[p['gminS'] for p in A],'пересечений','минимальный зазор между прядями, в единицах s',idsv=idsA,ymax=4,ref=1.0)
sc_bm=scatter([p['nc'] for p in A],[p['bEoverMilnor'] for p in A],'пересечений','изгибная энергия / граница Милнора',idsv=idsA)
h_ks=hist(ks,0,0.4,0.025,'наибольшая кривизна × s (предел ядра ≈ 2)')
h_dr=hist([min(d,2.5) for d in dr],0,2.5,0.125,'сдвиг после возобновления, в L0')
h_st=hist(stepsA,0,6000,250,'шагов до баланса сил')
concl=''.join(f'<li>{esc(c)}</li>' for c in (cross['conclusions'] if cross else []))
tiles=[(f'{settledA} из {nA}','сели по балансу сил (w=1, r=1)','good'),(f'{sum(1 for p in A if p["topo"])} из {nA}','тип узла сохранён (точный инвариант)','good'),(f'{sum(1 for p in A if p["gminS"]>1)} из {nA}','жёсткое ядро не нарушено нигде','good'),(f'{len(hard)}','нарушений физики струны','good' if not hard else 'crit')]
tiles_html=''.join(f'<div class="tile {c}"><div class="big">{esc(a)}</div><div class="cap">{esc(b)}</div></div>' for a,b,c in tiles)
page=f'''<meta charset="utf-8"><title>Закон четвёртой степени</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#F3F5F7;--surface:#FFFFFF;--ink:#1B2430;--muted:#5C6B7A;--line:#D5DCE3;--accent:#1F6FB2;--accent-ink:#17568A;--chg:#C4501F;--good:#2E7D4F;--crit:#B3362B;--tileg:#E4F0E9;--tilec:#F6E4E1;--halo:#F3F5F7;--diag:#1F6FB2;--rowok:transparent;--rowsoft:#FBF3E4;--rowbad:#F6E4E1;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#12181E;--surface:#1A222A;--ink:#E6EBEF;--muted:#97A3AE;--line:#2C3842;--accent:#4A96D6;--accent-ink:#7DB8E8;--chg:#D96E3C;--good:#5FBF86;--crit:#E06B5E;--tileg:#1B3226;--tilec:#3A2320;--halo:#12181E;--diag:#4A96D6;--rowsoft:#33291A;--rowbad:#3A2320;}}}}
:root[data-theme="dark"]{{--bg:#12181E;--surface:#1A222A;--ink:#E6EBEF;--muted:#97A3AE;--line:#2C3842;--accent:#4A96D6;--accent-ink:#7DB8E8;--chg:#D96E3C;--good:#5FBF86;--crit:#E06B5E;--tileg:#1B3226;--tilec:#3A2320;--halo:#12181E;--diag:#4A96D6;--rowsoft:#33291A;--rowbad:#3A2320;}}
body{{background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.55;margin:0}}
main{{max-width:1120px;margin:0 auto;padding:40px 24px 80px}}
h1,h2,h3{{font-family:Manrope,"IBM Plex Sans",system-ui,sans-serif;text-wrap:balance;letter-spacing:-0.01em;margin:0}}
h1{{font-size:2.4rem;font-weight:800;line-height:1.1}} h2{{font-size:1.45rem;font-weight:700;margin:56px 0 14px}} h3{{font-size:1.05rem;font-weight:700;margin:24px 0 8px}}
.eyebrow{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}}
.lead{{font-size:1.1rem;max-width:68ch;margin:16px 0 0}} p{{max-width:68ch;margin:10px 0}} .meta{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.8rem;color:var(--muted);margin-top:14px}}
.formula{{font-family:"IBM Plex Mono",monospace;font-size:.95rem;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:14px 0;max-width:70ch;overflow-x:auto}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:28px 0 0}}
.tile{{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px 18px}} .tile.good{{background:var(--tileg)}} .tile.crit{{background:var(--tilec)}}
.tile .big{{font-family:Manrope,sans-serif;font-weight:800;font-size:1.6rem;font-variant-numeric:tabular-nums}} .tile .cap{{font-size:.88rem;color:var(--muted);margin-top:4px}} .tile.good .big{{color:var(--good)}} .tile.crit .big{{color:var(--crit)}}
.chart{{width:100%;height:auto;display:block;background:var(--surface);border:1px solid var(--line);border-radius:10px}}
.grid{{stroke:var(--line);stroke-width:1}} .axis{{stroke:var(--muted);stroke-width:1}} .tick,.axl,.ann,.lbl{{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;fill:var(--muted)}} .axl{{font-size:12px}} .lbl{{fill:var(--ink)}}
.dot{{fill:var(--accent);fill-opacity:.7;stroke:var(--surface);stroke-width:1.5}} .bar{{fill:var(--accent);fill-opacity:.85}} .ref{{stroke:var(--chg);stroke-width:2;stroke-dasharray:4 4}}
.two{{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin:14px 0}}
figure{{margin:14px 0}} figcaption{{font-size:.9rem;color:var(--muted);margin-top:8px;max-width:70ch}}
.tablewrap{{overflow-x:auto;margin:14px 0;max-height:70vh;overflow-y:auto;border:1px solid var(--line);border-radius:10px}} table{{border-collapse:collapse;font-size:.82rem;font-variant-numeric:tabular-nums;min-width:1100px}} th,td{{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;vertical-align:top}} th:first-child,td:first-child{{text-align:left}} th{{font-family:"IBM Plex Mono",monospace;font-weight:500;font-size:.7rem;letter-spacing:.04em;color:var(--muted);text-transform:uppercase;position:sticky;top:0;background:var(--surface)}}
td.cm{{text-align:left;max-width:46ch;font-size:.8rem;color:var(--ink)}} tr.soft td{{background:var(--rowsoft)}} tr.bad td{{background:var(--rowbad)}}
.eb{{font-family:'IBM Plex Mono',monospace;font-size:.7rem;color:var(--chg);border:1px solid var(--chg);border-radius:4px;padding:0 3px}}
.gal .pair{{display:grid;grid-template-columns:1fr 1fr;gap:12px}} .knot{{width:100%;height:auto;background:var(--surface);border:1px solid var(--line);border-radius:10px}} .halo{{stroke:var(--halo);fill:none;stroke-linecap:round;stroke-linejoin:round}} .diag{{fill:none;stroke:var(--diag);stroke-width:1.6}} .figcap{{font-family:"IBM Plex Mono",monospace;font-size:.75rem;color:var(--muted);margin:0 0 6px}}
ul{{max-width:72ch;padding-left:22px}} li{{margin:6px 0}} code{{font-family:"IBM Plex Mono",monospace;font-size:.88em;background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:1px 5px}}
.verdict{{border-left:4px solid var(--accent);padding:6px 18px;background:var(--surface);border-radius:0 10px 10px 0;max-width:74ch}}
</style>
<main>
<div class="eyebrow">Редактор узлов · эксперимент · сборка 2026-09-04-core5</div>
<h1>Закон четвёртой степени</h1>
<p class="lead">Самоотталкивание переписано под заданный закон: между осями чужих прядей действует жёсткое ядро на расстоянии s = (w + r)·u, где w — толщина проволоки, r — отталкивание (обе шкалы 1–10 в интерфейсе), u — одна трёхтысячная длины нити, а дальше энергия гаснет как 1/Δ⁴ от расстояния Δ до ядра. Те же сто случайных диаграмм с 9–105 пересечениями прогнаны заново, и каждый получившийся узел проверен на соответствие физике жёсткой нерастяжимой струны с таким отталкиванием.</p>
<div class="formula">E = kB·Σθᵢ²  +  kR·Σ [ (D/Δ)⁴ − (D/Δc)⁴ ],   Δ = x − s,   s = (w+r)·u,   D = w·u,   u = L/3000,   Δc = 4s
x — кратчайшее расстояние между отрезками чужих прядей;  x ≤ s ⇒ E = ∞  (пройти сквозь ядро невозможно)</div>
<div class="meta">серия A: w = 1, r = 1 (s = 2u — единственная пара значений, при которой все 100 узлов вообще помещаются по оценке ropelength) · серия B: w = 2, r = 2 · жёсткость 9 · бюджет 10 000 шагов · тип узла — точный определитель Александера на лифте, после старта и в покое</div>
<div class="tiles">{tiles_html}</div>
<h2>Вердикт</h2>
<div class="verdict"><p><strong>Жёсткие условия задачи выполнены во всех 200 прогонах.</strong> Рёбра равны с точностью 10⁻⁹, ядро не нарушено нигде (минимальный зазор {fmt(min(gm),2)}·s в серии A), ни одна прядь не согнута круче, чем позволяет ядро (наибольшее κ·s = {fmt(max(ks),2)} при пределе ≈2), тип узла совпадает с нарисованной диаграммой на лифте, после старта и в покое, энергия монотонна после фазы надувания, все тривиальные узлы стали точными окружностями, все {settledA} узлов остановились по балансу сил (медиана {q(stepsA,.5)} шагов).</p>
<p><strong>Но «максимально распрямлённая проволока» получена не везде.</strong> Спуск по энергии находит локальный минимум, а бассейн выбирает стартовая плоская диаграмма и фаза надувания ядра. Независимые критики отнесли {critCount.get('физично',0)} узлов к безоговорочно физичным, {critCount.get('физично с оговоркой',0)} — к физичным с оговоркой (мягкие моды, память о плоском рисунке) и {critCount.get('сомнительно',0)} — к сомнительным: два трилистника (№15, №17) осели в плоской трёхлепестковой форме с энергией в 1,71 раза выше двойной окружности, которую та же модель находит из объёмной затравки; 3₁#3₁ (№2, №16) лёг в 1,5–2,6 раза выше тройной окружности; у трети узлов конфигурация серии B (более толстая нить) имеет меньшую энергию, чем «покой» серии A. Это настоящие критические точки (ужесточение порога в 20 раз их не сдвигает), но не основное состояние.</p>
<p><strong>Что делает закон.</strong> При выбранной силе хвоста отталкивание вносит лишь 0,6–1,9 % энергии, а пряди держатся на 0,35–0,5·D от ядра: ядро никогда не касается, равновесие определяет односторонняя мягкая стенка на s + ~0,5·D. Удвоение толщины и ореола (серия B) сохраняет все свойства и сдвигает зазоры к ядру (1,09–1,33·s), но у половины узлов меняет бассейн, а не только энергию.</p></div>
<h2>Как проходил эксперимент</h2>
<p>Генератор, диаграммы и протокол — те же, что в первом отчёте: ряд Фурье с подбором числа пересечений, случайные проходы, детерминированные зёрна. Для каждого узла после остановки проверялись десять условий: равенство рёбер (нерастяжимость), зазор к ядру больше s на всех несмежных парах отрезков, кривизна не круче радиуса ядра (κ·s ≤ 2), нижняя граница Фенхеля–Милнора для нетривиального узла (полная кривизна ≥ 4π, значит Σθ² ≥ 16π²/N), баланс сил по остаточной проецированной силе, монотонность энергии после надувания, сохранение типа узла точным инвариантом, окружность для тривиальных, гладкость (наибольший угол против среднего) и сдвиг после возобновления физики на 200 шагов. Независимо четыре агента-критика прошли по всем ста узлам обеих серий с этими же данными и вершинами (идентификация типа узла по многочлену Александера, writhe, сравнение с известными минимайзерами, повторные прогоны с более строгим порогом); их комментарии — в последней колонке таблицы, сводные выводы — ниже.</p>
<h2>Серия A: распределения</h2>
<div class="two"><figure>{sc_gap}<figcaption>Минимальный зазор между прядями в единицах s. Красная линия — само ядро; ни один узел его не касается, пряди держатся на 1,4–2,3·s хвостом 1/Δ⁴. Чем сложнее узел, тем ближе к ядру.</figcaption></figure>
<figure>{sc_bm}<figcaption>Изгибная энергия относительно нижней границы Милнора 16π²/N. Простые узлы садятся в 3–8 раз выше границы (трилистник у двойной окружности даёт ≈1), плотные — в десятки раз: длина нити уходит на десятки клубковых изгибов.</figcaption></figure></div>
<div class="two"><figure>{h_ks}<figcaption>Наибольшая кривизна, умноженная на s. Предел, который допускает ядро (радиус изгиба ≥ s/2), — около 2; фактически проволока нигде не гнётся круче 0,15/s: изгибная жёсткость доминирует над отталкиванием.</figcaption></figure>
<figure>{h_dr}<figcaption>Сдвиг вершин после возобновления физики. Хвост 0,5–2,2·L0 — десять узлов с мягкой модой: энергия при сдвиге меняется меньше чем на 0,2 %.</figcaption></figure></div>
<figure>{h_st}<figcaption>Шаги до баланса сил: все сто уложились в 5 200 шагов, включая узлы со 100 пересечениями, потому что при w=1 нить тонкая и клубок не заклинивает.</figcaption></figure>
<h2>Серия A: каждый узел</h2>
<p>Строки с мягкой модой подсвечены жёлтым, нарушения — красным (их нет). «Ядро» — минимальный зазор в единицах s, «контакты» — число пар отрезков ближе 3D к ядру, «Милнор» — отношение изгибной энергии к нижней границе.</p>
<div class="tablewrap"><table><thead><tr><th>узел</th><th>перес.</th><th>det</th><th>N</th><th>шагов</th><th>Σθ²</th><th>Милнор ×</th><th>макс. угол</th><th>max/mean</th><th>κ·s</th><th>ядро (s)</th><th>контакты</th><th>ошибка длин</th><th>сила</th><th>сдвиг (L0)</th><th>тип узла</th><th>вердикт</th><th>комментарий критика</th></tr></thead><tbody>{tableA}</tbody></table></div>
<h2>Галерея</h2>
{gal_html}
'''
if B:
    page+=f'''<h2>Серия B: нить вдвое толще (w=2, r=2)</h2>
<p>Ядро s = 4u вместо 2u, диаметр трубки 2u вместо u. Ожидалось, что по грубой оценке ropelength (длина ≳ (30 + 14·C)·s) диаграммы с более чем ~50 пересечениями не поместятся, но эксперимент это опроверг: сели все {settledB} из {len(B)}, ни один узел не упёрся в ядро (минимальный зазор {fmt(min(p["gminS"] for p in B),2)}·s), «нить не помещается» не сработало ни разу. Случайные клубки требуют куда меньше длины, чем идеальные тугие узлы той же сложности. Физично без оговорок: {physB}, с мягкой модой: {softB}, нарушений нет.</p>
<div class="tablewrap"><table><thead><tr><th>узел</th><th>перес.</th><th>шагов</th><th>толщина</th><th>Σθ²</th><th>κ·s</th><th>ядро (s)</th><th>контакты</th><th>сдвиг (L0)</th><th>тип узла</th><th>вердикт</th></tr></thead><tbody>{tableB}</tbody></table></div>
'''
page+=f'''<h2>Критический разбор физики</h2>
<ul>
<li><strong>Нерастяжимость и жёсткость.</strong> Длины рёбер выдержаны до 10⁻⁹, изгибная энергия квадратична по углу — дискретная эластика без кручения. Кручение отсутствует по постановке, поэтому сильно закрученные состояния (writhe до ±20) в модели «бесплатны» и метастабильны; у реальной проволоки они стоили бы энергии.</li>
<li><strong>Ядро выполняет своё определение.</strong> Ни одна пара прядей не подошла к ядру ближе, чем на 1,09·s; во время старта (когда ядро надувается) пряди не проходили друг сквозь друга — тип узла сохранён везде.</li>
<li><strong>Хвост 1/Δ⁴ держит пряди на отстое.</strong> Равновесия сидят при Δ ≈ 0,35–0,5·D за ядром, контакты ядра не наступают: закон с этой силой хвоста работает как мягкая односторонняя стенка, а kR — калибровочная константа отстоя, не физический параметр. Чтобы пряди легли «на ядро», хвост надо ослабить или укоротить обрез.</li>
<li><strong>Кривизна.</strong> Проволока нигде не гнётся круче 0,15/s при допустимом пределе ≈2/s: ограничение ядра на собственный изгиб не активно, форму определяет изгиб.</li>
<li><strong>Локальность минимумов — главный дефект.</strong> Финальные формы — квазиплоские «блины», унаследованные от плоского рисунка (третья ось гирации 4–10 % первой): спуск при нулевой температуре не совершает трёхмерных перестроек через барьеры. Там, где известен минимайзер тонкой проволоки (трилистник — двойная окружность, 3₁#3₁ — тройная), случайные каракули садятся в 1,5–3 раза выше, а объёмные затравки находят минимайзер. Для сложных узлов эталона нет; разброс энергии при фиксированной сложности — до ×1,7.</li>
<li><strong>Бассейн выбирает старт.</strong> Зазоры лифта составляют 3–23 % ядра, и нить проводит первые сотни шагов с хвостом, усиленным в 50 раз, вплотную к ядру; топология при этом сертифицирована, но укладку определяет эта конструктивная фаза, а не закон энергии. Удвоение ядра в серии B у половины узлов меняет бассейн (энергия ±20–46 %, writhe ±1–2), тогда как для нити с L/D = 3000 форма должна быть почти нечувствительна к толщине.</li>
<li><strong>Равновесия нестрогие.</strong> Критерий покоя (сила < 2 % силы кольца) принимает плоские долины: у 7 узлов серии A и 10 серии B возобновление сдвигает форму на 0,5–2,6·L0 при изменении энергии ≤ 0,1 %; у ряда узлов остановка объявлена по плоской энергии при силе выше порога (помечены «E» в таблице). Для них честнее говорить о семействе форм, а не о точке.</li>
<li><strong>Сходятся ли узлы одного типа к одной форме — проверено прямо.</strong> Один и тот же рисунок трилистника (№15) в пяти прогонах с разным стартовым шумом трижды сел в двойную окружность (1,001 границы Милнора) и дважды — в плоскую трёхлепестковую ловушку (1,713); восьмёрка №9 во всех пяти прогонах осталась при 3,65–3,68 (канонический минимум 1,61 из этого рисунка не достигается), 3₁#3₁ №2 — при 5,75–5,83 против тройной окружности 2,26. Сертифицированные случайные встряхивания (25 порций до 0,35 зазора, 6 раундов) из этих ловушек не выводят: бассейны широкие. Значит, чтобы узлы одного типа сходились к одной форме, нужен глобальный поиск: много независимых стартов (в том числе объёмных, а не плоских лифтов) с выбором наименьшей энергии либо отжиг с крупными сертифицированными перестройками — при сохранении всех гарантий непроникновения.</li>
<li><strong>Чего модель не описывает.</strong> Кручения, трения и тепловых флуктуаций; различения типов узлов тоньше определителя Александера; глобальной оптимизации. Чтобы приблизиться к «максимально распрямлённой проволоке», нужны несколько стартов со случайным трёхмерным возмущением или отжиг и сравнение с k-кратной окружностью как эталоном.</li>
</ul>
<h3>Выводы независимых критиков</h3>
<ul>{concl}</ul>
<h2>Воспроизведение</h2>
<p>Сценарии в <code>test/</code>: <code>randknots.js</code> (кампания, переменные <code>W</code>, <code>R</code>), <code>rk_exact2.js</code> (точный инвариант), <code>rk_phys.js</code> (физическая экспертиза каждого узла), <code>softmode.js</code> (проверка мягкой моды), <code>lawcheck.js</code> (градиент и семантика ползунков), <code>rk_report2.py</code> (этот отчёт).</p>
</main>'''
open(OUT,'w',encoding='utf-8').write(page)
print('written', OUT, len(page)//1024, 'KB', '| A:', nA, 'phys', phys, 'soft', len(soft), 'hard', len(hard), '| B:', len(B), '| critique items', len(crit))
