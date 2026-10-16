import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CollectionMap.css";

// Create reliable SVG-based DivIcons for waste types without external asset dependency
const createMarkerIcon = (type) => {
  const colors = {
    plastic: { bg: "#0284c7", border: "#38bdf8", icon: "♳" },
    food: { bg: "#16a34a", border: "#4ade80", icon: "🍏" },
    clothes: { bg: "#9333ea", border: "#c084fc", icon: "👕" },
  };

  const current = colors[type] || colors.plastic;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="marker-pin marker-${type}" style="background-color: ${current.bg}; border-color: ${current.border};">
        <span class="marker-symbol">${current.icon}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

export default function CollectionMap({ points = [] }) {
  const centerPosition = points.length > 0 ? [points[0].lat, points[0].lng] : [36.8065, 10.1815];

  return (
    <div className="collection-map-container">
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={false}
        className="collection-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />
        {points.map((point, idx) => (
          <Marker
            key={idx}
            position={[point.lat, point.lng]}
            icon={createMarkerIcon(point.type)}
          >
            <Popup className="saas-map-popup">
              <div className="popup-card">
                <span className={`popup-type-tag type-${point.type}`}>{point.type}</span>
                <h4 className="popup-title">{point.title}</h4>
                <p className="popup-desc">{point.description}</p>
                <div className="popup-coords">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
