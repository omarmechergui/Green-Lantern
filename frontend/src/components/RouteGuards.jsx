import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0d1b13",
        color: "#4ade80",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(74, 222, 128, 0.2)",
          borderTop: "4px solid #4ade80",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>Loading Green Lantern...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested location for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
