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
    """Орбита ходов R3 (число пересечений не меняется): обход в ширину по sig() без ранней остановки, до limit диаграмм.
    → (размер орбиты, сколько диаграмм в ней имеют ход R1/R2, обрезан ли обход, число ходов R3 на исходной диаграмме).
    Ходов R3 нет (последнее = 0) — строгая «трудность» Кауфмана–Ламбропулу (орбита из одной диаграммы сама по себе
    этого не доказывает: ход R3 может вернуть ту же диаграмму с точностью до симметрии); полная орбита без
    упрощаемых = без роста числа пересечений не упростить; обрезанный обход ничего не доказывает — смотри simplify_to()."""
    from collections import deque
    seen={L0.sig()}; q=deque([regina.Link(L0)]); red=0 if noR12(L0) else 1
    r3moves=sum(1 for c in L0.crossings() for s in (0,1) for side in (0,1) if L0.hasR3(c.strand(s), side))   # ходов R3 на исходной диаграмме (0 = строго трудная)
    while q:
        L=q.popleft()
        for c in L.crossings():
            for s in (0,1):
                for side in (0,1):
                    if L.hasR3(c.strand(s), side):
                        M=regina.Link(L); M.r3(M.crossing(c.index()).strand(s), side)
                        k=M.sig()
                        if k in seen: continue
                        seen.add(k)
                        if not noR12(M): red+=1
                        if len(seen)>=limit: return len(seen), red, True, r3moves
                        q.append(M)
    return len(seen), red, False, r3moves

def simplify_to(L, rounds=3):
    """Число пересечений после Link.simplify() Regina (только R1–R3, без роста числа пересечений; случайные R3) —
    лучший результат из rounds попыток. Меньше исходного → диаграмма упрощается без роста пересечений (слабо трудная)."""
    best=L.size()
    for _ in range(rounds):
        M=regina.Link(L); M.simplify(); best=min(best, M.size())
    return best

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
    # время распознавания зависит от триангуляции и случайности: чередуем исходную и упрощённую диаграмму,
    # таймаут растёт (timeout/3, timeout/3, timeout, timeout, …) — всего 2·tries попыток
    plan=[(False, timeout//3), (True, timeout//3)]+[(k%2==1, timeout) for k in range(2*tries-2)]
    for simplify, tmo in plan:
        q=ctx.Queue(); p=ctx.Process(target=_st_worker, args=(pd, simplify, q)); p.start()
        p.join(tmo)
        if p.is_alive(): p.terminate(); p.join(); continue
        try: return q.get(timeout=5)
        except Exception: continue
    return None

def simplify_stats(L, runs=300):
    """Статистика случайного Link.simplify() (по документации Regina: simplifyToLocalMinimum — уменьшающие R1/R2 — плюс
    случайные R3, без роста числа пересечений): сколько запусков дошли до нуля пересечений, минимум/медиана остальных."""
    sizes=[]
    for _ in range(runs):
        M=regina.Link(L); M.simplify(); sizes.append(M.size())
    nz=sorted(x for x in sizes if x>0)
    return {'runs':runs, 'zeros':sum(1 for x in sizes if x==0), 'min':(nz[0] if nz else 0), 'median':(nz[len(nz)//2] if nz else 0), 'max':(nz[-1] if nz else 0)}
