import React, { useState, useEffect } from "react";
import "./EcoBadgesPage.css";
import EcoBadges from "../EcoBadges/EcoBadges";

export default function EcoBadgesPage() {
  const [userPoints, setUserPoints] = useState(4200);

  const levels = [
    { name: "Green Starter", min: 0, max: 1000, color: "#86efac" },
    { name: "Eco Explorer", min: 1000, max: 3000, color: "#4ade80" },
    { name: "Planet Protector", min: 3000, max: 6000, color: "#22c55e" },
    { name: "Nature Legend", min: 6000, max: 10000, color: "#16a34a" },
  ];

  const badges = [
    { badgeName: "Food Saver", description: "Recycled 10kg of food waste 🍎", imgSrc: "/badges/food.png" },
    { badgeName: "Plastic Hero", description: "Recycled 50 bottles ♻️", imgSrc: "/badges/plastic.png" },
    { badgeName: "Clothes Donor", description: "Donated 5kg of clothes 👕", imgSrc: "/badges/clothes.png" },
  ];

  // Find current level
  const currentLevel =
    levels.find(l => userPoints >= l.min && userPoints < l.max) || levels[levels.length - 1];

  const nextLevel = levels.find(l => l.min > currentLevel.min);
  const progressPercent = nextLevel
    ? ((userPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <div className="eco-vip-page">
      <h1 className="vip-title">🌿 Eco Rank System</h1>
      <p className="vip-desc">
        You’re currently a <strong style={{ color: currentLevel.color }}>{currentLevel.name}</strong>!
      </p>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              background: currentLevel.color,
            }}
          ></div>
        </div>
        <div className="level-labels">
          <span>{currentLevel.name}</span>
          <span>{nextLevel ? nextLevel.name : "Max Level 🚀"}</span>
        </div>
      </div>

      {/* Points Info */}
      <p className="points-info">
        {userPoints} / {nextLevel ? nextLevel.min : "10000"} pts
      </p>

      {/* Badge Section */}
      <div className="vip-badges-section">
        <h2>Your Achievements</h2>
        <div className="vip-badges-grid">
          {badges.map((badge, index) => (
            <EcoBadges key={index} {...badge} earned={userPoints > 2000 + index * 1000} />
          ))}
        </div>
      </div>
    </div>
  );
}
