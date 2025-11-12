import React from "react";
import "./BadgeCard.css";
import { FaLeaf, FaRecycle, FaUser } from "react-icons/fa";

export default function BadgeCard({ title, value, iconType }) {
  const renderIcon = () => {
    switch (iconType) {
      case "leaf": return <FaLeaf />;
      case "recycle": return <FaRecycle />;
      case "user": return <FaUser />;
      default: return <FaLeaf />;
    }
  };

  return (
    <div className="badge-card">
      <div className="badge-icon">{renderIcon()}</div>
      <div className="badge-info">
        <h3 className="badge-value">{value}</h3>
        <p className="badge-title">{title}</p>
      </div>
    </div>
  );
}
