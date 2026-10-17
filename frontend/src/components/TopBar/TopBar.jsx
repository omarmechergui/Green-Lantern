import React from "react";
import { FaBell, FaUserCircle, FaBars, FaCoins } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./TopBar.css";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/declare": "Declare Waste",
  "/recycle": "Quick Recycle",
  "/history": "Waste History",
  "/rewards": "Rewards Catalog",
  "/eco-badges": "Eco Badges & Rankings",
  "/leaderboard": "Community Leaderboard",
  "/notifications": "Notifications",
  "/profile": "My Profile",
};

export default function TopBar({ onToggleMobileMenu, isMobileMenuOpen = false }) {
  const { user } = useAuth();
  const coins = user?.ecoBalance ?? 0;
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = ROUTE_TITLES[location.pathname] || "Green Lantern";

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        {onToggleMobileMenu && (
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <FaBars />
          </button>
        )}
        <h1 className="topbar-title">{currentTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Eco Coins Counter - Navigates to /rewards while preserving exact balance */}
        <button
          type="button"
          className="coin-counter-btn"
          onClick={() => navigate("/rewards")}
          aria-label={`You have ${coins} Eco Coins. Click to visit Rewards catalog`}
          title="View Rewards"
        >
          <span className="coin-icon-wrap" aria-hidden="true">
            <FaCoins />
          </span>
          <span className="coin-number">{coins.toLocaleString()}</span>
          <span className="coin-label">Eco Coins</span>
        </button>

        <button
          type="button"
          className="topbar-btn"
          onClick={() => navigate("/notifications")}
          aria-label="View notifications"
          title="Notifications"
        >
          <FaBell aria-hidden="true" />
        </button>

        <button
          type="button"
          className="topbar-btn"
          onClick={() => navigate("/profile")}
          aria-label={`View profile for ${user?.fullName || "user"}`}
          title="Profile"
        >
          <FaUserCircle aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
