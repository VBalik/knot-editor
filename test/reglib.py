# 4.14 (стенд): общие проверки диаграмм в Regina для klhard.py и hardreport.py.
import regina

def from_pd(pd):
    """Link из PD-кода; метки могут начинаться с 0 (spherogram) или с 1 (Regina, pdcode.js)."""
    pd=[tuple(int(x) for x in t) for t in pd]
    if min(min(t) for t in pd)==0: pd=[tuple(x+1 for x in t) for t in pd]
    return regina.Link.fromPD(pd)

def noR12(L):
    """Нет ни одного упрощающего хода Рейдемейстера I или II (слабая «трудность» по Кауфману–Ламбропулу)."""
    for c in L.crossings():
        if L.hasR1(c): return False
        for s in (0,1):
            if L.hasR2(c.strand(s)): return False
    return True

def r3orbit(L0, limit=3000):
    """BFS по ходам R3 (число пересечений не меняется). → (размер орбиты, найдена ли диаграмма с ходом R1/R2, обрезан ли обход).
    Орбита из одной диаграммы = ходов R3 нет вообще (строгая «трудность»)."""
    seen={L0.sig()}; q=[regina.Link(L0)]
    while q:
        L=q.pop()
        for c in L.crossings():
            for s in (0,1):
                for side in (0,1):
                    if L.hasR3(c.strand(s), side):
                        M=regina.Link(L); M.r3(M.crossing(c.index()).strand(s), side)
                        k=M.sig()
                        if k in seen: continue
                        seen.add(k)
                        if not noR12(M): return len(seen), True, False
                        q.append(M)
                        if len(seen)>=limit: return len(seen), False, True
    return len(seen), False, False

def _st_worker(pd, simplify, q):
    import regina
    L=from_pd(pd)
    if simplify: L.simplify()          # тот же узел, меньше пересечений → триангуляция меньше
    q.put(bool(L.complement().isSolidTorus()))

def solid_torus(L, timeout=120, tries=3):
    """Тривиальность узла: дополнение — полноторие. isSolidTorus() рандомизирован и на некоторых триангуляциях
    (Gordian из ExampleLink) может не заканчиваться, поэтому считаем в дочернем процессе с таймаутом, сначала на
    диаграмме, упрощённой simplify() (узел тот же), при неудаче повторяем. → True/False, None — не удалось за tries попыток."""
    import multiprocessing as mp, time
    pd=[list(t) for t in L.pdData()]
    ctx=mp.get_context('fork')
    for k in range(tries):
        q=ctx.Queue(); p=ctx.Process(target=_st_worker, args=(pd, True, q)); t=time.time(); p.start()
        p.join(timeout)
        if p.is_alive(): p.terminate(); p.join(); continue
        try: return q.get(timeout=5)
        except Exception: continue
    return None
