import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth & Route Guards
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";

// Pages
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Dashboard from "./pages/User/Dashboard/Dashboard";
import DeclareWaste from "./pages/User/DeclareWaste/DeclareWaste";
import Notifications from "./pages/Notifications/Notifications";
import Rewards from "./pages/User/Rewards/Rewards";
import WasteHistory from "./pages/User/WasteHistory/WasteHistory";
import EcoBadgesPage from "./pages/User/EcoBadgesPage/EcoBadgesPage";
import Profile from "./pages/User/Profile/Profile";
import RecycleForm from "./pages/User/RecycleForm/RecycleForm";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Redirect based on real auth state */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Auth Pages (Redirect to dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/declare" element={<DeclareWaste />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/history" element={<WasteHistory />} />
          <Route path="/eco-badges" element={<EcoBadgesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recycle" element={<RecycleForm />} />
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
