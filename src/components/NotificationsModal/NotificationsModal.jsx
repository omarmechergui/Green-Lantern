import React from "react";
import "./NotificationsModal.css";
import NotificationItem from "../NotificationItem.jsx/NotificationItem";

export default function NotificationsModal({ notifications, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
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
    </div>
  );
}
