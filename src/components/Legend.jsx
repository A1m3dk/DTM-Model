import { MODES, STAGES, gradientCss } from "../lib/dtm.js";

export default function Legend({ mode }) {
  if (mode === "stage") {
    return (
      <div className="legend" aria-label="Map key">
        <b>Growth stage</b>
        <ul>
          {Object.values(STAGES).map(s => (
            <li key={s.id}>
              <span className="sw" style={{ background: s.color }} />
              <span><b>{s.name}</b> <i>{s.tag}</i></span>
            </li>
          ))}
          <li><span className="sw sw-empty" /><span>No data</span></li>
        </ul>
      </div>
    );
  }
  const M = MODES[mode];
  return (
    <div className="legend" aria-label="Map key">
      <b>{M.title}</b>
      <div className="bar" style={{ background: `linear-gradient(90deg, ${gradientCss(M)})` }} />
      <div className="ends"><span>{M.lowLabel}</span><span>{M.highLabel}</span></div>
      <div className="nodata"><span className="sw sw-empty" /> No data</div>
    </div>
  );
}
