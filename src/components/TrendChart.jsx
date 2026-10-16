import { useMemo, useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { n, people } from "../lib/format.js";
import { MEN, WOMEN } from "./Pyramid.jsx";

const BLUE = "#1b86c9", INK = "#10283a";
const compact = v => (Math.abs(v) >= 1e9 ? (v / 1e9).toFixed(1) + "bn" : Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(0) + "m" : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + "k" : String(Math.round(v)));
const signedPeople = v => (v > 0 ? "+" : v < 0 ? "-" : "") + people(Math.abs(v));

const METRICS = [
  { id: "tfr", label: "Babies per woman", series: [{ key: "tfr", name: "Babies per woman" }], fmt: v => n(v, 2), tick: v => n(v, 0), ref: { y: 2.1, text: "2.1 keeps a population level" }, hint: "The average number of babies a woman has in her lifetime, based on that year's birth patterns." },
  { id: "le", label: "How long people live", series: [{ key: "le", name: "Everyone", color: INK }, { key: "lem", name: "Men", color: MEN }, { key: "lef", name: "Women", color: WOMEN }], fmt: v => n(v, 1) + " years", tick: v => n(v, 0), hint: "Life expectancy at birth: how long a newborn can expect to live." },
  { id: "pop", label: "Population", series: [{ key: "pop", name: "People" }], fmt: v => people(v), tick: compact, hint: "Total number of people living in the country." },
  { id: "age", label: "Age mix", stacked: true, series: [{ key: "p014", name: "Under 15", color: BLUE }, { key: "p1564", name: "15 to 64", color: "#c9d6df" }, { key: "p65", name: "65 and over", color: WOMEN }], fmt: v => n(v, 1) + "%", tick: v => v + "%", hint: "How the population splits into children, working-age adults and older people. The three layers add up to 100%." },
  { id: "grow", label: "Yearly growth", series: [{ key: "grow", name: "Growth per year" }], fmt: v => n(v, 2) + "%", tick: v => n(v, 1) + "%", ref: { y: 0, text: "No change" }, hint: "How fast the total population changed that year, including people moving in and out." },
  { id: "urban", label: "Living in cities", series: [{ key: "urban", name: "Share in cities" }], fmt: v => n(v, 1) + "%", tick: v => v + "%", hint: "Share of people living in urban areas." },
  { id: "imr", label: "Baby deaths", series: [{ key: "imr", name: "Deaths before age 1" }], fmt: v => n(v, 1), tick: v => n(v, 0), hint: "Babies who die before their first birthday, per 1,000 born. A key reason deaths fall in stage 2." },
  { id: "dep", label: "Dependants per worker", series: [{ key: "dep", name: "Dependants per 100 workers" }], fmt: v => n(v, 0), tick: v => n(v, 0), hint: "Children and older people for every 100 adults aged 15 to 64." },
  { id: "mig", label: "Migration", series: [{ key: "mig", name: "Net migration" }], fmt: signedPeople, tick: compact, ref: { y: 0, text: "Arrivals equal departures" }, hint: "Estimated people arriving minus people leaving, over five-year periods. Above zero means more arrived than left." },
  { id: "gdp", label: "Income per person", series: [{ key: "gdp", name: "US dollars" }], fmt: v => "$" + n(v, 0), tick: compact, hint: "Economic output per person in current US dollars. Not adjusted for inflation, so older years look small." }
];

export default function TrendChart({ name, s, cmpName, cmpS }) {
  const [id, setId] = useState("tfr");
  const M = METRICS.find(m => m.id === id);
  const useCmp = !!cmpS && !M.stacked;
  const series = useCmp ? M.series.slice(0, 1) : M.series;

  const { rows, cols } = useMemo(() => {
    const cols = series.map((x, i) => ({
      dk: "c" + i, name: series.length > 1 || M.stacked ? x.name : name,
      color: series.length === 1 ? BLUE : x.color || BLUE, src: s[x.key] || {}
    }));
    if (useCmp) cols.push({ dk: "cmp", name: cmpName, color: INK, dashed: true, src: cmpS[M.series[0].key] || {} });
    const ys = new Set();
    cols.forEach(c => Object.keys(c.src).forEach(y => ys.add(+y)));
    const rows = [...ys].sort((a, b) => a - b).map(y => {
      const r = { year: y };
      cols.forEach(c => { r[c.dk] = c.src[y] ?? null; });
      return r;
    });
    return { rows, cols };
  }, [M, s, cmpS, name, cmpName, useCmp, series]);

  const lastIdx = dk => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i][dk] != null) return i; return -1; };
  const endLabel = c => {
    const li = lastIdx(c.dk);
    return p => (p.index === li ? <text key={c.dk} x={p.x + 6} y={p.y + 4} fill={c.color} fontSize="12" fontWeight="700">{c.name.length > 14 ? c.name.slice(0, 13) + "…" : c.name}</text> : null);
  };

  const Tip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const r = payload[0].payload;
    return (
      <div className="tip">
        <b>{r.year}</b>
        {cols.map(c => r[c.dk] != null && <div key={c.dk}>{c.name}: {M.fmt(r[c.dk])}</div>)}
      </div>
    );
  };

  const axes = [
    <CartesianGrid key="g" stroke="#e3e9ee" vertical={false} />,
    <XAxis key="x" type="number" dataKey="year" domain={["dataMin", "dataMax"]} tickCount={8} tick={{ fill: "#41576a", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#c9d5de" }} />,
    <YAxis key="y" width={46} tickFormatter={M.tick} tick={{ fill: "#41576a", fontSize: 12 }} tickLine={false} axisLine={false} />,
    <Tooltip key="t" content={<Tip />} />,
    M.ref ? <ReferenceLine key="r" y={M.ref.y} stroke="#7d8f9e" strokeDasharray="4 4" label={{ value: M.ref.text, position: "insideTopRight", fill: "#41576a", fontSize: 11 }} /> : null
  ];

  return (
    <div className="trends">
      <div className="pills" role="group" aria-label="Choose a chart">
        {METRICS.map(m => (
          <button key={m.id} className="pill" aria-pressed={m.id === id} onClick={() => setId(m.id)}>{m.label}</button>
        ))}
      </div>

      {(cols.length > 1) && (
        <ul className="keyrow" aria-label="Chart key">
          {cols.map(c => <li key={c.dk}><span className={"line" + (c.dashed ? " dashed" : "")} style={c.dashed ? { color: c.color } : { background: c.color }} />{c.name}</li>)}
        </ul>
      )}

      <div className="chart" role="img" aria-label={`${M.label} in ${name}`}>
        <ResponsiveContainer width="100%" height="100%">
          {M.stacked ? (
            <AreaChart data={rows} margin={{ top: 10, right: 12, bottom: 4, left: 0 }} stackOffset="none">
              {axes}
              {cols.map(c => <Area key={c.dk} dataKey={c.dk} stackId="a" stroke="#ffffff" strokeWidth={1.5} fill={c.color} fillOpacity={0.95} isAnimationActive={false} />)}
            </AreaChart>
          ) : (
            <LineChart data={rows} margin={{ top: 10, right: cols.length > 1 ? 90 : 12, bottom: 4, left: 0 }}>
              {axes}
              {cols.map(c => (
                <Line key={c.dk} dataKey={c.dk} stroke={c.color} strokeWidth={c.dashed ? 2 : 2.6} strokeDasharray={c.dashed ? "6 4" : undefined}
                  dot={M.id === "mig" ? { r: 3 } : false} isAnimationActive={false} connectNulls label={cols.length > 1 ? endLabel(c) : undefined} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="muted-small">{M.hint}{cmpS && M.stacked ? " Comparison is not drawn on this chart. Use the pyramid to compare age mixes." : ""}</p>

      <details className="table-view">
        <summary>Show these numbers as a table</summary>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Year</th>{cols.map(c => <th key={c.dk}>{c.name}</th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.year}><td>{r.year}</td>{cols.map(c => <td key={c.dk}>{r[c.dk] == null ? "n/a" : M.fmt(r[c.dk])}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
