import { lastOf } from "../lib/series.js";
import { n, people } from "../lib/format.js";

const signed = v => (v > 0 ? "+" : v < 0 ? "-" : "") + people(Math.abs(v));

// Each card: a big number, a plain label, and one line saying what it means.
const ITEMS = [
  { key: "pop", label: "People living there", fmt: v => people(v), hint: "Everyone who lives in the country." },
  { key: "tfr", label: "Babies per woman", fmt: v => n(v, 1), hint: "Around 2.1 keeps a population level." },
  { key: "le", label: "Life expectancy", fmt: v => n(v, 0) + " years", hint: "How long a newborn can expect to live.", extra: s => {
    const f = lastOf(s.lef), m = lastOf(s.lem);
    return f && m ? `Women ${n(f.v, 0)}, men ${n(m.v, 0)}.` : null;
  } },
  { key: "cbr", label: "Births per 1,000 people", fmt: v => n(v, 1), hint: "New babies each year for every 1,000 people." },
  { key: "cdr", label: "Deaths per 1,000 people", fmt: v => n(v, 1), hint: "Deaths each year for every 1,000 people." },
  { key: "p014", label: "Children under 15", fmt: v => n(v, 0) + "%", hint: "Share of all people." },
  { key: "p65", label: "People aged 65 or older", fmt: v => n(v, 0) + "%", hint: "Share of all people." },
  { key: "dep", label: "Dependants per 100 workers", fmt: v => n(v, 0), hint: "Children and older people for every 100 adults of working age." },
  { key: "urban", label: "Living in cities", fmt: v => n(v, 0) + "%", hint: "Share of people in urban areas." },
  { key: "imr", label: "Babies who die before age 1", fmt: v => n(v, 1), hint: "Out of every 1,000 babies born." },
  { key: "mig", label: "Net migration", fmt: signed, hint: "Over five years. Plus means more people arrived than left." },
  { key: "gdp", label: "Income per person", fmt: v => "$" + n(v, 0), hint: "Economic output per person, in US dollars." }
];

export default function KeyNumbers({ s }) {
  return (
    <ul className="keynums">
      {ITEMS.map(it => {
        const l = lastOf(s[it.key]);
        const extra = l && it.extra ? it.extra(s) : null;
        return (
          <li key={it.key} className={l ? "kn" : "kn kn-off"}>
            <b>{l ? it.fmt(l.v) : "No data"}</b>
            <span className="kn-label">{it.label}</span>
            <span className="kn-hint">{it.hint}{extra ? " " + extra : ""}</span>
            {l && <small>Latest year: {l.y}</small>}
          </li>
        );
      })}
    </ul>
  );
}
