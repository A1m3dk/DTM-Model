import { useMemo } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ResponsiveContainer } from "recharts";
import { STAGES } from "../lib/dtm.js";
import { stageSeries } from "../lib/series.js";
import { n } from "../lib/format.js";

const BIRTH = "#1b86c9", DEATH = "#10283a", CB = "#7fbbe4", CD = "#7d8f9e";

function runs(st) {
  const ys = Object.keys(st).map(Number).sort((a, b) => a - b);
  const out = [];
  for (const y of ys) {
    const last = out[out.length - 1];
    if (last && last.stage === st[y] && y === last.to + 1) last.to = y;
    else out.push({ stage: st[y], from: y, to: y });
  }
  return out;
}

// A label drawn only at the end of a line, so the lines can be read without the key.
const endLabel = (color, text, lastIdx) => p =>
  p.index === lastIdx
    ? <text key={text} x={p.x + 6} y={p.y + 4} fill={color} fontSize="12" fontWeight="700">{text}</text>
    : null;

function Tip({ active, payload, stageOf, cmpName }) {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0].payload;
  const st = stageOf[r.year];
  return (
    <div className="tip">
      <b>{r.year}</b>
      {r.b != null && <div>Births: {n(r.b, 1)} per 1,000</div>}
      {r.d != null && <div>Deaths: {n(r.d, 1)} per 1,000</div>}
      {r.b != null && r.d != null && <div>{r.b >= r.d ? "Growing by" : "Shrinking by"} {n(Math.abs(r.b - r.d), 1)} per 1,000 from births and deaths</div>}
      {st && <div>Stage: {STAGES[st].name}</div>}
      {r.cb != null && <div>{cmpName} births: {n(r.cb, 1)}</div>}
      {r.cd != null && <div>{cmpName} deaths: {n(r.cd, 1)}</div>}
    </div>
  );
}

export default function StoryChart({ name, s, T, cmpName, cmpS }) {
  const { rows, bands, stageMap, lastB, lastD, lastCB, lastCD } = useMemo(() => {
    const ys = new Set([...Object.keys(s.cbr), ...Object.keys(s.cdr)].map(Number));
    if (cmpS) for (const y of [...Object.keys(cmpS.cbr), ...Object.keys(cmpS.cdr)]) ys.add(+y);
    const rows = [...ys].sort((a, b) => a - b).map(y => {
      const b = s.cbr[y] ?? null, d = s.cdr[y] ?? null;
      return {
        year: y, b, d,
        gap: b != null && d != null ? [Math.min(b, d), Math.max(b, d)] : null,
        cb: cmpS ? cmpS.cbr[y] ?? null : null,
        cd: cmpS ? cmpS.cdr[y] ?? null : null
      };
    });
    const lastIdx = f => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i][f] != null) return i; return -1; };
    const stageMap = stageSeries(s, T);
    return { rows, bands: runs(stageMap), stageMap, lastB: lastIdx("b"), lastD: lastIdx("d"), lastCB: lastIdx("cb"), lastCD: lastIdx("cd") };
  }, [s, cmpS, T]);

  if (!rows.length) return <p className="note-empty">No birth and death history is available for {name}.</p>;

  return (
    <div className="story">
      <ul className="keyrow" aria-label="Chart key">
        <li><span className="line" style={{ background: BIRTH }} />Births in {name}</li>
        <li><span className="line" style={{ background: DEATH }} />Deaths in {name}</li>
        {cmpS && <li><span className="line dashed" style={{ color: CB }} />Births in {cmpName}</li>}
        {cmpS && <li><span className="line dashed" style={{ color: CD }} />Deaths in {cmpName}</li>}
        <li><span className="sw gap" />Gap between them: the population grows when births are on top, and shrinks when deaths are.</li>
      </ul>
      <div className="chart" role="img" aria-label={`Births and deaths per 1,000 people in ${name} from ${rows[0].year} to ${rows[rows.length - 1].year}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 22, right: 64, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#e3e9ee" vertical={false} />
            {bands.map(b => (
              <ReferenceArea
                key={b.from} x1={b.from - 0.5} x2={b.to + 0.5} ifOverflow="hidden"
                fill={STAGES[b.stage].color} fillOpacity={0.13} stroke="none"
                label={b.to - b.from >= 7 ? { value: STAGES[b.stage].name, position: "insideTop", fill: "#41576a", fontSize: 11 } : undefined}
              />
            ))}
            <XAxis type="number" dataKey="year" domain={["dataMin", "dataMax"]} tickCount={8} tick={{ fill: "#41576a", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#c9d5de" }} />
            <YAxis width={40} tick={{ fill: "#41576a", fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, "auto"]} />
            <Tooltip content={<Tip stageOf={stageMap} cmpName={cmpName} />} />
            <Area dataKey="gap" stroke="none" fill="#10283a" fillOpacity={0.12} isAnimationActive={false} activeDot={false} />
            {cmpS && <Line dataKey="cb" stroke={CB} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} connectNulls />}
            {cmpS && <Line dataKey="cd" stroke={CD} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} connectNulls />}
            <Line dataKey="b" stroke={BIRTH} strokeWidth={2.6} dot={false} isAnimationActive={false} connectNulls label={endLabel(BIRTH, "Births", lastB)} />
            <Line dataKey="d" stroke={DEATH} strokeWidth={2.6} dot={false} isAnimationActive={false} connectNulls label={endLabel(DEATH, "Deaths", lastD)} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="muted-small">Per 1,000 people each year. The coloured bands show which stage the country was in, using the rules explained at the bottom of the page.</p>
    </div>
  );
}
