import React from "react";
import "./EmptyState.css";
import { Link } from "react-router-dom";

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) {
  return (
    <div className="empty-state-card" role="region" aria-label={title}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      
      {actionLink && (
        <Link to={actionLink} className="empty-state-btn">
          {actionText}
        </Link>
      )}

      {onAction && !actionLink && (
        <button type="button" className="empty-state-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
