import React from "react";

import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // لازم تستخدم react-router
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/pic/logo.jpg";
import "./TopBar.css";

export default function TopBar() {
  const { user } = useAuth();
  const coins = user?.ecoBalance ?? 0;
  const navigate = useNavigate();


  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Dashboard</h1>
      </div>

      <div className="topbar-right">
        <div className="coin-counter">
          <img src={logo} alt="Coin" className="coin-icon" />
          <span className="coin-number">{coins}</span>
        </div>

        <button className="topbar-btn" onClick={() => navigate("/notifications")}>
          <FaBell />
        </button>

        <button className="topbar-btn" onClick={() => navigate("/profile")}>
          <FaUserCircle />
        </button>
      </div>
    </div>
  );
}
