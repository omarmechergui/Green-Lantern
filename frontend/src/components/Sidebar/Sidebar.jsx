import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPlusCircle,
  FaRecycle,
  FaGift,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaHistory,
  FaBell,
  FaAward,
  FaTrophy,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";
import logo from "../../assets/pic/logo.jpg";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Support escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FaHome />, end: true },
    { to: "/declare", label: "Declare Waste", icon: <FaPlusCircle /> },
    { to: "/recycle", label: "Quick Recycle", icon: <FaRecycle /> },
    { to: "/history", label: "Waste History", icon: <FaHistory /> },
    { to: "/rewards", label: "Rewards", icon: <FaGift /> },
    { to: "/eco-badges", label: "Eco Badges", icon: <FaAward /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
    { to: "/notifications", label: "Notifications", icon: <FaBell /> },
    { to: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}
      aria-label="Main Navigation"
    >
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={logo} alt="Green Lantern Brand" className="sidebar-logo" />
          {(!isCollapsed || isMobileOpen) && (
            <div className="brand-text">
              <h2 className="sidebar-title">Green Lantern</h2>
              <span className="sidebar-badge">Eco Citizen</span>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          className="sidebar-collapse-btn desktop-only"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>

        {/* Mobile close toggle */}
        <button
          type="button"
          className="sidebar-close-btn mobile-only"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            title={item.label}
          >
            <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
            <span className="link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info mini-card */}
      {(!isCollapsed || isMobileOpen) && user && (
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar" aria-hidden="true">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">{user.fullName || "Citizen"}</span>
            <span className="sidebar-user-balance">{user.ecoBalance ?? 0} Eco Coins</span>
          </div>
        </div>
      )}

      <div className="sidebar-logout">
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Log out of Green Lantern"
          title="Logout"
        >
          <span className="sidebar-link-icon" aria-hidden="true"><FaSignOutAlt /></span>
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
