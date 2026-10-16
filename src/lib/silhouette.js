// Turns a country's outline into one SVG path, drawn big on the country page.
// Plain Mercator maths, so no extra map library is needed. Countries that cross the
// 180 degree line (Russia, Fiji, the United States) are shifted so they stay in one piece.
export function silhouettePath(feature, w = 360, h = 260, pad = 10) {
  const g = feature.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;

  let min = Infinity, max = -Infinity;
  for (const p of polys) for (const c of p[0]) { if (c[0] < min) min = c[0]; if (c[0] > max) max = c[0]; }
  const wrap = max - min > 180;

  const project = ([lon, lat]) => {
    const L = wrap && lon < 0 ? lon + 360 : lon;
    const phi = (Math.max(-80, Math.min(80, lat)) * Math.PI) / 180;
    return [(L * Math.PI) / 180, -Math.log(Math.tan(Math.PI / 4 + phi / 2))];
  };

  const rings = [];
  for (const p of polys) for (const ring of p) rings.push(ring.map(project));

  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const r of rings) for (const [x, y] of r) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const k = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * k) / 2;
  const oy = (h - (y1 - y0) * k) / 2;

  const d = rings
    .map(r => "M" + r.map(([x, y]) => `${((x - x0) * k + ox).toFixed(1)},${((y - y0) * k + oy).toFixed(1)}`).join("L") + "Z")
    .join("");
  return { d, w, h };
}
