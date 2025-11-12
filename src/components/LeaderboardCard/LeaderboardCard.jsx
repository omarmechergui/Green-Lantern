import React from "react";
import "./LeaderboardCard.css";

export default function LeaderboardCard({ rank, name, points }) {
  const getVipClass = () => {
    if (rank === 1) return "vip-1";
    if (rank === 2) return "vip-2";
    if (rank === 3) return "vip-3";
    return "";
  };

  return (
    <div className={`leaderboard-card ${getVipClass()}`}>
      <div className="rank-circle">{rank}</div>
      <div className="user-info">
        <h3>{name}</h3>
        <p>{points} pts</p>
      </div>
    </div>
  );
}

