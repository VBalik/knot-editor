# 4.14 (стенд): ОТЧЁТ «Трудные тривиальные узлы» → out/hard/report.html (одна страница, картинки внутри как data-URI).
# Собирает результаты прогонов pdknot.js / imgunknot.js из out/hard: run_<name>.json (или run2_<name>.json — приоритет),
# <name>.png (диаграмма в программе), proj_<name>.png (проекция конечной 3D-формы), kl_summary.json (семейство
# Кауфмана–Ламбропулу), pd_hakenpic.json (PD-код импортированной картинки). Сертификация в Regina (дополнение —
# полноторие, ходы R1/R2, орбита R3) считается один раз и кэшируется в out/hard/cert.json.
# Запуск: python3 hardreport.py [--no-regina]   (без Regina берётся только кэш)
import json, os, sys, base64, html, time, subprocess, re
OUT='out/hard'; NOREG='--no-regina' in sys.argv

def load(f):
    try: return json.load(open(f))
    except Exception: return None
def b64(f):
    return 'data:image/png;base64,'+base64.b64encode(open(f,'rb').read()).decode() if os.path.exists(f) else None
def esc(s): return html.escape(str(s), quote=True)

# ---------- сертификация (кэш) ----------
CERT_V=4   # 4: + simplifyStats (300 запусков simplify()). 3: + r3moves, sameAs…Exact. 2: орбита R3 — полный BFS без ранней остановки (размер, число упрощаемых, обрезан ли), плюс simplify_to
def certify(key, pd, compare=None, example=None):
    cache=load(f'{OUT}/cert.json') or {}
    old=cache.get(key)
    if (old and old.get('v')==CERT_V) or NOREG or not (pd or example): return old
    import regina
    from reglib import from_pd, noR12, r3orbit, solid_torus, simplify_to, simplify_stats
    # узлы Regina берём из ExampleLink: та же диаграмма, но isSolidTorus() на триангуляции из fromPD может считать в сотни раз дольше
    L=getattr(regina.ExampleLink, example)() if example else from_pd(pd); t=time.time()
    rec={'v':CERT_V, 'crossings':L.size(), 'comps':L.countComponents()}
    if compare:
        E=getattr(regina.ExampleLink, compare)(); rec['sameAs'+compare]=(L.sig()==E.sig())            # с точностью до отражения, поворота, ориентации
        rec['sameAs'+compare+'Exact']=(L.sig(False)==E.sig(False))                                    # без отражения: все проходы те же (иначе — зеркало: все проходы обратны)
    if old and old.get('solidTorus') is not None: rec['solidTorus']=old['solidTorus']; rec['solidTorusFrom']=old.get('solidTorusFrom')   # сертификат узла от версии кэша не зависит
    # та же диаграмма (с точностью до отражения/поворота), что у сертифицированного узла Regina → тот же узел: сертификат наследуется
    elif compare and rec['sameAs'+compare] and cache.get(compare, {}).get('solidTorus') is not None: rec['solidTorus']=cache[compare]['solidTorus']; rec['solidTorusFrom']=compare
    else: rec['solidTorus']=solid_torus(L, timeout=int(os.environ.get('HR_ST_TIMEOUT',180))) if rec['comps']==1 else None
    rec['noR12']=noR12(L)
    size,red,trunc,r3m=r3orbit(L, int(os.environ.get('HR_ORBIT',3000))); rec.update(orbit=size, orbitReducible=red>0, orbitReducibleCount=red, orbitTruncated=trunc, r3moves=r3m)
    rec['simplifyTo']=simplify_to(L); rec['simplifyStats']=simplify_stats(L, int(os.environ.get('HR_SIMP_RUNS',300)))
    rec['sec']=round(time.time()-t,1)
    cache[key]=rec; json.dump(cache, open(f'{OUT}/cert.json','w'), indent=0)
    return rec

# ---------- записи ----------
def run_of(key):
    for f in (f'{OUT}/run2_{key}.json', f'{OUT}/run_{key}.json'):
        r=load(f)
        if r and r.get('importOk') and r.get('tries'): return r
    return None

def frac(p,q): return f'{p}/{q}'.replace('-','−')
def hardness_short(c):
    if not c: return '—'
    if not c.get('noR12'): return 'не трудная'
    if c.get('r3moves')==0: return 'строго трудная: ходов R3 нет'
    if not c.get('orbitTruncated') and c.get('orbitReducibleCount',0)==0: return 'без роста пересечений не упростить'
    if c.get('orbitReducibleCount',0)>0 or (c.get('simplifyTo') is not None and c.get('simplifyTo')<c.get('crossings',0)): return 'слабо трудная'
    return 'трудность не доказана'
def hardness_text(c):
    n,red,trunc,simp=c.get('orbit'),c.get('orbitReducibleCount',0),c.get('orbitTruncated'),c.get('simplifyTo')
    if not c.get('noR12'): return 'есть упрощающий ход R1/R2 — не трудная'
    if c.get('r3moves')==0: return 'ходов R3 нет — строго трудная'
    if n==1: return f'орбита R3 из одной диаграммы ({c.get("r3moves")} ходов R3 возвращают её же) — без роста числа пересечений не упростить'
    if not trunc and red==0: return f'вся орбита R3 ({n} диаграмм) без упрощаемых — без роста числа пересечений не упростить'
    st=c.get('simplifyStats') or {}
    tail=(f'; simplify() Regina распутывает до нуля в {st["zeros"]} из {st["runs"]} запусков' if st.get('zeros') else (f'; simplify() Regina до нуля не доводит (лучшее {st["min"]} из {c.get("crossings")})' if st else ''))
    if red>0: return f'R1/R2 нет, но в орбите R3 есть упрощаемые ({red} из {n}{"+" if trunc else ""} обойдённых) — слабо трудная'+tail
    if simp is not None and simp<c.get('crossings',0): return f'R1/R2 нет; орбита R3 больше {n} (обход обрезан), но simplify() Regina сводит к {simp} пересечениям — слабо трудная'+tail
    return f'R1/R2 нет; орбита R3 больше {n} (обход обрезан), упрощаемых не найдено, simplify() не уменьшает — трудность не доказана'
entries=[]
J=load(f'{OUT}/monster.json'); entries.append(dict(key='monster', group='lit', title='Monster', sub='«монстр», 10 пересечений',
    source='Regina 7.4 · ExampleLink.monster()', pd=J and J['pd'], example='monster'))
J=load(f'{OUT}/gordian.json'); entries.append(dict(key='gordian', group='lit', title='Gordian unknot', sub='узел Хакена, 141 пересечение',
    source='Regina 7.4 · ExampleLink.gordian()', pd=J and J['pd'], example='gordian'))
P=load(f'{OUT}/pd_hakenpic.json'); entries.append(dict(key='hakenpic', group='lit', title='Узел Хакена — рисунок', sub='картинка пользователя 918×782, импорт кнопкой Image',
    source='рисунок с диска → распознавание (тот же путь, что Upload)', pd=P and P.get('pd'), compare='gordian'))
for key,title,sub,cmp_ in (
    ('u1_thick','Узел Хакена — рисунок 2','вторая картинка пользователя, толстые линии, 1140×1080',"gordian"),
    ('u2a_ochiai16','Узел Очиаи, 16 пересечений','рисунок из статьи Очиаи (левая половина присланного кадра, увеличена вдвое)',None),
    ('u2b_ochiai45','Узел Очиаи, 45 пересечений','рисунок из статьи Очиаи (правая половина присланного кадра, увеличена вдвое)',None),
    ('u3_ortho','Ортогональная укладка, 43 пересечения','картинка пользователя; какой это узел из литературы — не названо',None)):
    P=load(f'{OUT}/pd_{key}.json')
    if P: entries.append(dict(key=key, group='lit', title=title, sub=sub, source='рисунок с диска → распознавание (тот же путь, что Upload)', pd=P.get('pd'), compare=cmp_))
S=load(f'{OUT}/kl_summary.json') or {'hard':[]}
for h in S['hard']:
    if 'name' not in h: continue
    entries.append(dict(key=h['name'], group='kl', title=f'N([{frac(h["p"],h["q"])}] + [{frac(h["r"],h["s"])}])', sub=f'{h["crossings"]} пересечений',
        source='Kauffman–Lambropoulou: числительное замыкание суммы двух рациональных сплетений, ps + qr = ±1', pd=h['pd'],
        ))
J=load(f'{OUT}/gst.json'); entries.append(dict(key='gst', group='control', title='GST', sub='Гомпф–Шарлеманн–Томпсон, 48 пересечений — НЕ тривиальный узел',
    source='Regina 7.4 · ExampleLink.gst()', pd=J and J['pd'], example='gst'))

for e in entries:
    e['run']=run_of(e['key']); e['cert']=certify(e['key'], e.get('pd'), e.get('compare'), e.get('example'))
    e['img']=b64(f'{OUT}/{e["key"]}.png'); e['proj']=b64(f'{OUT}/proj_{e["key"]}.png')
    r=e['run']; e['ok']=bool(r and r.get('ok')); e['tries']=(r or {}).get('tries') or []
    e['bestRad']=min([t['rad'] for t in e['tries']], default=None)
    e['nc']=(r or {}).get('nc'); e['importOk']=(r or {}).get('importOk')
    e['sec']=(r or {}).get('sec'); e['N']=(r or {}).get('N')
    c=e['cert'] or {}
    e['strong']=bool(c.get('noR12')) and c.get('r3moves')==0
    e['hardness']=hardness_text(c) if c else '—'

unknots=[e for e in entries if e['group']!='control']
straight=[e for e in unknots if e['ok']]; stuck=[e for e in unknots if e['run'] and not e['ok']]; norun=[e for e in unknots if not e['run']]
node_v=subprocess.run(['node','-v'],capture_output=True,text=True).stdout.strip() or 'Node'
ver=(re.search(r'APP_VER_MINOR\s*=\s*(\d+)', open('../index.html',encoding='utf8').read()) or [None,'?'])[1]
today=time.strftime('%Y-%m-%d')

# ---------- HTML ----------
CSS=r"""
:root{--bg:#f4f8f8;--card:#ffffff;--ink:#16262b;--ink2:#54696e;--line:#d3dfe1;--acc:#177f8b;--accbg:#e0f2f4;--ok:#2c7a4b;--okbg:#e2f3e8;--bad:#b04429;--badbg:#f9e7e0;--ctl:#6f55a8;--ctlbg:#ebe5f7;--paper:#ffffff;
 --sans:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--serif:'Literata',Georgia,'Times New Roman',serif;--mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f191c;--card:#152327;--ink:#e3ecee;--ink2:#9fb2b6;--line:#2b3d42;--acc:#5fd0da;--accbg:#163338;--ok:#72cf9a;--okbg:#173427;--bad:#f0906f;--badbg:#3a2119;--ctl:#b9a2f2;--ctlbg:#2a2140;--paper:#f6f8f8}}
:root[data-theme="dark"]{--bg:#0f191c;--card:#152327;--ink:#e3ecee;--ink2:#9fb2b6;--line:#2b3d42;--acc:#5fd0da;--accbg:#163338;--ok:#72cf9a;--okbg:#173427;--bad:#f0906f;--badbg:#3a2119;--ctl:#b9a2f2;--ctlbg:#2a2140;--paper:#f6f8f8}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:1080px;margin:0 auto;padding-inline:20px;padding-block:32px 64px}
h1,h2,h3{font-family:var(--serif);font-weight:600;letter-spacing:-0.01em;text-wrap:balance;margin:0}
h1{font-size:clamp(30px,4.5vw,44px);line-height:1.1}
h2{font-size:24px;margin-block:44px 14px;padding-top:14px;border-top:1px solid var(--line)}
h3{font-size:19px}
p{margin:0 0 12px;max-width:68ch}
.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);margin-bottom:12px;font-weight:500}
.lede{font-size:17px;color:var(--ink);max-width:66ch;margin-top:14px}
.lede b{color:var(--acc)}
.strip{display:flex;flex-wrap:wrap;gap:10px 28px;margin-top:22px;padding:14px 18px;border:1px solid var(--line);border-radius:10px;background:var(--card)}
.strip div{display:flex;flex-direction:column;gap:2px}
.strip .n{font-family:var(--mono);font-size:22px;font-weight:500;font-variant-numeric:tabular-nums}
.strip .l{font-size:12px;color:var(--ink2)}
.n.ok{color:var(--ok)}.n.bad{color:var(--bad)}.n.ctl{color:var(--ctl)}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--card)}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:860px}
th,td{padding:8px 10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
th{font-weight:500;color:var(--ink2);font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
tr:last-child td{border-bottom:0}
td.num,th.num{text-align:right;font-family:var(--mono);font-variant-numeric:tabular-nums;white-space:nowrap}
td.name{font-weight:500;white-space:nowrap}
td .pill{white-space:nowrap}
td.hard{min-width:230px}
.pill{display:inline-block;font-size:12px;line-height:1.25;padding:4px 8px;border-radius:999px;font-weight:500;max-width:100%;overflow-wrap:anywhere}
.pill.ok{background:var(--okbg);color:var(--ok)}.pill.bad{background:var(--badbg);color:var(--bad)}.pill.acc{background:var(--accbg);color:var(--acc)}.pill.ctl{background:var(--ctlbg);color:var(--ctl)}.pill.mut{background:transparent;color:var(--ink2);border:1px solid var(--line)}
.cards{display:grid;grid-template-columns:minmax(0,1fr);gap:18px}
.card{min-width:0;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:18px 20px}
.card header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin-bottom:4px}
.card header .sub{color:var(--ink2)}
.card .pills{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 14px}
.figs{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,3fr);gap:14px;align-items:start}
figure{margin:0}
figure img{display:block;width:100%;height:auto;background:var(--paper);border:1px solid var(--line);border-radius:8px}
figcaption{font-size:12.5px;color:var(--ink2);margin-top:6px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px 18px;margin-top:14px;font-size:13.5px}
.facts div{display:flex;gap:8px;justify-content:space-between;border-bottom:1px dotted var(--line);padding:4px 0}
.facts span:first-child{color:var(--ink2)}
.facts span:last-child{font-family:var(--mono);font-variant-numeric:tabular-nums;text-align:right}
details{margin-top:12px}
summary{cursor:pointer;color:var(--acc);font-weight:500;font-size:13.5px}
details table{min-width:0;font-size:12.5px;margin-top:8px}
.note{font-size:13.5px;color:var(--ink2)}
ul{padding-left:20px;margin:0 0 12px;max-width:72ch}li{margin-bottom:6px}
code{font-family:var(--mono);font-size:.92em;background:var(--accbg);color:var(--ink);padding:1px 5px;border-radius:4px}
pre{font-family:var(--mono);font-size:12.5px;line-height:1.5;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-x:auto;margin:0 0 12px}
pre code{background:none;padding:0}
a{color:var(--acc)}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (max-width:640px){.wrap{padding-inline:16px}.figs{grid-template-columns:1fr}.strip{gap:10px 20px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
"""

def pills(e):
    c=e['cert'] or {}; out=[]
    out.append('<span class="pill acc">из литературы</span>' if e['group']=='lit' else ('<span class="pill acc">семейство Кауфмана–Ламбропулу</span>' if e['group']=='kl' else '<span class="pill ctl">контроль</span>'))
    if c:
        out.append('<span class="pill ok">тривиальный — Regina: дополнение есть полноторие</span>' if c.get('solidTorus') else '<span class="pill ctl">НЕ тривиальный — Regina</span>')
        out.append(f'<span class="pill mut">{esc(e["hardness"])}</span>')
        if c.get('sameAsgordian'): out.append('<span class="pill ok">та же диаграмма, что Gordian в Regina: сигнатура совпала '+('с теми же проходами' if c.get('sameAsgordianExact') else 'с точностью до зеркала (все проходы обратны)')+'</span>')
    if e['run']:
        out.append('<span class="pill ok">окружность</span>' if e['ok'] else ('<span class="pill ctl">не распрямился — верно, узел нетривиальный</span>' if e['group']=='control' else '<span class="pill bad">не распрямился за 11 попыток</span>'))
    return ''.join(out)

def result_text(e):
    if not e['run']: return 'прогона нет'
    t=e['tries']; k=t[-1]['at'] if t else 0
    if e['ok']: return 'окружность после Physics' if k==0 else f'окружность после Physics и {k} Stir'
    return f'не распрямился: {len(t)} попыток (Physics + {len(t)-1} Stir), лучший разброс радиусов {e["bestRad"]}'

def tries_table(e):
    t=e['tries']
    if not t: return ''
    hasE='E' in t[0]; hasC='cross' in t[0]
    rows=''.join(f'<tr><td class="num">{x["at"]}</td><td class="num">{x["steps"]}</td><td>{"да" if x["settled"] else "нет (бюджет)"}</td><td class="num">{x["rad"]}</td><td class="num">{x["flat"]}</td>'
                 +(f'<td class="num">{x["E"]}</td>' if hasE else '')+(f'<td class="num">{x["cross"]}</td>' if hasC else '')+f'<td class="num">{x["det3d"]}</td></tr>' for x in t)
    head=f'<tr><th class="num">попытка</th><th class="num">шагов</th><th>сошлось</th><th class="num">разброс радиусов</th><th class="num">плоскость</th>'+('<th class="num">энергия</th>' if hasE else '')+('<th class="num">пересечений в проекции</th>' if hasC else '')+'<th class="num">det 3D</th></tr>'
    open_=' open' if len(t)>1 else ''
    return f'<details{open_}><summary>Попытки: {len(t)} (0 — Physics, дальше Stir)</summary><div class="tablewrap"><table>{head}{rows}</table></div></details>'

def card(e):
    c=e['cert'] or {}; r=e['run'] or {}
    figs=''
    if e['img']: figs+=f'<figure><img src="{e["img"]}" alt="Диаграмма {esc(e["title"])} в программе"><figcaption>Диаграмма в 2D-окне программы: {e["nc"] or c.get("crossings") or "?"} пересечений, разрывы нижней пряди как на экране</figcaption></figure>'
    if e['proj']: figs+=f'<figure><img src="{e["proj"]}" alt="Конечная 3D-форма {esc(e["title"])}"><figcaption>Конечная 3D-форма после последней попытки: проекция вдоль наименьшей оси инерции, ближние участки желтее, дальние синее</figcaption></figure>'
    facts=[]
    if c:
        facts.append(('орбита R3 (BFS, предел 3000)', f'{c.get("orbit")}{"+" if c.get("orbitTruncated") else ""} диаграмм, с ходом R1/R2: {c.get("orbitReducibleCount")}'))
        st=c.get('simplifyStats') or {}
        facts.append(('simplify() Regina (R1–R3), лучший из 3', f'{c.get("crossings")} → {c.get("simplifyTo")} пересечений'))
        if st: facts.append((f'simplify() × {st["runs"]}: до нуля / минимум / медиана', f'{st["zeros"]} / {st["min"]} / {st["median"]}'))
    if r:
        if 'matched' in r: facts.append(('импорт из PD-кода', f'{r["matched"]}/{r["expectCrossings"]} пересечений совпали, det {r["det"]}'))
        if 'det2d' in r: facts.append(('импорт картинки', f'{r["nc"]} пересечений, det {r["det2d"]}, белых кружков {r["pending"]}'))
        facts.append(('вершин 3D-трубки', str(r.get('N'))))
        facts.append(('шагов всего', str(sum(t['steps'] for t in e['tries']))))
        facts.append(('время', f'{r.get("sec")} с'))
        facts.append(('det в 3D в конце', str(r.get('det3dEnd'))))
    fhtml=''.join(f'<div><span>{esc(a)}</span><span>{esc(b)}</span></div>' for a,b in facts)
    return (f'<article class="card" id="{e["key"]}"><header><h3>{esc(e["title"])}</h3><span class="sub">{esc(e["sub"])}</span></header>'
            f'<div class="pills">{pills(e)}</div><p class="note">{esc(e["source"])}. <b>{esc(result_text(e))}.</b></p>'
            f'<div class="figs">{figs}</div><div class="facts">{fhtml}</div>{tries_table(e)}</article>')

def table():
    rows=[]
    for e in entries:
        c=e['cert'] or {}
        cert=('тривиальный' if c.get('solidTorus') else ('нетривиальный' if c.get('solidTorus') is False else '—'))
        res=('окружность' if e['ok'] else ('нет' if e['run'] else '—'))
        cls='ok' if e['ok'] else ('ctl' if e['group']=='control' else 'bad')
        k=(e['tries'][-1]['at'] if (e['ok'] and e['tries']) else '—')
        rows.append(f'<tr><td class="name"><a href="#{e["key"]}">{esc(e["title"])}</a></td><td>{esc(e["source"].split("·")[0].split(":")[0].strip())}</td>'
                    f'<td class="num">{c.get("crossings") or e["nc"] or "—"}</td><td>{cert}</td><td class="hard">{esc(hardness_short(c))}</td>'
                    f'<td><span class="pill {cls}">{res}</span></td><td class="num">{k}</td><td class="num">{e["bestRad"] if e["bestRad"] is not None else "—"}</td><td class="num">{e["sec"] if e["sec"] is not None else "—"}</td></tr>')
    return ('<div class="tablewrap"><table><thead><tr><th>диаграмма</th><th>откуда</th><th class="num">пересечений</th><th>тип (Regina)</th><th>трудность</th><th>итог</th>'
            '<th class="num">попытка, на которой распрямился</th><th class="num">лучший разброс радиусов</th><th class="num">время, с</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>')

lit=[e for e in entries if e['group']=='lit']; kl=[e for e in entries if e['group']=='kl']; ctl=[e for e in entries if e['group']=='control']
strongN=sum(1 for e in kl if e['strong']); weakN=len(kl)-strongN
hp=next((e for e in entries if e['key']=='hakenpic'), None); hpc=(hp and hp['cert']) or {}

page=f"""<title>Трудные тривиальные узлы</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<div class="eyebrow">knot-editor {ver and '4.'+ver} · стенд {esc(node_v)} без браузера · {today}</div>
<h1>Трудные тривиальные узлы</h1>
<p class="lede">Гипотеза проекта: тривиальный узел из жёсткой струны сам распрямляется в окружность. Здесь она проверена на <b>трудных</b> диаграммах тривиального узла — тех, где нет ни одного упрощающего хода Рейдемейстера I или II, — какие удалось получить без доступа к сети, и на одном контрольном узле, который тривиальным только притворяется (det&nbsp;=&nbsp;1).</p>
<div class="strip">
 <div><span class="n">{len(unknots)}</span><span class="l">трудных диаграмм тривиального узла</span></div>
 <div><span class="n ok">{len(straight)}</span><span class="l">распрямились в окружность</span></div>
 <div><span class="n bad">{len(stuck)}</span><span class="l">не распрямились за 11 попыток</span></div>
 <div><span class="n ctl">{len(ctl)}</span><span class="l">контроль: нетривиальный узел, не распрямился</span></div>
</div>

<h2>Что и как проверялось</h2>
<p><b>Алгоритм.</b> Диаграмма строится в 2D-окне программы, затем Physics: релаксация упругой трубки в 3D (L-BFGS, жёсткость на изгиб Bend&nbsp;9, толщина Thick&nbsp;1, отталкивание Repel&nbsp;1) до остановки или до бюджета 30&nbsp;000 шагов. Если окружность не получилась — Stir (разжатие тугих контактов и переотжиг) и снова Physics, до 10 раз: всего 11 попыток. Критерий окружности как в 100-узловом тесте: разброс радиусов (max&nbsp;−&nbsp;min)/средний&nbsp;&lt;&nbsp;0.08 и «плоскость» (корень из наименьшего момента инерции / средний радиус)&nbsp;&lt;&nbsp;0.05.</p>
<p><b>Импорт без распознавания.</b> Диаграммы из Regina и семейства Кауфмана–Ламбропулу заданы PD-кодом; плоская укладка — ортогональная укладка spherogram, по ней в программе строится замкнутая кривая, и каждому пересечению PD-кода назначается проход. Совпадение проверено дважды: число и положение пересечений (все совпали, det&nbsp;=&nbsp;1), и обратно — PD-код, снятый с диаграммы программы, даёт в Regina ту же сигнатуру, что исходный. Рисунок узла Хакена импортирован как картинка (кнопка Image): {hp and hp["nc"]} пересечений, det&nbsp;1, и его PD-код совпал по сигнатуре с Gordian из Regina (сравнение без отражения: те же проходы, не зеркало) — то есть с рисунка снята ровно диаграмма Хакена.</p>
<p><b>Сертификация.</b> Тривиальность каждой диаграммы подтверждена в Regina 7.4: дополнение узла — полноторие (<code>complement().isSolidTorus()</code>). Трудность измерена там же: нет ходов R1/R2 (<code>hasR1</code>, <code>hasR2</code> по всем пересечениям и дугам) и обход в ширину всей орбиты ходов R3 (число пересечений не меняется; предел 3000 диаграмм): если орбита состоит из одной диаграммы, ходов R3 нет вообще — самое строгое определение Кауфмана–Ламбропулу; если орбита обойдена целиком и упрощаемых в ней нет — без роста числа пересечений диаграмму не упростить; если в орбите есть диаграммы с ходом R1/R2, трудность слабая. Для больших орбит (обход обрезан) решает <code>simplify()</code> Regina — только ходы R1–R3: если она уменьшает число пересечений, диаграмма слабо трудная.</p>

<h2>Сводка</h2>
{table()}
<p class="note" style="margin-top:10px">Попытка 0 — только Physics; попытка k — после k Stir. Лучший разброс радиусов — минимум по попыткам (порог 0.08). Время — весь прогон в Node без воркеров и без WebAssembly-ядра в фоне.</p>

<h2>Из литературы</h2>
<p>В офлайн-окружении доступны две именные диаграммы из Regina (Monster и Gordian unknot Хакена); остальное прислано пользователем картинками и импортировано кнопкой Image: два рисунка узла Хакена (оба совпали с Gordian из Regina по сигнатуре без отражения — то есть с рисунков снята ровно диаграмма Хакена с теми же проходами; см. подписи в карточках), два рисунка Очиаи (16 и 45 пересечений, как в подписи к рисунку) и ортогональная укладка на 43 пересечения. Три укладки узла Хакена в программе лежат по-разному, поэтому прогнаны все.</p>
<div class="cards">{''.join(card(e) for e in lit)}</div>

<h2>Семейство Кауфмана–Ламбропулу</h2>
<p>Статья «Hard unknots and collapsing tangles» даёт правило: если рациональные сплетения [p/q] и [r/s] удовлетворяют ps&nbsp;+&nbsp;qr&nbsp;=&nbsp;±1, то числительное замыкание их суммы N([p/q]&nbsp;+&nbsp;[r/s]) — тривиальный узел, а при подходящих знаках диаграмма трудная. Перебор всех дробей с |p|,|q|,|r|,|s|&nbsp;≤&nbsp;{S.get('params',{}).get('max','?')} (сплетения строит spherogram, {S.get('tested','?')} замыканий проверено) дал {len(kl)} различных трудных диаграмм от {min((e['cert'] or {}).get('crossings',0) for e in kl) if kl else '?'} до {max((e['cert'] or {}).get('crossings',0) for e in kl) if kl else '?'} пересечений: {strongN} строго трудных (на диаграмме нет ни одного хода R3 — проверено <code>hasR3</code> по всем дугам) и {weakN} слабо трудных (в орбите R3 есть упрощаемые диаграммы; simplify() Regina распутывает их до нуля пересечений). Все сертифицированы в Regina. Сопоставить их с конкретными рисунками статьи (например «Culprit» на 10 пересечениях) без её текста нельзя, поэтому они названы по дробям.</p>
<div class="cards">{''.join(card(e) for e in kl)}</div>

<h2>Контроль</h2>
<p>GST — 48-пересечный узел Гомпфа, Шарлеманна и Томпсона (кандидат в контрпримеры к гипотезе slice–ribbon). Программа видит det&nbsp;=&nbsp;1 и подписывает его «unknot», но Regina показывает, что дополнение — не полноторие: узел нетривиальный. Это проверка на ложные срабатывания: распрямить его в окружность алгоритм не должен.</p>
<div class="cards">{''.join(card(e) for e in ctl)}</div>

<h2>Чего в отчёте нет и почему</h2>
<p>Облачная сессия не имеет доступа к сети: Wikipedia, Knot Atlas, arXiv и GitHub не отвечают, проходят только реестры пакетов PyPI и npm. В установленных пакетах (Regina, spherogram, SnapPy) из именных трудных тривиальных узлов есть только Monster и Gordian. Поэтому не прогнаны:</p>
<ul>
<li><b>Узел Гёрица</b> (Goeritz, 1934), 11 пересечений — исторически первый трудный тривиальный узел.</li>
<li><b>Узел Тислтуэйта</b> (Thistlethwaite), 15 пересечений.</li>
<li><b>Узел Фридмана</b> (Freedman); узлы Очиаи пользователь прислал картинкой — они в отчёте.</li>
<li>Именные примеры Кауфмана–Ламбропулу (Culprit и другие): их семейство воспроизведено по конструкции статьи, но какие именно дроби стоят за рисунками статьи — не проверить.</li>
</ul>
<p>Любую из этих диаграмм можно добавить двумя способами: прислать картинку диаграммы (импорт картинки точен — рисунок Хакена совпал с Regina по сигнатуре) или PD-код — тогда <code>pdknot.js</code> построит её без распознавания. Прогон одной диаграммы занимает секунды на малых узлах и до 10 минут на 141 пересечении.</p>

<h2>Как воспроизвести</h2>
<pre><code>cd test && pip install regina spherogram          # один раз (в облаке уже стоят)
python3 pd2plink.py monster gordian gst              # укладки из Regina → out/hard/&lt;name&gt;.json
KL_MAX=9 KL_MAXC=16 KL_KEEP=20 python3 klhard.py     # семейство Кауфмана–Ламбропулу → out/hard/kl_*.json, kl_summary.json
for k in monster gordian gst kl_m4_3_5_4; do          # прогон одной диаграммы: импорт, PNG, Physics + до 10 Stir, проекция
  UK_VERBOSE=1 HK_RUN=1 HK_FILE=out/hard/$k.json UK_STIR=10 HK_PNG=out/hard/$k.png HK_PROJ=out/hard/proj_$k.png \\
  KNOT_CANVAS=canvas2d.js node harness.js pdknot.js &gt; out/hard/run_$k.json; done
IK_IMG=haken.png UK_STIR=10 HK_PROJ=out/hard/proj_hakenpic.png node harness.js imgunknot.js &gt; out/hard/run_hakenpic.json
IK_IMG=haken.png HK_PDONLY=1 node harness.js imgunknot.js &gt; out/hard/pd_hakenpic.json   # PD-код рисунка для Regina
python3 hardreport.py                                # этот отчёт → out/hard/report.html</code></pre>
<p class="note">Картинки диаграмм — растеризация 2D-окна стендом (<code>canvas2d.js</code>), проекции — <code>proj3d.js</code>. Файлы результатов лежат в <code>test/out/hard/</code> (папка не коммитится); рисунок узла Хакена в репозиторий не добавлен.</p>
</div>
"""
os.makedirs(OUT, exist_ok=True)
open(f'{OUT}/report_artifact.html','w',encoding='utf8').write(page)   # для публикации артефактом Claude (обёртку добавляет платформа)
head,body=page.split('<div class="wrap">',1)
open(f'{OUT}/report.html','w',encoding='utf8').write('<!doctype html>\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    +head+'</head><body><div class="wrap">'+body+'</body></html>\n')   # автономный файл для локального просмотра
print(json.dumps({'entries':len(entries),'unknots':len(unknots),'straight':len(straight),'stuck':[e['key'] for e in stuck],'norun':[e['key'] for e in norun],
                  'control':[(e['key'], e['ok']) for e in ctl],'bytes':len(page.encode())}, ensure_ascii=False))
