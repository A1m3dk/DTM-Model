import { n, people } from "./format.js";
import { STAGES } from "./dtm.js";
import { firstOf, lastOf, argmax, sustainedBelow, stageSeries } from "./series.js";

// Plain-English sentences computed straight from the data. No opinions in here.
export function dataInsights(name, s, T) {
  const out = [];

  const t0 = firstOf(s.tfr), t1 = lastOf(s.tfr);
  if (t0 && t1 && t0.y !== t1.y) {
    out.push(`In ${t0.y} the average woman in ${name} had ${n(t0.v, 1)} babies. In ${t1.y} it is ${n(t1.v, 1)}.`);
  }
  const rep = sustainedBelow(s.tfr, 2.1);
  if (rep && !rep.already) {
    out.push(`The number of babies per woman fell below 2.1 in ${rep.year}. That is roughly what it takes to keep a population level when nobody moves in or out.`);
  } else if (!rep && t1) {
    out.push(`Women still have more than the 2.1 babies it takes to keep the population level, so ${name} keeps growing from births alone.`);
  }

  const l0 = firstOf(s.le), l1 = lastOf(s.le);
  if (l0 && l1 && l1.y !== l0.y) {
    const d = l1.v - l0.v;
    out.push(`People live ${n(Math.abs(d), 0)} years ${d >= 0 ? "longer" : "less"} than in ${l0.y} (${n(l0.v, 0)} years then, ${n(l1.v, 0)} now).`);
  }

  const p0 = firstOf(s.pop), p1 = lastOf(s.pop);
  if (p0 && p1 && p1.y !== p0.y) {
    const r = p1.v / p0.v;
    out.push(r >= 1
      ? `The population grew from ${people(p0.v)} in ${p0.y} to ${people(p1.v)} in ${p1.y}. That is ${n(r, 1)} times bigger.`
      : `The population fell from ${people(p0.v)} in ${p0.y} to ${people(p1.v)} in ${p1.y}.`);
  }

  const o0 = firstOf(s.p65), o1 = lastOf(s.p65);
  if (o0 && o1 && o0.v > 0 && o1.v > 0) {
    out.push(`About 1 in ${Math.round(100 / o1.v)} people is 65 or older (${o1.y}). In ${o0.y} it was 1 in ${Math.round(100 / o0.v)}.`);
  }

  const pk = argmax(s.grow);
  if (pk) out.push(`Growth was fastest in ${pk.y}, at ${n(pk.v, 1)}% a year.`);

  const dep = lastOf(s.dep);
  if (dep) out.push(`For every 100 people of working age there are about ${n(dep.v, 0)} children and older people to support (${dep.y}).`);

  const st = stageSeries(s, T);
  const ys = Object.keys(st).map(Number).sort((a, b) => a - b);
  if (ys.length) {
    const cur = st[ys[ys.length - 1]];
    let i = ys.length - 1;
    while (i > 0 && st[ys[i - 1]] === cur) i--;
    out.push(i === 0
      ? `It has been in the "${STAGES[cur].name}" stage for as long as the data goes back (${ys[0]}).`
      : `It has been in the "${STAGES[cur].name}" stage since ${ys[i]}.`);
  }
  return out;
}
