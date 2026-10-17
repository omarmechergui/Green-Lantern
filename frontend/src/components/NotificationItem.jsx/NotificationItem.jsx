import React, { useEffect, useState } from "react";
import "./NotificationItem.css";
import { FaBell } from "react-icons/fa";

export default function NotificationItem({ message, type, timestamp }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`notification-item-card ${visible ? "visible" : ""} ${type}`}>
      <div className="notification-icon-box" aria-hidden="true">
        <FaBell />
      </div>
      <div className="notification-content">
        <p className="notification-message">{message}</p>
        <span className="notification-time">{timestamp}</span>
      </div>
    </div>
  );
}
