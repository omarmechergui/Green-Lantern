import React, { useEffect, useState } from "react";
import "./RewardCard.css";

export default function RewardCard({ rewardName, pointsNeeded, userPoints, imgSrc }) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (userPoints >= pointsNeeded) {
      setUnlocked(true);
    }
  }, [userPoints, pointsNeeded]);

  return (
    <div className={`reward-card-animated ${unlocked ? "unlocked" : ""}`}>
      <div className="reward-img">
        <img src={imgSrc} alt={rewardName} />
        {unlocked && <div className="unlocked-badge">Unlocked!</div>}
      </div>
      <div className="reward-info">
        <h3 className="reward-name">{rewardName}</h3>
        <p className="reward-points">{pointsNeeded} points</p>
      </div>
    </div>
  );
}
