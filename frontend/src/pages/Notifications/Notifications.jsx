import React, { useState, useEffect } from "react";
import "./Notifications.css";
import { ecoService } from "../../services/eco.service";
import EmptyState from "../../components/common/EmptyState";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import { FaBell, FaCheckDouble, FaCoins, FaGift, FaRecycle, FaInfoCircle } from "react-icons/fa";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      setLoading(true);
      const res = await ecoService.getNotifications();
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await ecoService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ecoService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "POINTS_AWARDED":
        return <FaCoins className="notif-type-icon points" aria-hidden="true" />;
      case "REWARD_UPDATE":
        return <FaGift className="notif-type-icon reward" aria-hidden="true" />;
      case "DECLARATION_STATUS":
        return <FaRecycle className="notif-type-icon waste" aria-hidden="true" />;
      default:
        return <FaInfoCircle className="notif-type-icon info" aria-hidden="true" />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h2 className="notifications-title">
            Notifications{" "}
            {unreadCount > 0 && (
              <span className="unread-counter-badge">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="notifications-subtitle">
            Stay updated with your recycling verification results, Eco Coins awards, and rewards updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn-mark-all"
            aria-label="Mark all notifications as read"
          >
            <FaCheckDouble aria-hidden="true" /> Mark all as read
          </button>
        )}
      </div>

      {loading && <LoadingSkeleton count={4} height="70px" type="list" />}

      {!loading && notifications.length === 0 && (
        <EmptyState
          icon={<FaBell />}
          title="No notifications yet"
          description="When your recycling deposits are approved or coins are credited, you'll see alerts here."
        />
      )}

      {!loading && notifications.length > 0 && (
        <div className="notifications-list" role="feed" aria-label="Notifications list">
          {notifications.map((notif) => {
            const isRead = !!notif.readAt;
            const timeStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            return (
              <article
                key={notif.id}
                className={`notification-item ${isRead ? "read" : "unread"}`}
                onClick={() => !isRead && handleMarkAsRead(notif.id)}
                role="button"
                tabIndex={!isRead ? 0 : -1}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isRead) {
                    e.preventDefault();
                    handleMarkAsRead(notif.id);
                  }
                }}
                aria-label={`${isRead ? "Read" : "Unread"} notification: ${notif.title}`}
              >
                <div className="notif-left">
                  <div className="notif-icon-box">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notif-body">
                    <strong className="notif-title">{notif.title}</strong>
                    <p className="notif-msg">{notif.message}</p>
                  </div>
                </div>

                <div className="notif-meta">
                  <time className="notif-time" dateTime={notif.createdAt || ""}>
                    {timeStr}
                  </time>
                  {!isRead && (
                    <span className="unread-dot" title="Unread" aria-label="Unread notification" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
