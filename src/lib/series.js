import { stageOf } from "./dtm.js";

const years = m => Object.keys(m || {}).map(Number).sort((a, b) => a - b);

export function lastOf(m) {
  const ys = years(m);
  return ys.length ? { y: ys[ys.length - 1], v: m[ys[ys.length - 1]] } : null;
}
export function firstOf(m) {
  const ys = years(m);
  return ys.length ? { y: ys[0], v: m[ys[0]] } : null;
}
export function argmax(m) {
  let best = null;
  for (const y of years(m)) if (best === null || m[y] > best.v) best = { y, v: m[y] };
  return best;
}
// First year from which the series stays below `thr` for good.
export function sustainedBelow(m, thr) {
  const ys = years(m);
  if (!ys.length) return null;
  let lastAbove = -1;
  ys.forEach((y, i) => { if (m[y] >= thr) lastAbove = i; });
  if (lastAbove === ys.length - 1) return null;
  if (lastAbove === -1) return { year: ys[0], already: true };
  return { year: ys[lastAbove + 1], already: false };
}
export function stageSeries(s, T) {
  const out = {};
  for (const y in s.cbr) if (s.cdr[y] != null) out[y] = stageOf(s.cbr[y], s.cdr[y], T);
  return out;
}
export function ageYears(c) {
  return years(c.a.MA[0]);
}
export function shapeOf(s, y) {
  const a = s.p014 && s.p014[y], o = s.p65 && s.p65[y];
  if (a == null || o == null) return null;
  if (a >= 30) return { label: "A young country", text: "Lots of children at the bottom, so the shape is wide at the base." };
  if (a <= 18 && o >= 15) return { label: "An ageing country", text: "Fewer children than adults in their middle years, so the base is narrow." };
  return { label: "A balanced country", text: "Children, adults and older people are in fairly even numbers." };
}
