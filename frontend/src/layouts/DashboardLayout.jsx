import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <div className="dashboard-main">
        <TopBar
          username={user?.fullName || "User"}
          onToggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={mobileMenuOpen}
        />
        <main id="main-content" className="dashboard-page-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
