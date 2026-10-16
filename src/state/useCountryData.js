import { useEffect, useState } from "react";
import { loadCountry } from "../lib/api.js";

// Loads the series and age tables for one country. Pass null to load nothing.
export function useCountryData(iso) {
  const [state, setState] = useState({ status: "idle" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!iso) { setState({ status: "idle" }); return undefined; }
    let dead = false;
    setState({ status: "loading" });
    loadCountry(iso)
      .then(data => { if (!dead) setState({ status: "ready", data }); })
      .catch(e => { if (!dead) setState({ status: "error", error: e.message }); });
    return () => { dead = true; };
  }, [iso, tick]);

  return { ...state, reload: () => setTick(x => x + 1) };
}
