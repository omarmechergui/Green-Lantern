import React from "react";
import "./LoadingSkeleton.css";

export default function LoadingSkeleton({ count = 3, height = "60px", type = "card" }) {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="skeleton-grid" aria-busy="true" aria-label="Loading content">
        {items.map((_, i) => (
          <div key={i} className="skeleton-card" style={{ minHeight: height }}>
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-body" />
            <div className="skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Loading content">
      {items.map((_, i) => (
        <div key={i} className="skeleton-row" style={{ height }}>
          <div className="skeleton-circle" />
          <div className="skeleton-lines">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-short" />
          </div>
        </div>
      ))}
    </div>
  );
}
