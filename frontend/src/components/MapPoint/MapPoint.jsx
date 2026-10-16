import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MapPoint from "./MapPoint";
import "leaflet/dist/leaflet.css";

export default function Map({ points }) {
  return (
    <MapContainer
      center={[36.8065, 10.1815]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {points.map((p, idx) => (
        <MapPoint
          key={idx}
          position={[p.lat, p.lng]}
          title={p.title}
          description={p.description}
          type={p.type}
        />
      ))}
    </MapContainer>
  );
}
