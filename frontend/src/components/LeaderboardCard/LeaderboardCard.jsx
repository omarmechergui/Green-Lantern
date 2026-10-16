import React from "react";
import "./LeaderboardCard.css";
import { FaCrown, FaMedal } from "react-icons/fa";

export default function LeaderboardCard({ rank, name, points, isCurrentUser }) {
  const getRankBadge = () => {
    if (rank === 1) return <span className="rank-badge gold"><FaCrown /> 1</span>;
    if (rank === 2) return <span className="rank-badge silver"><FaMedal /> 2</span>;
    if (rank === 3) return <span className="rank-badge bronze"><FaMedal /> 3</span>;
    return <span className="rank-badge default">{rank}</span>;
  };

  const getInitials = (userName) => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`leaderboard-card ${rank <= 3 ? `top-${rank}` : ""} ${isCurrentUser ? "is-current-user" : ""}`}>
      <div className="rank-col">{getRankBadge()}</div>
      <div className="avatar-col">
        <div className="avatar-placeholder">{getInitials(name)}</div>
      </div>
      <div className="user-info">
        <div className="user-name-row">
          <h4 className="user-name">{name}</h4>
          {isCurrentUser && <span className="you-pill">You</span>}
        </div>
        <span className="user-meta">Level {Math.max(1, Math.floor(points / 300))} Eco Hero</span>
      </div>
      <div className="points-col">
        <span className="points-number">{points.toLocaleString()}</span>
        <span className="points-label">pts</span>
      </div>
    </div>
  );
}

