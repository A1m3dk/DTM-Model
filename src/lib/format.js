export function n(v, d = 1) {
  if (v == null || Number.isNaN(v)) return "n/a";
  return Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function people(v) {
  if (v == null || Number.isNaN(v)) return "n/a";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + " billion";
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e8 ? 0 : 1) + " million";
  if (v >= 1e3) return Math.round(v / 1e3) + " thousand";
  return String(Math.round(v));
}
export const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
