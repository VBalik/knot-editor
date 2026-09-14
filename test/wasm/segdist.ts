// Ядро пар на AssemblyScript: расстояние отрезок–отрезок (тот же порядок операций, что в _segDist index.html).
// Память: X[n],Y[n],Z[n] (f64) с offX/offY/offZ; пары (i,j) Int32 по offP (ip=i+1 mod n, jp=j+1 mod n);
// выходы f64 по offOut: dist, s, t, dx, dy, dz на пару (6 значений).
export function segDistAll(n: i32, npairs: i32, offX: usize, offY: usize, offZ: usize, offP: usize, offOut: usize): f64 {
  const E: f64 = 1e-12; let gmin: f64 = Infinity;
  for (let k: i32 = 0; k < npairs; k++) {
    const i: i32 = load<i32>(offP + ((k * 2) << 2)), j: i32 = load<i32>(offP + ((k * 2 + 1) << 2));
    const ip: i32 = i + 1 == n ? 0 : i + 1, jp: i32 = j + 1 == n ? 0 : j + 1;
    const p1x = load<f64>(offX + (i << 3)), p1y = load<f64>(offY + (i << 3)), p1z = load<f64>(offZ + (i << 3));
    const p2x = load<f64>(offX + (j << 3)), p2y = load<f64>(offY + (j << 3)), p2z = load<f64>(offZ + (j << 3));
    const d1x = load<f64>(offX + (ip << 3)) - p1x, d1y = load<f64>(offY + (ip << 3)) - p1y, d1z = load<f64>(offZ + (ip << 3)) - p1z;
    const d2x = load<f64>(offX + (jp << 3)) - p2x, d2y = load<f64>(offY + (jp << 3)) - p2y, d2z = load<f64>(offZ + (jp << 3)) - p2z;
    const rx = p1x - p2x, ry = p1y - p2y, rz = p1z - p2z;
    const a = d1x*d1x + d1y*d1y + d1z*d1z, e = d2x*d2x + d2y*d2y + d2z*d2z, f = d2x*rx + d2y*ry + d2z*rz;
    let s: f64 = 0, t: f64 = 0;
    if (a <= E && e <= E) { s = 0; t = 0; }
    else if (a <= E) { s = 0; t = f / e; t = t < 0 ? 0 : (t > 1 ? 1 : t); }
    else { const c = d1x*rx + d1y*ry + d1z*rz;
      if (e <= E) { t = 0; s = -c / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); }
      else { const b = d1x*d2x + d1y*d2y + d1z*d2z, dn = a*e - b*b;
        if (dn > E) { s = (b*f - c*e) / dn; s = s < 0 ? 0 : (s > 1 ? 1 : s); } else s = 0;
        t = (b*s + f) / e;
        if (t < 0) { t = 0; s = -c / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); } else if (t > 1) { t = 1; s = (b - c) / a; s = s < 0 ? 0 : (s > 1 ? 1 : s); } } }
    const dx = (p1x + d1x*s) - (p2x + d2x*t), dy = (p1y + d1y*s) - (p2y + d2y*t), dz = (p1z + d1z*s) - (p2z + d2z*t);
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const o: usize = offOut + ((k * 6) << 3);
    store<f64>(o, d); store<f64>(o + 8, s); store<f64>(o + 16, t); store<f64>(o + 24, dx); store<f64>(o + 32, dy); store<f64>(o + 40, dz);
    if (d < gmin) gmin = d;
  }
  return gmin;
}
