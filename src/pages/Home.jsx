import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../state/DataContext.jsx";
import { MODES, STAGES } from "../lib/dtm.js";
import { n, people } from "../lib/format.js";
import WorldMap from "../components/WorldMap.jsx";
import Legend from "../components/Legend.jsx";
import SearchBox from "../components/SearchBox.jsx";
import Flag from "../components/Flag.jsx";

const QUICK = ["BRA", "EGY", "NZL", "JPN"];

export default function Home() {
  const nav = useNavigate();
  const { hasData, stageFor, valueFor, info, name } = useData();
  const [mode, setMode] = useState("stage");
  const [hover, setHover] = useState(null);

  const open = iso => nav(`/country/${iso}`);
  const st = hover ? stageFor(hover) : null;

  return (
    <div className="home">
      <div className="map-wrap">
        <WorldMap mode={mode} onHover={setHover} onPick={open} />
      </div>

      <section className="intro">
        <h1>How is each country's population changing?</h1>
        <p>Click any country on the map to open its page. Drag to move around and scroll to zoom.</p>
        <SearchBox big onPick={open} placeholder="Or type a country name" label="Search for a country" />
        <p className="quick">
          Try:{" "}
          {QUICK.filter(hasData).map(iso => (
            <button key={iso} className="chip" onClick={() => open(iso)}>{name(iso)}</button>
          ))}
        </p>
      </section>

      <div className="modes" role="group" aria-label="Colour the map by">
        <span className="modes-label">Colour the map by</span>
        {Object.values(MODES).map(m => (
          <button key={m.id} className="pill" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.pill}</button>
        ))}
      </div>

      <Legend mode={mode} />

      {hover && (
        <div className="peek" aria-live="polite">
          <Flag iso2={info(hover).iso2} className="flag-lg" />
          <div>
            <b>{name(hover)}</b>
            {st && <span className="stagechip" style={{ background: STAGES[st].color, color: STAGES[st].ink }}>{STAGES[st].name}</span>}
            <div className="peek-stats">
              <span>{n(valueFor(hover, "tfr"), 1)} babies per woman</span>
              <span>Lives to about {n(valueFor(hover, "le"), 0)}</span>
              <span>{people(valueFor(hover, "pop"))} people</span>
            </div>
            <small>Click to open the page</small>
          </div>
        </div>
      )}
    </div>
  );
}
