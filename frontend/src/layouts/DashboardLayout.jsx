import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar username={user?.fullName || "User"} />
        <Outlet />
      </div>
    </div>
  );
}
