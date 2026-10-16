import React from "react";
import "./NotificationsPanel.css";
import NotificationItem from "../NotificationItem.jsx/NotificationItem";

export default function NotificationsPanel({ notifications, isOpen, onClose }) {
  return (
    <div className={`notifications-panel ${isOpen ? "open" : ""}`}>
      <div className="panel-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="panel-body">
        {notifications.length ? (
          notifications.map((notif, idx) => (
            <NotificationItem
              key={idx}
              message={notif.message}
              type={notif.type}
              timestamp={notif.timestamp}
            />
          ))
        ) : (
          <p className="no-notifications">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
