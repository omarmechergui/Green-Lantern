import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaRecycle, FaGift, FaUser, FaSignOutAlt, FaBars, FaHistory } from "react-icons/fa";
import "./Sidebar.css";
import logo from "../../assets/pic/logo.jpg";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
     <div className="sidebar-top">
  {isOpen ? (
    <h2 className="sidebar-title">Green Lantern</h2>
  ) : (
    <img
      src={logo}
      alt="Logo"
      className="sidebar-logo-small"
    />
  )}
  <button className="sidebar-toggle" onClick={toggleSidebar}>
    <FaBars />
  </button>
</div>


      

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className="sidebar-link">
          <FaHome /> <span className="link-text">Dashboard</span>
        </NavLink>
        <NavLink to="/recycle" className="sidebar-link">
          <FaRecycle /> <span className="link-text">Recycle</span>
        </NavLink>
        <NavLink to="/rewards" className="sidebar-link">
          <FaGift /> <span className="link-text">Rewards</span>
        </NavLink>
        <NavLink to="/history" className="sidebar-link">
          <FaHistory /> <span className="link-text">Waste History</span>
        </NavLink>
        <NavLink to="/profile" className="sidebar-link">
          <FaUser /> <span className="link-text">Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-logout">
        <button className="logout-btn">
          <FaSignOutAlt /> <span className="link-text">Logout</span>
        </button>
      </div>
    </div>
  );
}
