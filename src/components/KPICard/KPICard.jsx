import React from "react";
import "./KPICard.css";

export default function KPICard({ title, value, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-info">
        <h3 className="kpi-title">{title}</h3>
        <p className="kpi-value">{value}</p>
      </div>
    </div>
  );
}
