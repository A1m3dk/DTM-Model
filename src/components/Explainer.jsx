import { useEffect, useRef } from "react";
import { STAGES, DEFAULT_T } from "../lib/dtm.js";
import { useData } from "../state/DataContext.jsx";

export function Schematic({ stage = null }) {
  const hl = stage ? <rect x={10 + (stage - 1) * 100} y="0" width="100" height="170" fill="#10283a" opacity=".08" /> : null;
  return (
    <figure className="schem">
      <svg viewBox="0 0 520 195" role="img" aria-label="Schematic of the demographic transition: birth rate, death rate and population over five stages">
        {Object.values(STAGES).map((s, i) => (
          <rect key={s.id} x={10 + i * 100} y="0" width="100" height="170" fill={s.color} opacity=".13" />
        ))}
        {hl}
        <path d="M10,148 L110,146 C150,142 190,98 230,70 S300,40 320,38 L400,38 C440,40 480,48 510,60" fill="none" stroke="#2a9d8f" strokeWidth="3" strokeDasharray="6 4" />
        <path d="M10,35 L110,35 C150,35 170,70 210,95 S290,128 310,130 L410,134 C450,142 480,148 510,152" fill="none" stroke="#1b86c9" strokeWidth="3" />
        <path d="M10,33 C40,45 70,28 110,42 C140,70 160,115 210,134 S290,142 310,142 L410,140 C450,136 480,128 510,122" fill="none" stroke="#10283a" strokeWidth="3" />
        {[1, 2, 3, 4, 5].map(k => (
          <text key={k} x={60 + (k - 1) * 100} y="186" textAnchor="middle" fontSize="11" fill="#41576a">{STAGES[k].name}</text>
        ))}
        <text x="16" y="16" fontSize="11" fill="#1b86c9" fontWeight="600">births</text>
        <text x="16" y="29" fontSize="11" fill="#10283a" fontWeight="600">deaths</text>
        <text x="68" y="16" fontSize="11" fill="#2a9d8f" fontWeight="600">population</text>
      </svg>
      <figcaption>A sketch of the idea. It is not real data.</figcaption>
    </figure>
  );
}

export default function Explainer({ onClose }) {
  const { T, setT } = useData();
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current && closeRef.current.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="modal-back" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <button ref={closeRef} className="modal-x" onClick={onClose} aria-label="Close">Close</button>
        <h2 id="how-title">How to read this site</h2>

        <p className="lead">
          As a country gets healthier and richer, its population usually goes through the same five steps. This site puts every country on that ladder, using its newest birth and death numbers.
        </p>

        <Schematic />

        <ol className="stage-list">
          {Object.values(STAGES).map(s => (
            <li key={s.id}>
              <span className="sw" style={{ background: s.color }} />
              <div><b>{s.name}</b><p>{s.blurb}</p></div>
            </li>
          ))}
        </ol>

        <h3>The population pyramid</h3>
        <p>
          Each bar is an age group, from babies at the bottom to the oldest people at the top. Men are on the left and women on the right. A wide bottom means lots of children. A bottom that is narrower than the middle means the country is getting older.
        </p>

        <h3>Where to be careful</h3>
        <ul className="plain">
          <li>The stage is our own simple rule based on birth and death rates. It is not an official label, and the fifth stage is not in every textbook.</li>
          <li>Countries where many residents are foreign workers, like the United Arab Emirates, do not fit the model well.</li>
          <li>Numbers come from the World Bank, which republishes United Nations estimates. Recent years can be estimates.</li>
        </ul>

        <details className="adv">
          <summary>Change how the stages are decided</summary>
          <p>
            Births per 1,000 people (the birth rate) decides the stage. If births are lower than deaths it is Shrinking. Otherwise a birth rate under the first number is Steady, under the second is Slowing down, and above that is Booming.
          </p>
          <label>Steady below <input type="number" min="5" max="35" value={T.s34} onChange={e => setT({ ...T, s34: Math.min(+e.target.value || 0, T.s23 - 1) })} /></label>
          <label>Slowing down below <input type="number" min="10" max="45" value={T.s23} onChange={e => setT({ ...T, s23: Math.max(+e.target.value || 0, T.s34 + 1) })} /></label>
          <button className="link" onClick={() => setT(DEFAULT_T)}>Reset to the defaults</button>
        </details>
      </div>
    </div>
  );
}
