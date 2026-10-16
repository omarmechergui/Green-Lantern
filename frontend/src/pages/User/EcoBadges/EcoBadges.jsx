import React from "react";
import "./EcoBadges.css";

export default function EcoBadges({ badgeName, description, imgSrc, earned }) {
  return (
    <div className={`eco-badge ${earned ? "earned" : ""}`}>
      <div className="badge-icon">
        <img src={imgSrc} alt={badgeName} />
      </div>
      <div className="badge-info">
        <h4>{badgeName}</h4>
        <p>{description}</p>
      </div>
      {earned && <span className="earned-label">Earned</span>}
    </div>
  );
}
