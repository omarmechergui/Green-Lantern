import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import KPICard from "../../../components/KPICard/KPICard";
import BadgeCardProgress from "../../../components/BadgeCard/BadgeCardProgress";
import RewardCard from "../../../components/RewardCard/RewardCard";
import LeaderboardCard from "../../../components/LeaderboardCard/LeaderboardCard";
import CollectionMap from "../CollectionMap/CollectionMap";
import { useAuth } from "../../../context/AuthContext";
import { ecoService } from "../../../services/eco.service";
import { fetchCollectionCenters } from "../../../services/waste.service";
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
  FaCheckCircle,
  FaClock,
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
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [rewardsList, setRewardsList] = useState([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [mapCenters, setMapCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, rewardsRes, lbRes, centersRes] = await Promise.allSettled([
          ecoService.getDashboardStats(),
          ecoService.getRewards(),
          ecoService.getLeaderboard(5),
          fetchCollectionCenters(),
        ]);

        if (isMounted) {
          if (statsRes.status === "fulfilled" && statsRes.value) {
            setStatsData(statsRes.value);
          }
          if (rewardsRes.status === "fulfilled" && rewardsRes.value) {
            setRewardsList(rewardsRes.value);
          }
          if (lbRes.status === "fulfilled" && lbRes.value) {
            setLeaderboardUsers(lbRes.value);
          }
          if (centersRes.status === "fulfilled" && centersRes.value) {
            setMapCenters(centersRes.value);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const userPoints = statsData?.kpis?.ecoBalance ?? user?.ecoBalance ?? 0;
  const verifiedWeight = statsData?.kpis?.totalVerifiedWeightKg ?? 0;
  const totalDeclarations = statsData?.kpis?.totalDeclarations ?? 0;
  const approvedCount = statsData?.kpis?.approvedCount ?? 0;
  const pendingCount = statsData?.kpis?.pendingCount ?? 0;
  const co2Offset = statsData?.kpis?.co2OffsetKg ?? 0;

  // Real KPIs backed by MongoDB database records
  const kpis = [
    {
      title: "Verified Waste Recycled",
      value: verifiedWeight.toLocaleString(),
      unit: "kg",
      icon: <FaLeaf />,
      color: "#059669",
      trend: { positive: true, value: `${approvedCount} approved` },
      subtitle: `${totalDeclarations} total logged`,
    },
    {
      title: "Eco Coins Balance",
      value: userPoints.toLocaleString(),
      unit: "pts",
      icon: <FaRecycle />,
      color: "#10b981",
      trend: { positive: true, value: "Active" },
      subtitle: user?.role ? `Role: ${user.role}` : "Citizen Account",
    },
    {
      title: "Pending Approval",
      value: pendingCount.toString(),
      unit: "items",
      icon: <FaClock />,
      color: "#eab308",
      trend: { positive: pendingCount === 0, value: pendingCount > 0 ? "Under review" : "Up to date" },
      subtitle: "Awaiting center verification",
    },
    {
      title: "CO2 Offset",
      value: co2Offset.toLocaleString(),
      unit: "kg",
      icon: <FaTree />,
      color: "#0284c7",
      trend: { positive: true, value: `~${Math.round(co2Offset / 20)} trees` },
      subtitle: "Calculated from verified waste",
    },
  ];

  // Dynamic breakdown from real categories
  const categoryTotals = statsData?.categoryTotals || {};
  const chartCategories = Object.keys(categoryTotals);

  const materialsChartData =
    chartCategories.length > 0
      ? chartCategories.map((cat) => ({
          name: cat,
          recycled: categoryTotals[cat],
        }))
      : [
          { name: "Plastic", recycled: 0 },
          { name: "Organic", recycled: 0 },
          { name: "Textiles", recycled: 0 },
        ];

  // Map collection centers from database
  const mappedPoints =
    mapCenters.length > 0
      ? mapCenters.map((c) => ({
          lat: c.latitude || 36.8065,
          lng: c.longitude || 10.1815,
          title: c.name,
          type: "plastic",
          description: `${c.address}, ${c.city}`,
        }))
      : [
          { lat: 36.8065, lng: 10.1815, title: "Valis Center", type: "plastic", description: "Open 8am-5pm" },
          { lat: 36.8060, lng: 10.1950, title: "Food Waste Hub", type: "food", description: "Organic only" },
        ];

  return (
    <div className="dashboard-content-area">
      {/* Hero Welcome & Quick Action Bar */}
      <section className="dashboard-hero">
        <div className="hero-text-col">
          <div className="hero-pill">
            <FaLeaf className="hero-pill-icon" /> Environmental Impact Platform
          </div>
          <h1 className="hero-title">
            Welcome back, {user?.fullName || "Recycler"}!
          </h1>
          <p className="hero-subtitle">
            Track your verified recycling activities, monitor carbon reduction, and redeem Eco Coins for sustainable rewards.
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
          <h3 className="section-title-compact">Recycling Milestones & Progress</h3>
          <span className="section-subtext">Verified database metrics</span>
        </div>
        <div className="targets-grid">
          <BadgeCardProgress
            title="Verified Recycled Waste"
            value={`${verifiedWeight} kg`}
            target="50 kg target"
            iconType="recycle"
            progress={Math.min((verifiedWeight / 50) * 100, 100)}
          />
          <BadgeCardProgress
            title="Approved Declarations"
            value={approvedCount.toString()}
            target="10 target"
            iconType="user"
            progress={Math.min((approvedCount / 10) * 100, 100)}
          />
          <BadgeCardProgress
            title="Eco Coins Balance"
            value={`${userPoints} pts`}
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
              <h3 className="card-heading">Verified Recycling Materials Breakdown</h3>
              <p className="card-subheading">Net verified weight across categories (kg)</p>
            </div>
          </div>

          <div className="chart-grid">
            {/* Bar Chart: Material comparison */}
            <div className="chart-box" style={{ gridColumn: "span 2" }}>
              <span className="chart-title">Recycled Weight by Waste Category</span>
              <div className="chart-container-inner">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={materialsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Bar dataKey="recycled" name="Verified Weight (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                  <p className="card-subheading">Live platform rankings</p>
                </div>
              </div>
              <span className="live-pill">Live</span>
            </div>

            <div className="leaderboard-cards-stack">
              {leaderboardUsers.length > 0 ? (
                leaderboardUsers.map((lbUser) => (
                  <LeaderboardCard
                    key={lbUser.id}
                    rank={lbUser.rank}
                    name={lbUser.name}
                    points={lbUser.points}
                    isCurrentUser={lbUser.isCurrentUser}
                  />
                ))
              ) : (
                <p style={{ padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>
                  No contributors recorded yet.
                </p>
              )}
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
                  <h3 className="card-heading">Authorized Drop-off Centers</h3>
                  <p className="card-subheading">{mapCenters.length} verified hubs available</p>
                </div>
              </div>
            </div>

            <div className="dashboard-map-wrapper">
              <CollectionMap points={mappedPoints} />
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
                  Use your <strong>{userPoints} Eco Coins</strong> to claim sustainable goods
                </p>
              </div>
            </div>
            <Link to="/rewards" className="view-all-link">
              Explore All Rewards <FaArrowRight />
            </Link>
          </div>

          <div className="rewards-grid-preview">
            {rewardsList.length > 0 ? (
              rewardsList.slice(0, 3).map((r) => (
                <RewardCard
                  key={r.id}
                  rewardName={r.title}
                  pointsNeeded={r.pointsCost}
                  imgSrc={r.imageUrl}
                  userPoints={userPoints}
                  category={r.stock > 0 ? `In Stock (${r.stock})` : "Out of Stock"}
                />
              ))
            ) : (
              <p style={{ padding: "1.5rem", color: "#64748b" }}>
                No active rewards in catalog. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
