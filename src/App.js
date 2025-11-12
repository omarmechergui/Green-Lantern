import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Dashboard from "./pages/User/Dashboard/Dashboard";
import DeclareWaste from "./pages/User/DeclareWaste/DeclareWaste";
import Notifications from "./pages/Notifications/Notifications";
// Layout
import DashboardLayout from "./layouts/DashboardLayout";
import Rewards from "./pages/User/Rewards/Rewards";
import WasteHistory from "./pages/User/WasteHistory/WasteHistory";
import EcoBadgesPage from "./pages/User/EcoBadgesPage/EcoBadgesPage";
import Profile from "./pages/User/Profile/Profile";
import RecycleForm from "./pages/User/RecycleForm/RecycleForm";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // جربها true مبدئياً

  return (
    <Router>
      <Routes>
        {/* Default Redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout Pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/declare" element={<DeclareWaste />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/history" element={<WasteHistory />} />
          <Route path="/eco-badges" element={<EcoBadgesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recycle" element={<RecycleForm  />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
