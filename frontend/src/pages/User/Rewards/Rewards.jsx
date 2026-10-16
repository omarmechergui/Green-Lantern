// src/pages/Rewards/Rewards.jsx
import React from "react";
import "./Rewards.css";
import RewardCard from "../../../components/RewardCard/RewardCard";

export default function Rewards() {
  const userPoints = 120;

  const rewardsList = [
    {
      rewardName: "Eco Bag",
      pointsNeeded: 100,
      imgSrc: "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    },
    {
      rewardName: "Discount Coupon",
      pointsNeeded: 200,
      imgSrc: "https://thumbs.dreamstime.com/b/wildflowers-blooming-sunset-nature-scenery-wildflowers-blooming-sunset-nature-scenery-388164189.jpg",
    },
    {
      rewardName: "Tree Planting Certificate",
      pointsNeeded: 300,
      imgSrc: "https://i.pinimg.com/236x/d1/d4/63/d1d46381d3c104837c94190352b4186b.jpg",
    },
  ];

  return (
    <div className="rewards-container">
      <h2 className="rewards-title">Your Rewards</h2>
      <div className="rewards-grid">
        {rewardsList.map((reward, index) => (
          <RewardCard
            key={index}
            rewardName={reward.rewardName}
            pointsNeeded={reward.pointsNeeded}
            userPoints={userPoints}
            imgSrc={reward.imgSrc}
          />
        ))}
      </div>
    </div>
  );
}
