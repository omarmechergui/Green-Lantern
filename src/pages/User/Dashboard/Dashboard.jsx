import React, { useState, useEffect } from "react";
import KPICard from "../../../components/KPICard/KPICard";
import { FaLeaf, FaRecycle, FaCoins } from "react-icons/fa";
import BadgeCardProgress from "../../../components/BadgeCard/BadgeCardProgress";
import RewardCard from "../../../components/RewardCard/RewardCard";
import "./Dashboard.css";
import CollectionMap from "../CollectionMap/CollectionMap";
import Leaderboard from "../Leaderboard/Leaderboard";
import LeaderboardCard from "../../../components/LeaderboardCard/LeaderboardCard";

export default function Dashboard() {
  const [userPoints, setUserPoints] = useState(450);

  // KPIs
  const kpis = [
    { title: "Total Waste Collected", value: "1200", unit: "kg", icon: <FaLeaf />, color: "#4ade80" },
    { title: "Recycling Points", value: userPoints, unit: "pts", icon: <FaRecycle />, color: "#22c55e" },
    { title: "Rewards Earned", value: 320, unit: "$", icon: <FaCoins />, color: "#facc15" },
  ];

  // Map Points
  const points = [
    { lat: 36.8065, lng: 10.1815, title: "Valis Recycling Center", type: "plastic", description: "Open 8am-5pm" },
    { lat: 36.806, lng: 10.195, title: "Food Waste Collection", type: "food", description: "Organic only" },
    { lat: 36.807, lng: 10.188, title: "Clothes Donation Spot", type: "clothes", description: "Drop-off 24/7" },
  ];

  // Rewards
  const rewards = [
    { rewardName: "Eco Mug", pointsNeeded: 300, imgSrc: "https://tupperware-eu.com/cdn/shop/files/eco-mug-490-ml-tupperware-1604630.jpg?v=1757630220&width=1365" },
    { rewardName: "Reusable Bag", pointsNeeded: 500, imgSrc: "https://environmentaldefence.ca/wp-content/uploads/2023/06/iStock-147041313-scaled.jpg" },
    { rewardName: "Plant Kit", pointsNeeded: 600, imgSrc: "https://getsprigbox.com/cdn/shop/files/Herb_Garden_-_Extra_1_All_plants_growing.jpg?v=1687900929&width=1200" },
  ];


  //Leaderboard
  const users = [
  { id: 1, name: "ala", points: 1200 },
  { id: 2, name: "ahmes", points: 950 },
  { id: 3, name: "pan xiaoxiaw", points: 870 },
];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main">
        <h1 className="dashboard-title">Welcome, GreenLantern User!</h1>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {kpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Badge Cards */}
        <div className="dashboard-cards">
          <BadgeCardProgress title="Recycled Items" value="120" iconType="recycle" progress={75} />
          <BadgeCardProgress title="Users Active" value="75" iconType="user" progress={50} />
          <BadgeCardProgress title="Eco Points" value={userPoints} iconType="leaf" progress={Math.min(userPoints / 100, 100)} />
        </div>


        <div className="leaderboard-section">
  <h2>Leaderboard</h2>
  <div className="leaderboard-grid">
    {users
      .sort((a, b) => b.points - a.points)
      .map((user, idx) => (
        <LeaderboardCard
          key={user.id}
          rank={idx + 1}
          name={user.name}
          points={user.points}
        />
      ))}
  </div>
</div>


        {/* Rewards Section */}
        <div className="rewards-section">
          <h2>Redeem Your Rewards</h2>
          <div className="rewards-cards">
            {rewards.map((r, idx) => (
              <RewardCard
                key={idx}
                rewardName={r.rewardName}
                pointsNeeded={r.pointsNeeded}
                imgSrc={r.imgSrc}
                userPoints={userPoints}
              />
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <h2>Recycling Centers Map</h2>
          <CollectionMap points={points} />
        </div>
      </div>
    </div>
  );
}
