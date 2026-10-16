import { useMemo, useState } from "react";
import { useData } from "../state/DataContext.jsx";
import { norm } from "../lib/format.js";
import { STAGES } from "../lib/dtm.js";
import Flag from "./Flag.jsx";

export default function SearchBox({ onPick, placeholder = "Type a country name", big = false, exclude = null, label = "Search for a country" }) {
  const { countries, stageFor } = useData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const results = useMemo(() => {
    const s = norm(q.trim());
    if (!s) return [];
    const starts = [], inc = [];
    for (const c of countries) {
      if (exclude && c.iso === exclude) continue;
      const a = norm(c.name), b = norm(c.alt);
      if (a.startsWith(s) || b.startsWith(s)) starts.push(c);
      else if (a.includes(s) || b.includes(s)) inc.push(c);
    }
    return [...starts, ...inc].slice(0, 7);
  }, [q, countries, exclude]);

  const pick = c => { setQ(""); setOpen(false); setIdx(0); onPick(c.iso); };

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[idx]) { e.preventDefault(); pick(results[idx]); }
    else if (e.key === "Escape") setOpen(false);
  }

  const showList = open && q.trim().length > 0;

  return (
    <div className={"search" + (big ? " search-big" : "")}>
      <svg className="search-ico" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M13 13l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={showList}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={q}
        autoComplete="off"
        onChange={e => { setQ(e.target.value); setIdx(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKey}
      />
      {showList && (
        <ul className="search-list" role="listbox">
          {results.map((c, i) => {
            const st = stageFor(c.iso);
            return (
              <li key={c.iso} role="option" aria-selected={i === idx} className={i === idx ? "on" : ""}
                onMouseDown={e => { e.preventDefault(); pick(c); }} onMouseEnter={() => setIdx(i)}>
                <Flag iso2={c.iso2} />
                <span className="nm">{c.name}</span>
                {st && <span className="dot" style={{ background: STAGES[st].color }} title={STAGES[st].name} />}
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="none" role="option" aria-selected="false">
              No country found. Check the spelling. Very small countries are not on this map.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
