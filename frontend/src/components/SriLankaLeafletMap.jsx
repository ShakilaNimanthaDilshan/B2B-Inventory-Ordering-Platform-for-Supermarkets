import React, { useMemo, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ✅ IMPORT the GeoJSON (NO fetch needed)
import sriLankaDistricts from "../assets/geo/sri_lanka_districts.json";

// Sri Lanka bounds (rough, but good)
const SL_BOUNDS = [
  [5.7, 79.4],  // SW
  [10.1, 82.1], // NE
];

const normalizeDistrict = (name = "") =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ district$/i, "");

const money = (n = 0) =>
  `Rs. ${Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

export default function SriLankaLeafletMap({
  districtStats = {},
  selectedDistrict = "all",
  onSelectDistrict,
  height = 380,
}) {
  const [err, setErr] = useState("");

  // ✅ Use imported data directly
  const geo = sriLankaDistricts;

  const selectedKey = useMemo(
    () => (selectedDistrict === "all" ? "all" : normalizeDistrict(selectedDistrict)),
    [selectedDistrict]
  );

  // ✅ Safety check (shows friendly error if file is not valid)
  if (!geo || geo.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
    return (
      <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 14, color: "#b91c1c" }}>
        Map load failed: GeoJSON file is not a valid FeatureCollection.
        <br />
        Please make sure the file contains ONLY JSON (no extra text).
      </div>
    );
  }

  // style function
  const geoStyle = (feature) => {
    const shapeName = feature?.properties?.shapeName || "";
    const key = normalizeDistrict(shapeName.replace(/ district$/i, ""));

    const hasData = !!districtStats[key];
    const isSelected = selectedKey !== "all" && selectedKey === key;

    return {
      weight: isSelected ? 2.5 : 1,
      color: isSelected ? "#0f766e" : "#ffffff",
      fillOpacity: hasData ? 0.9 : 0.35,
      fillColor: hasData ? "#10b981" : "#cbd5e1",
    };
  };

  const onEachFeature = (feature, layer) => {
    const raw = feature?.properties?.shapeName || "Unknown";
    const name = raw.replace(/ district$/i, "");
    const key = normalizeDistrict(name);

    const stats = districtStats[key];

    const popupHtml = `
      <div style="font-family: ui-sans-serif; min-width: 180px;">
        <div style="font-weight: 800; margin-bottom: 6px;">${name}</div>
        <div>Buyers: <b>${stats?.buyers ?? 0}</b></div>
        <div>Orders: <b>${stats?.orders ?? 0}</b></div>
        <div>Revenue: <b>${money(stats?.revenue ?? 0)}</b></div>
        <div style="margin-top:8px; font-size:12px; color:#64748b;">Tip: click to filter</div>
      </div>
    `;

    layer.bindPopup(popupHtml);

    layer.on("click", () => onSelectDistrict?.(name));
    layer.on("mouseover", () => layer.setStyle({ weight: 2 }));
    layer.on("mouseout", () => layer.setStyle(geoStyle(feature)));
  };

  if (err) {
    return (
      <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 14, color: "#b91c1c" }}>
        <b>Map error:</b> {err}
      </div>
    );
  }

  return (
    <div
      style={{
        height,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <MapContainer
        bounds={SL_BOUNDS}
        maxBounds={SL_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        attributionControl={false}
      >
        {/* No TileLayer = only Sri Lanka vector */}
        <GeoJSON data={geo} style={geoStyle} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}
