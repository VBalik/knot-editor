# 4.14 (стенд): ДИАГРАММА ЧЁРНЫМ ПО БЕЛОМУ по выгрузке HK_DUMP (pdknot.js / imgunknot.js): без колец, нижняя прядь разорвана
# просветом у каждого пересечения. python3 blackink.py <dump.json> <out.png> [ширина px=1600] [толщина=6] [просвет=×толщины 2.2]
import sys, json, math
from PIL import Image, ImageDraw
d=json.load(open(sys.argv[1])); W=int(sys.argv[3]) if len(sys.argv)>3 else 1600; lw=float(sys.argv[4]) if len(sys.argv)>4 else 6; gk=float(sys.argv[5]) if len(sys.argv)>5 else 2.2
P=d['pts']; n=len(P); xs=[p[0] for p in P]; ys=[p[1] for p in P]
mg=40; sc=(W-2*mg)/max(max(xs)-min(xs), 1e-9); H=int((max(ys)-min(ys))*sc+2*mg)
S=4  # суперсэмплинг
T=lambda p: ((p[0]-min(xs))*sc*S+mg*S, (p[1]-min(ys))*sc*S+mg*S)
im=Image.new('L',(W*S,H*S),255); dr=ImageDraw.Draw(im)
pts=[T(p) for p in P]; w=lw*S
def stroke(seq):
    dr.line(seq+[seq[0]] if seq is pts else seq, fill=0, width=int(w), joint='curve')
    for q in seq: dr.ellipse((q[0]-w/2,q[1]-w/2,q[0]+w/2,q[1]+w/2), fill=0)
stroke(pts)
# дуговые позиции вершин
cum=[0.0]
for i in range(n): cum.append(cum[-1]+math.dist(P[i],P[(i+1)%n]))
total=d['total'] or cum[-1]; k=cum[-1]/total
import bisect
def at(s):   # точка кривой на дуговой позиции s (единицы программы), линейная интерполяция
    s=(s*k)%cum[n]; i=bisect.bisect_right(cum, s)-1; i=min(i,n-1); t=(s-cum[i])/max(cum[i+1]-cum[i],1e-9)
    a=pts[i]; b=pts[(i+1)%n]; return (a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t)
def window(s0, half, m=12):
    return [at(s0-half+2*half*q/m) for q in range(m+1)]
R=lw*gk
for c in d['cross']:                                                 # сначала все просветы (стираем обе пряди)…
    cx,cy=T((c['x'],c['y'])); r=R*S; dr.ellipse((cx-r,cy-r,cx+r,cy+r), fill=255)
for c in d['cross']:                                                 # …потом все верхние пряди заново, чтобы соседний просвет не стёр уже нарисованную
    sO=c['sA'] if c['over']=='A' else c['sB']
    seq=window(sO, (R+lw)/sc)
    if len(seq)>=2: stroke(seq)
im=im.resize((W,H), Image.LANCZOS); im.save(sys.argv[2]); print(sys.argv[2], W, H, 'crossings', len(d['cross']))
