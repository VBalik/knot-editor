# 4.20 (стенд): PD-код проекции 3D-лифта вдоль z (из дампа HK_LIFTDUMP / UK_DUMPLIFT) и сверка с диаграммой в Regina:
# число пересечений, тривиальность, сигнатура (сравнение с ExampleLink по имени, если задано). python3 liftpd.py <dump.json> [gordian]
import sys, json
from reglib import from_pd, solid_torus
D=json.load(open(sys.argv[1])); n=len(D['verts'])
# невырожденная проекция: крошечный наклон (якоря лифта ставят вершины ровно в точки пересечений — проекция вдоль z вырождена)
EPS=(1.3e-3, 0.7e-3); V=[[v[0]+EPS[0]*v[2], v[1]+EPS[1]*v[2], v[2]] for v in D['verts']]
# пересечения проекции: отрезки i→i+1
ev=[]  # (arc position along polyline index space, crossing id, is_over)
cr=[]
for i in range(n):
    a=V[i]; b=V[(i+1)%n]; bx=b[0]-a[0]; by=b[1]-a[1]
    for j in range(i+2,n):
        if i==0 and j==n-1: continue
        c=V[j]; d=V[(j+1)%n]; dx=d[0]-c[0]; dy=d[1]-c[1]; den=bx*dy-by*dx
        if abs(den)<1e-14: continue
        s=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den; u=((c[0]-a[0])*by-(c[1]-a[1])*bx)/den
        if 0<s<1 and 0<u<1:
            zi=a[2]+(b[2]-a[2])*s; zj=c[2]+(d[2]-c[2])*u
            cr.append({'i':i+s,'j':j+u,'overI':zi>zj,'di':(bx,by),'dj':(dx,dy)})
print('projected crossings', len(cr), 'diagram crossings', len(D['crossings']), 'N', n, 'liftCheck', D.get('liftCheck'))
# PD: события по дуговой позиции
events=[]
for k,c in enumerate(cr):
    events.append((c['i'],k,'i')); events.append((c['j'],k,'j'))
events.sort()
m=len(events); pos={ (k,w):idx for idx,(s,k,w) in enumerate(events) }
pd=[]
for k,c in enumerate(cr):
    ki=pos[(k,'i')]; kj=pos[(k,'j')]
    over_i=c['overI']
    ku,ko=(kj,ki) if over_i else (ki,kj)
    du=c['dj'] if over_i else c['di']; do=c['di'] if over_i else c['dj']
    inU=((ku-1)%m)+1; outU=ku+1; inO=((ko-1)%m)+1; outO=ko+1
    crs=du[0]*do[1]-du[1]*do[0]   # математическая ориентация (y вверх — мировые координаты лифта)
    j_=outO if crs<0 else inO; l_=inO if crs<0 else outO
    pd.append((inU,j_,outU,l_))
L=from_pd(pd); print('regina: crossings', L.size(), 'components', L.countComponents())
st=solid_torus(L, timeout=60); print('unknot (solid torus):', st)
if len(sys.argv)>2:
    import regina; E=getattr(regina.ExampleLink, sys.argv[2])(); print('sig == '+sys.argv[2]+':', L.sig()==E.sig(), '| exact (no reflection):', L.sig(False)==E.sig(False))
    M=regina.Link(L); M.simplify(); print('simplify ->', M.size())
