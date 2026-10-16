import React, { useState } from "react";
import { Link } from "react-router-dom";
import KPICard from "../../../components/KPICard/KPICard";
import BadgeCardProgress from "../../../components/BadgeCard/BadgeCardProgress";
import RewardCard from "../../../components/RewardCard/RewardCard";
import LeaderboardCard from "../../../components/LeaderboardCard/LeaderboardCard";
import CollectionMap from "../CollectionMap/CollectionMap";
import {
  FaLeaf,
  FaRecycle,
  FaCoins,
  FaTree,
  FaArrowRight,
  FaMapMarkerAlt,
  FaTrophy,
  FaGift,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [userPoints] = useState(450);
  const [timeRange, setTimeRange] = useState("week");

  // Preserved & enriched KPIs (clearly labeled demo / account status)
  const kpis = [
    {
      title: "Total Waste Collected",
      value: "1,200",
      unit: "kg",
      icon: <FaLeaf />,
      color: "#059669",
      trend: { positive: true, value: "+14.2%" },
      subtitle: "vs previous month",
    },
    {
      title: "Recycling Points",
      value: userPoints.toLocaleString(),
      unit: "pts",
      icon: <FaRecycle />,
      color: "#10b981",
      trend: { positive: true, value: "+45 pts" },
      subtitle: "Tier: Silver Recycler",
    },
    {
      title: "Rewards Earned",
      value: "320",
      unit: "$",
      icon: <FaCoins />,
      color: "#eab308",
      trend: { positive: true, value: "+$40" },
      subtitle: "Lifetime value saved",
    },
    {
      title: "CO2 Offset",
      value: "485",
      unit: "kg",
      icon: <FaTree />,
      color: "#0284c7",
      trend: { positive: true, value: "+8.5%" },
      subtitle: "Equivalent to 22 trees",
    },
  ];

  // Demo Recycling statistics per time range for Recharts
  const weeklyTrends = [
    { name: "Mon", plastic: 18, food: 24, clothes: 8 },
    { name: "Tue", plastic: 25, food: 30, clothes: 12 },
    { name: "Wed", plastic: 20, food: 18, clothes: 6 },
    { name: "Thu", plastic: 32, food: 28, clothes: 14 },
    { name: "Fri", plastic: 28, food: 35, clothes: 20 },
    { name: "Sat", plastic: 42, food: 48, clothes: 26 },
    { name: "Sun", plastic: 36, food: 40, clothes: 18 },
  ];

  const monthlyTrends = [
    { name: "Week 1", plastic: 95, food: 140, clothes: 45 },
    { name: "Week 2", plastic: 120, food: 165, clothes: 55 },
    { name: "Week 3", plastic: 110, food: 150, clothes: 40 },
    { name: "Week 4", plastic: 145, food: 190, clothes: 70 },
  ];

  const activeChartData = timeRange === "week" ? weeklyTrends : monthlyTrends;

  // Preserved Map Points
  const points = [
    { lat: 36.8065, lng: 10.1815, title: "Valis Recycling Center", type: "plastic", description: "Open 8am-5pm • Accepts PET & HDPE" },
    { lat: 36.8060, lng: 10.1950, title: "Food Waste Collection", type: "food", description: "Organic only • Daily pickup" },
    { lat: 36.8070, lng: 10.1880, title: "Clothes Donation Spot", type: "clothes", description: "Drop-off 24/7 • Clean garments" },
  ];

  // Preserved Rewards
  const rewards = [
    {
      rewardName: "Eco Mug",
      pointsNeeded: 300,
      category: "Drinkware",
      imgSrc: "https://tupperware-eu.com/cdn/shop/files/eco-mug-490-ml-tupperware-1604630.jpg?v=1757630220&width=1365",
    },
    {
      rewardName: "Reusable Bag",
      pointsNeeded: 500,
      category: "Lifestyle",
      imgSrc: "https://environmentaldefence.ca/wp-content/uploads/2023/06/iStock-147041313-scaled.jpg",
    },
    {
      rewardName: "Plant Kit",
      pointsNeeded: 600,
      category: "Gardening",
      imgSrc: "https://getsprigbox.com/cdn/shop/files/Herb_Garden_-_Extra_1_All_plants_growing.jpg?v=1687900929&width=1200",
    },
  ];

  // Preserved Leaderboard with current user indicator
  const users = [
    { id: 1, name: "Ala B.", points: 1200, isCurrent: false },
    { id: 2, name: "Ahmes K.", points: 950, isCurrent: false },
    { id: 3, name: "Pan Xiaoxiaw", points: 870, isCurrent: false },
    { id: 4, name: "Omar Mechergui", points: userPoints, isCurrent: true },
  ];

  return (
    <div className="dashboard-content-area">
      {/* Hero Welcome & Quick Action Bar */}
      <section className="dashboard-hero">
        <div className="hero-text-col">
          <div className="hero-pill">
            <FaLeaf className="hero-pill-icon" /> Environmental Impact Platform
          </div>
          <h1 className="hero-title">Welcome back, Omar!</h1>
          <p className="hero-subtitle">
            Track your recycling activities, monitor footprint reduction, and redeem verified eco rewards.
          </p>
        </div>
        <div className="hero-actions-col">
          <Link to="/recycle" className="primary-action-btn">
            <FaRecycle /> Log Waste Deposit
          </Link>
          <Link to="/rewards" className="secondary-action-btn">
            <FaGift /> View Catalog
          </Link>
        </div>
      </section>

      {/* Demo Notice Banner (Guideline 9 compliance) */}
      <div className="demo-notice-bar" role="note">
        <FaInfoCircle className="demo-notice-icon" />
        <span>
          <strong>Sample Preview Data:</strong> Metrics and trends shown reflect your current demonstration profile data.
        </span>
      </div>

      {/* KPI Metric Cards Grid */}
      <section className="dashboard-section" aria-label="Key Performance Indicators">
        <div className="kpi-grid">
          {kpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
            />
          ))}
        </div>
      </section>

      {/* Goal Targets / Monthly Progress Section */}
      <section className="dashboard-section" aria-label="Recycling Targets">
        <div className="section-header-compact">
          <h3 className="section-title-compact">Monthly Sustainability Milestones</h3>
          <span className="section-subtext">October 2026 Cycle</span>
        </div>
        <div className="targets-grid">
          <BadgeCardProgress
            title="Recycled Items Target"
            value="120"
            target="160 items"
            iconType="recycle"
            progress={75}
          />
          <BadgeCardProgress
            title="Community Active Days"
            value="15"
            target="30 days"
            iconType="user"
            progress={50}
          />
          <BadgeCardProgress
            title="Eco Reward Points"
            value={userPoints}
            target="1,000 pts"
            iconType="leaf"
            progress={Math.min((userPoints / 1000) * 100, 100)}
          />
        </div>
      </section>

      {/* Interactive Charts & Analytics Section */}
      <section className="dashboard-section">
        <div className="analytics-card">
          <div className="analytics-header">
            <div>
              <h3 className="card-heading">Recycling Volume & Materials Breakdown</h3>
              <p className="card-subheading">Weight collected across categories (kg)</p>
            </div>
            <div className="time-toggle-group">
              <button
                className={`time-toggle-btn ${timeRange === "week" ? "active" : ""}`}
                onClick={() => setTimeRange("week")}
              >
                <FaCalendarAlt className="toggle-icon" /> This Week
              </button>
              <button
                className={`time-toggle-btn ${timeRange === "month" ? "active" : ""}`}
                onClick={() => setTimeRange("month")}
              >
                <FaCalendarAlt className="toggle-icon" /> This Month
              </button>
            </div>
          </div>

          <div className="chart-grid">
            {/* Area Chart: Trend */}
            <div className="chart-box">
              <span className="chart-title">Collection Growth Trend</span>
              <div className="chart-container-inner">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="plasticGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="plastic"
                      name="Plastic (kg)"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#plasticGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="food"
                      name="Organic (kg)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#foodGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Material comparison */}
            <div className="chart-box">
              <span className="chart-title">Material Comparison</span>
              <div className="chart-container-inner">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="plastic" name="Plastic" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="food" name="Organic" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clothes" name="Clothes" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Grid: Leaderboard & Map */}
      <div className="dashboard-dual-grid">
        {/* Leaderboard Column */}
        <section className="dual-grid-col" aria-label="Community Leaderboard">
          <div className="content-card">
            <div className="card-top-bar">
              <div className="card-heading-icon-wrap">
                <FaTrophy className="header-icon trophy" />
                <div>
                  <h3 className="card-heading">Top Contributors</h3>
                  <p className="card-subheading">Regional eco rankings</p>
                </div>
              </div>
              <span className="live-pill">Live</span>
            </div>

            <div className="leaderboard-cards-stack">
              {users
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((user, idx) => (
                  <LeaderboardCard
                    key={user.id}
                    rank={idx + 1}
                    name={user.name}
                    points={user.points}
                    isCurrentUser={user.isCurrent}
                  />
                ))}
            </div>

            <div className="card-bottom-link">
              <Link to="/history" className="text-cta">
                View your complete collection history <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Recycling Centers Map Column */}
        <section className="dual-grid-col" aria-label="Recycling Centers Near You">
          <div className="content-card">
            <div className="card-top-bar">
              <div className="card-heading-icon-wrap">
                <FaMapMarkerAlt className="header-icon map" />
                <div>
                  <h3 className="card-heading">Verified Drop-off Centers</h3>
                  <p className="card-subheading">3 authorized hubs near Tunis</p>
                </div>
              </div>
              <div className="map-legend-pills">
                <span className="legend-tag tag-plastic">Plastic</span>
                <span className="legend-tag tag-food">Organic</span>
                <span className="legend-tag tag-clothes">Textiles</span>
              </div>
            </div>

            <div className="dashboard-map-wrapper">
              <CollectionMap points={points} />
            </div>
          </div>
        </section>
      </div>

      {/* Rewards Catalog Preview Section */}
      <section className="dashboard-section" aria-label="Rewards Catalog Preview">
        <div className="content-card">
          <div className="card-top-bar">
            <div className="card-heading-icon-wrap">
              <FaGift className="header-icon gift" />
              <div>
                <h3 className="card-heading">Rewards Ready to Redeem</h3>
                <p className="card-subheading">
                  Use your <strong>{userPoints} eco points</strong> to claim sustainable goods
                </p>
              </div>
            </div>
            <Link to="/rewards" className="view-all-link">
              Explore All Rewards <FaArrowRight />
            </Link>
          </div>

          <div className="rewards-grid-preview">
            {rewards.map((r, idx) => (
              <RewardCard
                key={idx}
                rewardName={r.rewardName}
                pointsNeeded={r.pointsNeeded}
                imgSrc={r.imgSrc}
                userPoints={userPoints}
                category={r.category}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
