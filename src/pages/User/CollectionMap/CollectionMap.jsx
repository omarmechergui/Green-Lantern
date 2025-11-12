import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CollectionMap.css";

// Custom icons per waste type
const icons = {
  plastic: new L.Icon({ iconUrl: "/icons/plastic.png", iconSize: [30, 30] }),
  food: new L.Icon({ iconUrl: "/icons/food.png", iconSize: [30, 30] }),
  clothes: new L.Icon({ iconUrl: "/icons/clothes.png", iconSize: [30, 30] }),
};

export default function CollectionMap({ points }) {
  return (
    <MapContainer center={[36.8065, 10.1815]} zoom={13} className="collection-map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />
      {points.map((point, idx) => (
        <Marker
          key={idx}
          position={[point.lat, point.lng]}
          icon={icons[point.type] || icons.food}
        >
          <Popup>
            <strong>{point.title}</strong>
            <p>{point.description}</p>
            <p>Type: {point.type}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
