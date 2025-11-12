import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./Map.css";

export default function Map({ points }) {
  const mapRef = useRef(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // إزالة أي MarkerCluster قديمة
    map.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup) {
        map.removeLayer(layer);
      }
    });

    const markers = L.markerClusterGroup();

    // تصفية النقاط
    const filteredPoints =
      filter === "all" ? points : points.filter((p) => p.type === filter);

    filteredPoints.forEach((p) => {
      const icon = new L.DivIcon({
        html: `<div class="neon-marker ${p.type}"></div>`,
        className: "",
        iconSize: [25, 25],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([p.lat, p.lng], { icon });

      // tooltip متحرك
      marker.bindTooltip(
        `<b>${p.title}</b><br/>Type: ${p.type}<br/>${p.description}`,
        { direction: "top", offset: [0, -10], permanent: false, opacity: 0.9 }
      );

      markers.addLayer(marker);
    });

    map.addLayer(markers);
  }, [points, filter]);

  return (
    <div className="map-wrapper">
      <div className="map-filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("plastic")}>Plastic</button>
        <button onClick={() => setFilter("paper")}>Paper</button>
        <button onClick={() => setFilter("organic")}>Organic</button>
      </div>

      <MapContainer
  center={[33.8869, 9.5375]}
  zoom={7}
  style={{ height: "60vh", width: "90%", margin: "1rem auto", borderRadius: "1.5rem" }}
  whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
>

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
      </MapContainer>
    </div>
  );
}
