# 4.14 (стенд): плоские укладки трудных тривиальных узлов из Regina (ExampleLink) через spherogram (ортогональная укладка).
# Пишет out/hard/<name>.json: {name, crossings, verts:[[x,y]…], arrows:[[i,j]…], cross:[[underArrow, overArrow]…], pd}
# Запуск: python3 pd2plink.py [имена…]   (по умолчанию monster gordian; gst — контроль: НЕ тривиальный узел).
# Нужны pip-пакеты regina и spherogram. Функция export(name, pd, extra) используется и klhard.py.
import sys, json, os
import spherogram
from spherogram.links.orthogonal import OrthogonalLinkDiagram

def export(name, pd, extra=None, outdir='out/hard'):
    os.makedirs(outdir, exist_ok=True)
    S=spherogram.Link([tuple(t) for t in pd])
    verts, arrows, cross = OrthogonalLinkDiagram(S).plink_data()
    rec={'name':name, 'crossings':len(pd), 'verts':[list(v) for v in verts], 'arrows':[list(a) for a in arrows],
         'cross':[[c[0], c[1]] for c in cross], 'pd':[list(t) for t in pd]}
    if extra: rec.update(extra)
    json.dump(rec, open(f'{outdir}/{name}.json','w'))
    return rec

if __name__=='__main__':
    import regina
    names=sys.argv[1:] or ['monster','gordian']
    for n in names:
        L=getattr(regina.ExampleLink, n)()
        rec=export(n, [list(t) for t in L.pdData()])
        print(n, 'crossings', L.size(), 'verts', len(rec['verts']), 'arrows', len(rec['arrows']), 'cross', len(rec['cross']))
