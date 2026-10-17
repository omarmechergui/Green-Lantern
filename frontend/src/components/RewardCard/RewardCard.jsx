import React, { useEffect, useState } from "react";
import "./RewardCard.css";
import { FaLock, FaCheckCircle, FaCoins } from "react-icons/fa";

export default function RewardCard({
  rewardId,
  rewardName,
  pointsNeeded,
  userPoints,
  imgSrc,
  category = "Eco Merch",
  onRedeem,
  redeeming = false,
}) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (userPoints >= pointsNeeded) {
      setUnlocked(true);
    } else {
      setUnlocked(false);
    }
  }, [userPoints, pointsNeeded]);

  const progressPercent = Math.min(100, Math.round(((userPoints || 0) / pointsNeeded) * 100));

  return (
    <div className={`reward-card-animated ${unlocked ? "unlocked" : "locked"}`}>
      <div className="reward-img-container">
        <img
          src={imgSrc}
          alt={rewardName}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60";
          }}
        />
        <span className="reward-category-pill">{category}</span>
        {unlocked ? (
          <div className="unlocked-badge">
            <FaCheckCircle /> Unlocked
          </div>
        ) : (
          <div className="locked-badge">
            <FaLock /> {pointsNeeded - userPoints} pts left
          </div>
        )}
      </div>

      <div className="reward-content">
        <h4 className="reward-name">{rewardName}</h4>

        <div className="reward-points-row">
          <span className="points-cost">
            <FaCoins className="coin-mini" /> {pointsNeeded} points
          </span>
          <span className="points-progress-label">{progressPercent}%</span>
        </div>

        <div className="reward-progress-track">
          <div
            className={`reward-progress-fill ${unlocked ? "completed" : ""}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button
          className={`reward-action-btn ${unlocked ? "btn-claim" : "btn-locked"}`}
          disabled={!unlocked || redeeming}
          onClick={() => onRedeem && onRedeem(rewardId, pointsNeeded, rewardName)}
        >
          {redeeming
            ? "Processing..."
            : unlocked
            ? "Redeem Now"
            : "Earn More Points"}
        </button>
      </div>
    </div>
  );
}
