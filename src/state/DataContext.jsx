import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadGeo, loadGlobal, loadMeta } from "../lib/api.js";
import { DEFAULT_T, stageOf } from "../lib/dtm.js";
import { DISPLAY } from "../lib/names.js";

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

function readT() {
  try {
    const t = JSON.parse(localStorage.getItem("dtm:T"));
    if (t && t.s23 > t.s34) return t;
  } catch { /* ignore */ }
  return DEFAULT_T;
}

export function DataProvider({ children }) {
  const [raw, setRaw] = useState({ status: "loading" });
  const [T, setTState] = useState(readT);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let dead = false;
    setRaw({ status: "loading" });
    (async () => {
      try {
        const [geo, G, meta] = await Promise.all([loadGeo(), loadGlobal(), loadMeta().catch(() => ({}))]);
        if (!dead) setRaw({ status: "ready", geo, G, meta });
      } catch (e) {
        if (!dead) setRaw({ status: "error", error: e.message });
      }
    })();
    return () => { dead = true; };
  }, [attempt]);

  const setT = useCallback(next => {
    setTState(next);
    try { localStorage.setItem("dtm:T", JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => {
    const { status, geo, G = {}, meta = {}, error } = raw;
    const geoName = {};
    if (geo) for (const f of geo.features) geoName[f.id] = f.properties.name;

    const hasData = iso => !!(G.cbr && G.cbr[iso] && G.cdr && G.cdr[iso]);
    const stageFor = iso => (hasData(iso) ? stageOf(G.cbr[iso].v, G.cdr[iso].v, T) : null);
    const valueFor = (iso, key) => {
      const o = G[key] && G[key][iso];
      return o ? o.v : null;
    };
    const name = iso => DISPLAY[geoName[iso]] || geoName[iso] || (meta[iso] && meta[iso].name) || iso;
    const info = iso => ({
      iso,
      name: name(iso),
      iso2: meta[iso] && meta[iso].iso2,
      region: meta[iso] ? meta[iso].region : "",
      income: meta[iso] ? meta[iso].income : "",
      capital: meta[iso] ? meta[iso].capital : ""
    });

    const countries = [];
    if (geo) {
      const seen = new Set();
      for (const f of geo.features) {
        const iso = f.id;
        if (seen.has(iso) || !hasData(iso)) continue;
        seen.add(iso);
        countries.push({ iso, name: name(iso), alt: meta[iso] ? meta[iso].name : "", iso2: meta[iso] && meta[iso].iso2 });
      }
      countries.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      status, error, geo, G, meta, T, setT, countries,
      hasData, stageFor, valueFor, name, info,
      retry: () => setAttempt(x => x + 1)
    };
  }, [raw, T, setT]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
