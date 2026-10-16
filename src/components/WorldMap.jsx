import { useCallback, useEffect, useRef } from "react";
import { MapContainer, GeoJSON, TileLayer, Pane, ZoomControl } from "react-leaflet";
import { useData } from "../state/DataContext.jsx";
import { MODES, STAGES, ramp } from "../lib/dtm.js";

const EMPTY = "#e3e8ec";

// A pan-and-zoom world map. Hover shows a preview, click opens the country page.
export default function WorldMap({ mode, onHover, onPick }) {
  const { geo, hasData, stageFor, valueFor } = useData();
  const layer = useRef(null);
  const hoverRef = useRef(onHover);
  const pickRef = useRef(onPick);
  hoverRef.current = onHover;
  pickRef.current = onPick;

  const styleFor = useCallback(f => {
    const iso = f.id;
    let fill = EMPTY;
    if (hasData(iso)) {
      if (mode === "stage") {
        const st = stageFor(iso);
        if (st) fill = STAGES[st].color;
      } else {
        const v = valueFor(iso, MODES[mode].key);
        fill = v == null ? EMPTY : ramp(MODES[mode].stops, v);
      }
    }
    return { fillColor: fill, fillOpacity: 1, color: "#ffffff", weight: 0.8, opacity: 1 };
  }, [mode, hasData, stageFor, valueFor]);

  const styleRef = useRef(styleFor);
  styleRef.current = styleFor;

  // Recolour in place when the colour mode or stage rules change.
  useEffect(() => {
    if (layer.current) layer.current.eachLayer(l => l.setStyle(styleFor(l.feature)));
  }, [styleFor]);

  const onEach = (f, l) => {
    const iso = f.id;
    if (!hasData(iso)) return;
    l.on({
      mouseover: () => { l.setStyle({ weight: 2.2, color: "#10283a" }); l.bringToFront(); hoverRef.current && hoverRef.current(iso); },
      mouseout: () => { l.setStyle(styleRef.current(f)); hoverRef.current && hoverRef.current(null); },
      click: () => pickRef.current && pickRef.current(iso)
    });
    const el = l.getElement && l.getElement();
    if (el) el.style.cursor = "pointer";
  };

  return (
    <MapContainer
      center={[24, 12]}
      zoom={2}
      minZoom={1.5}
      zoomSnap={0.25}
      zoomControl={false}
      worldCopyJump={false}
      maxBounds={[[-62, -200], [88, 200]]}
      maxBoundsViscosity={0.9}
      attributionControl={true}
      className="world"
      aria-label="World map. Click a country to open its page."
    >
      <GeoJSON ref={layer} data={geo} style={f => styleRef.current(f)} onEachFeature={onEach} />
      <Pane name="labels" style={{ zIndex: 650, pointerEvents: "none" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          attribution="Labels &copy; OpenStreetMap contributors &copy; CARTO"
          noWrap
        />
      </Pane>
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
