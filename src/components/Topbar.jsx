import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../state/DataContext.jsx";
import { useUI } from "../state/UI.jsx";
import SearchBox from "./SearchBox.jsx";

export function Mark({ size = 26 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="11" y="5" width="10" height="6" fill="currentColor" />
      <rect x="7" y="13" width="18" height="6" fill="currentColor" />
      <rect x="3" y="21" width="26" height="6" fill="currentColor" />
    </svg>
  );
}

export default function Topbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { status, countries, G } = useData();
  const { openHelp } = useUI();
  const onHome = pathname === "/";

  function surprise() {
    const pool = countries.filter(c => (G.pop && G.pop[c.iso] ? G.pop[c.iso].v : 0) >= 2e6);
    if (!pool.length) return;
    nav(`/country/${pool[Math.floor(Math.random() * pool.length)].iso}`);
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="DTM Atlas, back to the world map">
        <Mark />
        <span className="brand-name">DTM Atlas</span>
        <span className="brand-credit">Made by A1m3dk</span>
      </Link>
      {status === "ready" && !onHome && (
        <div className="topsearch"><SearchBox onPick={iso => nav(`/country/${iso}`)} placeholder="Jump to another country" /></div>
      )}
      <nav className="topnav" aria-label="Site">
        {status === "ready" && <button className="link" onClick={surprise}>Random country</button>}
        <button className="link" onClick={openHelp}>How to read this</button>
      </nav>
    </header>
  );
}
