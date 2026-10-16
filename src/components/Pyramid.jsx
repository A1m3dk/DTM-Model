import { useEffect, useMemo, useState } from "react";
import { BAND_LABELS } from "../lib/constants.js";
import { ageYears, shapeOf } from "../lib/series.js";
import { n } from "../lib/format.js";

export const MEN = "#1b86c9";
export const WOMEN = "#e07b39";
const INK = "#10283a";

// Drawing sizes, in SVG units. The picture scales to fit its box.
const W = 640, GUT = 60, ROW = 24, TOP = 38, BOT = 34;
const SIDE = (W - GUT) / 2;
const NB = BAND_LABELS.length;
const H = TOP + ROW * NB + BOT;

const col = (c, sex, y) => BAND_LABELS.map((_, i) => {
  const v = c.a[sex][i][y];
  return v == null ? null : v;
});

// One fixed scale for every year, so the bars do not jump while the animation plays.
function axisMax(list) {
  let m = 0;
  for (const c of list) {
    if (!c) continue;
    for (const sex of ["MA", "FE"]) for (const band of c.a[sex]) for (const y in band) if (band[y] > m) m = band[y];
  }
  return Math.max(4, Math.ceil(m / 2) * 2);
}

export default function Pyramid({ name, data, cmpName, cmpData }) {
  const years = useMemo(() => ageYears(data), [data]);
  const first = years[0], last = years[years.length - 1];
  const [year, setYear] = useState(last);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(null);
  const max = useMemo(() => axisMax([data, cmpData]), [data, cmpData]);

  useEffect(() => { setYear(years[years.length - 1]); setPlaying(false); }, [years]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setYear(y => {
        const i = years.indexOf(y);
        if (i < 0 || i >= years.length - 1) { setPlaying(false); return y; }
        return years[i + 1];
      });
    }, 260);
    return () => clearInterval(id);
  }, [playing, years]);

  if (!years.length) {
    return <p className="note-empty">The World Bank has no age-by-sex figures for {name}, so there is no pyramid to draw.</p>;
  }

  const men = col(data, "MA", year), women = col(data, "FE", year);
  const cm = cmpData ? col(cmpData, "MA", year) : null;
  const cw = cmpData ? col(cmpData, "FE", year) : null;
  const s = data.s;
  const shape = shapeOf(s, year);
  const ticks = [0, max / 2, max];

  const toggle = () => {
    if (playing) { setPlaying(false); return; }
    if (year >= last) setYear(first);
    setPlaying(true);
  };

  const hv = hover != null ? hover : null;
  const readout = hv != null
    ? `Ages ${BAND_LABELS[hv]} in ${year}: ${men[hv] == null ? "n/a" : n(men[hv], 1) + "%"} of all men and ${women[hv] == null ? "n/a" : n(women[hv], 1) + "%"} of all women are in this age group.`
    : "Hover over a bar to see the exact share for that age group.";

  const kids = s.p014 && s.p014[year], work = s.p1564 && s.p1564[year], old = s.p65 && s.p65[year];

  return (
    <div className="pyr">
      <div className="pyr-controls">
        <div className="pyr-year" aria-live="polite">{year}</div>
        <button className="btn" onClick={toggle}>{playing ? "Pause" : "Play"}</button>
        <input
          type="range" min={first} max={last} step="1" value={year}
          aria-label="Year shown in the pyramid"
          onChange={e => { setPlaying(false); setYear(+e.target.value); }}
        />
        <div className="pyr-jump">
          <button className="link" onClick={() => { setPlaying(false); setYear(first); }}>{first}</button>
          <button className="link" onClick={() => { setPlaying(false); setYear(last); }}>{last}</button>
        </div>
      </div>

      <p className="pyr-read" aria-live="polite">{readout}</p>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Population pyramid of ${name} in ${year}. Men on the left, women on the right.`} onPointerLeave={() => setHover(null)}>
        <text x={SIDE / 2} y="18" textAnchor="middle" className="side" fill={MEN}>Men</text>
        <text x={SIDE + GUT + SIDE / 2} y="18" textAnchor="middle" className="side" fill={WOMEN}>Women</text>

        {ticks.map(t => {
          const dx = (t / max) * SIDE;
          return (
            <g key={t} className="grid">
              <line x1={SIDE - dx} x2={SIDE - dx} y1={TOP - 4} y2={TOP + ROW * NB} />
              <line x1={SIDE + GUT + dx} x2={SIDE + GUT + dx} y1={TOP - 4} y2={TOP + ROW * NB} />
              <text x={SIDE - dx} y={H - 12} textAnchor="middle">{t}%</text>
              <text x={SIDE + GUT + dx} y={H - 12} textAnchor="middle">{t}%</text>
            </g>
          );
        })}

        {BAND_LABELS.map((lab, i) => {
          const y = TOP + (NB - 1 - i) * ROW;
          const mw = men[i] == null ? 0 : (men[i] / max) * SIDE;
          const ww = women[i] == null ? 0 : (women[i] / max) * SIDE;
          return (
            <g key={lab} className={hover === i ? "row on" : "row"}>
              <rect className="bar" x={SIDE - mw} y={y + 2} width={mw} height={ROW - 4} fill={MEN} rx="2" />
              <rect className="bar" x={SIDE + GUT} y={y + 2} width={ww} height={ROW - 4} fill={WOMEN} rx="2" />
              {cm && cm[i] != null && <rect x={SIDE - (cm[i] / max) * SIDE} y={y + 2} width={(cm[i] / max) * SIDE} height={ROW - 4} fill="none" stroke={INK} strokeWidth="1.6" rx="2" />}
              {cw && cw[i] != null && <rect x={SIDE + GUT} y={y + 2} width={(cw[i] / max) * SIDE} height={ROW - 4} fill="none" stroke={INK} strokeWidth="1.6" rx="2" />}
              <text x={SIDE + GUT / 2} y={y + ROW / 2 + 4} textAnchor="middle" className="age">{lab}</text>
              <rect className="hit" x="0" y={y} width={W} height={ROW} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
            </g>
          );
        })}
      </svg>

      {cmpData && (
        <p className="pyr-key"><span className="outline" /> The black outline shows {cmpName}.</p>
      )}

      {shape && (
        <div className="shape">
          <b>{shape.label}.</b> {shape.text}
        </div>
      )}

      {kids != null && work != null && old != null && (
        <ul className="agemix" aria-label={`Share of people by age group in ${year}`}>
          <li><span className="sw" style={{ background: "#1b86c9" }} />Children under 15: <b>{n(kids, 0)}%</b></li>
          <li><span className="sw" style={{ background: "#c9d6df" }} />Ages 15 to 64: <b>{n(work, 0)}%</b></li>
          <li><span className="sw" style={{ background: "#e07b39" }} />Ages 65 and over: <b>{n(old, 0)}%</b></li>
        </ul>
      )}

      <p className="muted-small">
        Each bar is the share of that sex's whole population who are in the age group, so the left side and the right side each add up to 100%.
      </p>

      <details className="table-view">
        <summary>Show {year} as a table</summary>
        <table>
          <thead>
            <tr>
              <th>Age</th><th>Men</th><th>Women</th>
              {cm && <th>Men in {cmpName}</th>}{cw && <th>Women in {cmpName}</th>}
            </tr>
          </thead>
          <tbody>
            {BAND_LABELS.map((lab, k) => {
              const i = NB - 1 - k;
              return (
                <tr key={BAND_LABELS[i]}>
                  <td>{BAND_LABELS[i]}</td>
                  <td>{men[i] == null ? "n/a" : n(men[i], 1) + "%"}</td>
                  <td>{women[i] == null ? "n/a" : n(women[i], 1) + "%"}</td>
                  {cm && <td>{cm[i] == null ? "n/a" : n(cm[i], 1) + "%"}</td>}
                  {cw && <td>{cw[i] == null ? "n/a" : n(cw[i], 1) + "%"}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </div>
  );
}
