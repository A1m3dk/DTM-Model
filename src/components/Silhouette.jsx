import { useMemo } from "react";
import { useData } from "../state/DataContext.jsx";
import { silhouettePath } from "../lib/silhouette.js";

// The country's own outline, filled with its stage colour.
export default function Silhouette({ iso, color, label }) {
  const { geo } = useData();
  const shape = useMemo(() => {
    const f = geo && geo.features.find(x => x.id === iso);
    return f ? silhouettePath(f) : null;
  }, [geo, iso]);
  if (!shape) return null;
  return (
    <svg className="silh" viewBox={`0 0 ${shape.w} ${shape.h}`} role="img" aria-label={`Outline of ${label}`}>
      <path d={shape.d} fill={color || "#c9d5de"} fillRule="evenodd" stroke="#ffffff" strokeWidth="0.6" />
    </svg>
  );
}
