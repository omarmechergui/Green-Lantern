import React from "react";
import "./StatusBadge.css";
import { FaCheckCircle, FaClock, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

export default function StatusBadge({ status, label }) {
  const normalized = (status || "").toUpperCase();

  const config = {
    APPROVED: {
      className: "status-approved",
      icon: <FaCheckCircle aria-hidden="true" />,
      defaultLabel: "Approved",
    },
    COMPLETED: {
      className: "status-approved",
      icon: <FaCheckCircle aria-hidden="true" />,
      defaultLabel: "Completed",
    },
    PENDING: {
      className: "status-pending",
      icon: <FaClock aria-hidden="true" />,
      defaultLabel: "Pending Review",
    },
    REJECTED: {
      className: "status-rejected",
      icon: <FaTimesCircle aria-hidden="true" />,
      defaultLabel: "Rejected",
    },
  }[normalized] || {
    className: "status-neutral",
    icon: <FaInfoCircle aria-hidden="true" />,
    defaultLabel: status || "Unknown",
  };

  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}
