import React, { useEffect, useState } from "react";
import "./BadgeCardProgress.css";
import { FaLeaf, FaRecycle, FaUser } from "react-icons/fa";

export default function BadgeCardProgress({ title, value, iconType, progress, target }) {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setFillWidth(Math.min(Math.max(progress, 0), 100)), 150);
    return () => clearTimeout(timeout);
  }, [progress]);

  const renderIcon = () => {
    switch (iconType) {
      case "leaf": return <FaLeaf />;
      case "recycle": return <FaRecycle />;
      case "user": return <FaUser />;
      default: return <FaLeaf />;
    }
  };

  const getThemeClass = () => {
    switch (iconType) {
      case "leaf": return "theme-leaf";
      case "recycle": return "theme-recycle";
      case "user": return "theme-user";
      default: return "theme-leaf";
    }
  };

  return (
    <div className={`badge-card-animated ${getThemeClass()}`}>
      <div className="badge-card-top">
        <div className="badge-icon-box">{renderIcon()}</div>
        <div className="badge-percent">{Math.round(progress)}%</div>
      </div>
      <div className="badge-info">
        <div className="badge-title">{title}</div>
        <div className="badge-value-row">
          <span className="badge-value">{value}</span>
          {target && <span className="badge-target">/ {target}</span>}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${fillWidth}%` }} />
        </div>
      </div>
    </div>
  );
}
