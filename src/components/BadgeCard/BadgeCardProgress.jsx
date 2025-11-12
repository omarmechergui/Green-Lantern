import React, { useEffect, useState } from "react";
import "./BadgeCardProgress.css";
import { FaLeaf, FaRecycle, FaUser } from "react-icons/fa";

export default function BadgeCardProgress({ title, value, iconType, progress }) {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setFillWidth(progress), 200); // slight delay for animation
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

  return (
    <div className="badge-card-animated">
      <div className="badge-icon">{renderIcon()}</div>
      <div className="badge-info">
        <h3 className="badge-value">{value}</h3>
        <p className="badge-title">{title}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${fillWidth}%` }} />
        </div>
      </div>
    </div>
  );
}
