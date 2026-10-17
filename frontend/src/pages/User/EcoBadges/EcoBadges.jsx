import React from "react";
import "./EcoBadges.css";
import { FaCheckCircle, FaLock } from "react-icons/fa";

export default function EcoBadges({ badgeName, description, imgSrc, earned }) {
  return (
    <article
      className={`eco-badge ${earned ? "earned" : "locked"}`}
      aria-label={`${badgeName}: ${earned ? "Earned" : "Locked"}`}
    >
      <div className="badge-icon">
        <img
          src={imgSrc}
          alt={badgeName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=60";
          }}
        />
      </div>
      <div className="badge-info">
        <h4 className="badge-name">{badgeName}</h4>
        <p className="badge-desc">{description}</p>
      </div>
      <div className="badge-status-wrap">
        {earned ? (
          <span className="earned-label">
            <FaCheckCircle aria-hidden="true" /> Earned
          </span>
        ) : (
          <span className="locked-label">
            <FaLock aria-hidden="true" /> In Progress
          </span>
        )}
      </div>
    </article>
  );
}
