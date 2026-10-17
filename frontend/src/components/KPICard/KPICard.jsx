import React from "react";
import "./KPICard.css";

export default function KPICard({
  title,
  value,
  unit,
  icon,
  color = "#16A34A",
  trend,
  trendType = "neutral",
  subtitle,
}) {
  // Support trend as string, number, or object { positive, value }
  const trendText = typeof trend === "object" && trend !== null ? trend.value : trend;
  const isPositive =
    typeof trend === "object" && trend !== null
      ? trend.positive
      : trendType === "positive";

  const computedTrendType =
    typeof trend === "object" && trend !== null
      ? trend.positive
        ? "positive"
        : "neutral"
      : trendType;

  return (
    <div
      className="kpi-card"
      style={{ "--kpi-accent": color }}
      role="article"
      aria-label={`${title}: ${value} ${unit || ""}`}
    >
      <div className="kpi-card-header">
        <span className="kpi-title">{title}</span>
        <div
          className="kpi-icon-wrap"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="kpi-card-body">
        <div className="kpi-value-row">
          <span className="kpi-value">{value}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>

        {(trendText || subtitle) && (
          <div className="kpi-footer">
            {trendText && (
              <span className={`kpi-trend ${computedTrendType}`}>
                {trendText}
              </span>
            )}
            {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
