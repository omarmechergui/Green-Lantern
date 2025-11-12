import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar username="Omar Mechergui" />
        <Outlet />
      </div>
    </div>
  );
}
