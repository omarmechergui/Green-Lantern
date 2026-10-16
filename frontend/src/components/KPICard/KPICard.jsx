import React from "react";
import "./KPICard.css";

export default function KPICard({ title, value, unit, icon, color = "#10b981", trend, subtitle }) {
  return (
    <div className="kpi-card" style={{ "--kpi-accent": color }}>
      <div className="kpi-card-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrap" style={{ color: color, backgroundColor: `${color}18` }}>
          {icon}
        </div>
      </div>
      <div className="kpi-card-body">
        <div className="kpi-value-row">
          <span className="kpi-value">{value}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
        {(trend || subtitle) && (
          <div className="kpi-footer">
            {trend && (
              <span className={`kpi-trend ${trend.positive ? "positive" : "neutral"}`}>
                {trend.positive ? "↑" : "•"} {trend.value}
              </span>
            )}
            {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
