import React from "react";
import "./Notifications.css";

export default function Notifications() {
  const notifications = [
    { id: 1, message: "You earned 50 eco points!", type: "success", time: "2 mins ago" },
    { id: 2, message: "New reward: Eco Mug", type: "info", time: "10 mins ago" },
    { id: 3, message: "Password will expire soon", type: "error", time: "1 hour ago" },
  ];

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification-item ${notif.type}`}>
            <p>{notif.message}</p>
            <span className="notif-time">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
