// The five stages, in plain language. Colours are used for the map and every badge.
export const STAGES = {
  1: {
    id: 1, name: "Old-fashioned", tag: "Many births, many deaths", color: "#5b3a82", ink: "#ffffff",
    blurb: "Lots of babies are born, but many people die young, so the population hardly grows."
  },
  2: {
    id: 2, name: "Booming", tag: "Many births, fewer deaths", color: "#c2417a", ink: "#ffffff",
    blurb: "Better food and medicine mean fewer people die, but families are still big. The population grows fast."
  },
  3: {
    id: 3, name: "Slowing down", tag: "Fewer births, few deaths", color: "#f2a93b", ink: "#2a1c00",
    blurb: "Families get smaller while people live longer. The population still grows, but more slowly."
  },
  4: {
    id: 4, name: "Steady", tag: "Few births, few deaths", color: "#2a9d8f", ink: "#ffffff",
    blurb: "Few babies are born and few people die young. The population stays roughly level and gets older."
  },
  5: {
    id: 5, name: "Shrinking", tag: "More deaths than births", color: "#3b6fb6", ink: "#ffffff",
    blurb: "More people die each year than are born, so without newcomers from abroad the population falls."
  }
};

export const DEFAULT_T = { s23: 30, s34: 20 };

// Rule-based stage from birth and death rates (per 1,000 people).
// This is our own simplification, not an official definition.
export function stageOf(cbr, cdr, T = DEFAULT_T) {
  if (cbr == null || cdr == null) return null;
  if (cbr < cdr) return 5;
  if (cbr >= 40 && cdr >= 25) return 1;
  if (cbr < T.s34) return 4;
  if (cbr < T.s23) return 3;
  return 2;
}

// Ways to colour the map.
export const MODES = {
  stage: { id: "stage", pill: "Growth stage", title: "Growth stage" },
  tfr: {
    id: "tfr", pill: "Babies per woman", title: "Babies per woman", key: "tfr",
    lowLabel: "1", highLabel: "7", min: 1, max: 7, fmt: v => v.toFixed(1),
    stops: [[1, "#ffffcc"], [2, "#fed976"], [3.5, "#fd8d3c"], [5, "#e31a1c"], [7, "#800026"]]
  },
  le: {
    id: "le", pill: "How long people live", title: "Life expectancy (years)", key: "le",
    lowLabel: "50", highLabel: "85", min: 50, max: 85, fmt: v => v.toFixed(0) + " years",
    stops: [[50, "#f1eef6"], [62, "#bdc9e1"], [72, "#74a9cf"], [80, "#2b8cbe"], [85, "#045a8d"]]
  },
  p65: {
    id: "p65", pill: "Share over 65", title: "Share of people aged 65 or older", key: "p65",
    lowLabel: "0%", highLabel: "30%", min: 0, max: 30, fmt: v => v.toFixed(0) + "%",
    stops: [[0, "#edf8e9"], [8, "#bae4b3"], [15, "#74c476"], [22, "#238b45"], [30, "#00441b"]]
  },
  grow: {
    id: "grow", pill: "Yearly growth", title: "Population growth per year", key: "grow",
    lowLabel: "-2%", highLabel: "+4%", min: -2, max: 4, fmt: v => (v > 0 ? "+" : "") + v.toFixed(1) + "%",
    stops: [[-2, "#2166ac"], [-0.5, "#92c5de"], [0, "#f7f7f7"], [1, "#f4a582"], [2.5, "#d6604d"], [4, "#67001f"]]
  }
};

function hex2rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return "rgb(" + A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(",") + ")";
}
export function ramp(stops, v) {
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [v0, c0] = stops[i - 1], [v1, c1] = stops[i];
      return lerp(c0, c1, (v - v0) / (v1 - v0));
    }
  }
  return stops[stops.length - 1][1];
}
export function gradientCss(M) {
  return M.stops.map(s => `${s[1]} ${(((s[0] - M.min) / (M.max - M.min)) * 100).toFixed(1)}%`).join(",");
}
