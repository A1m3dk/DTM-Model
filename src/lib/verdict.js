import { STAGES } from "./dtm.js";
import { n } from "./format.js";
import { lastOf } from "./series.js";

// One short paragraph, computed from the data, that opens each country page.
export function verdict(name, stage, s) {
  if (!stage) {
    return `The World Bank has no recent birth and death figures for ${name}, so it cannot be placed on the ladder.`;
  }
  const st = STAGES[stage];
  const out = [`${name} is in the "${st.name}" stage. ${st.blurb}`];
  const b = lastOf(s.cbr), d = lastOf(s.cdr), t = lastOf(s.tfr), le = lastOf(s.le);
  if (b && d) out.push(`Each year there are about ${n(b.v, 1)} births and ${n(d.v, 1)} deaths for every 1,000 people.`);
  if (t && le) {
    out.push(`The average woman has ${n(t.v, 1)} babies, ${t.v < 2.1 ? "below" : "above"} the 2.1 that keeps a population level, and people live to about ${n(le.v, 0)}.`);
  } else if (t) {
    out.push(`The average woman has ${n(t.v, 1)} babies.`);
  } else if (le) {
    out.push(`People live to about ${n(le.v, 0)}.`);
  }
  return out.join(" ");
}
