import { GLOBAL_IND, SERIES_IND, BANDS, FIRST_YEAR, LAST_YEAR } from "./constants.js";

const WB = "https://api.worldbank.org/v2";
const TTL = 7 * 24 * 3600 * 1000; // keep cached data for a week
const mem = new Map();

// Small localStorage cache so repeat visits load instantly.
const store = {
  get(key) {
    try {
      const raw = localStorage.getItem("dtm:" + key);
      if (!raw) return null;
      const { t, d } = JSON.parse(raw);
      return Date.now() - t > TTL ? null : d;
    } catch { return null; }
  },
  set(key, d) {
    try { localStorage.setItem("dtm:" + key, JSON.stringify({ t: Date.now(), d })); } catch { /* storage full or blocked */ }
  }
};

function getJSON(path) {
  if (mem.has(path)) return mem.get(path);
  const p = (async () => {
    const url = `${WB}/${path}${path.includes("?") ? "&" : "?"}format=json&per_page=20000`;
    let r;
    try { r = await fetch(url); }
    catch { throw new Error("Could not reach the World Bank data server. Check your internet connection and try again."); }
    if (!r.ok) throw new Error(`The World Bank data server answered with error ${r.status}. Try again in a minute.`);
    const j = await r.json();
    return Array.isArray(j) && Array.isArray(j[1]) ? j[1] : [];
  })();
  mem.set(path, p);
  p.catch(() => mem.delete(path));
  return p;
}

export async function loadGeo() {
  const r = await fetch(`${import.meta.env.BASE_URL}countries.geo.json`);
  if (!r.ok) throw new Error("The map file (countries.geo.json) is missing from the public folder.");
  const geo = await r.json();
  geo.features = geo.features.filter(f => f.id !== "ATA"); // Antarctica has no population data
  // The map file calls Kosovo "CS-KM"; the World Bank calls it "XKX".
  for (const f of geo.features) if (f.id === "CS-KM") f.id = "XKX";
  return geo;
}

// Latest value per country for each map indicator: { cbr: { BRA: {v, y}, ... }, ... }
export async function loadGlobal() {
  const hit = store.get("global-v1");
  if (hit) return hit;
  const out = {};
  await Promise.all(Object.entries(GLOBAL_IND).map(async ([k, code]) => {
    const rows = await getJSON(`country/all/indicator/${code}?date=2019:2025`);
    const m = {};
    for (const r of rows) {
      if (r.value == null || !r.countryiso3code) continue;
      const y = +r.date;
      const cur = m[r.countryiso3code];
      if (!cur || y > cur.y) m[r.countryiso3code] = { v: r.value, y };
    }
    out[k] = m;
  }));
  if (Object.keys(out.cbr || {}).length > 100 && Object.keys(out.cdr || {}).length > 100) store.set("global-v1", out);
  return out;
}

// Region, income group, capital city and flag code per country.
export async function loadMeta() {
  const hit = store.get("meta-v1");
  if (hit) return hit;
  const rows = await getJSON("country");
  const out = {};
  for (const r of rows) {
    if (!r.region || r.region.id === "NA") continue; // skip regional totals such as "World"
    out[r.id] = {
      iso: r.id,
      iso2: r.iso2Code,
      name: r.name,
      region: (r.region.value || "").trim(),
      income: (r.incomeLevel && r.incomeLevel.value) || "",
      capital: r.capitalCity || ""
    };
  }
  if (Object.keys(out).length > 150) store.set("meta-v1", out);
  return out;
}

// Everything for one country page: yearly series + age-by-sex tables.
export async function loadCountry(iso) {
  const hit = store.get("country-v1:" + iso);
  if (hit) return hit;
  const range = `date=${FIRST_YEAR}:${LAST_YEAR}`;
  const s = {};
  const a = { MA: BANDS.map(() => ({})), FE: BANDS.map(() => ({})) };
  const jobs = [];
  for (const [k, code] of Object.entries(SERIES_IND)) {
    jobs.push(getJSON(`country/${iso}/indicator/${code}?${range}`).then(rows => {
      const m = {};
      for (const r of rows) if (r.value != null) m[+r.date] = r.value;
      s[k] = m;
    }));
  }
  for (const sex of ["MA", "FE"]) {
    BANDS.forEach((b, i) => {
      jobs.push(getJSON(`country/${iso}/indicator/SP.POP.${b}.${sex}.5Y?${range}`).then(rows => {
        for (const r of rows) if (r.value != null) a[sex][i][+r.date] = r.value;
      }));
    });
  }
  await Promise.all(jobs);
  s.nat = {};
  for (const y in s.cbr) if (s.cdr[y] != null) s.nat[y] = s.cbr[y] - s.cdr[y];
  const out = { s, a };
  if (Object.keys(s.cbr || {}).length > 10) store.set("country-v1:" + iso, out);
  return out;
}
