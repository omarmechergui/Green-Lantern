import React, { useState, useEffect } from "react";
import "./Rewards.css";
import RewardCard from "../../../components/RewardCard/RewardCard";
import { useAuth } from "../../../context/AuthContext";
import { ecoService } from "../../../services/eco.service";
import StatusBadge from "../../../components/common/StatusBadge";
import EmptyState from "../../../components/common/EmptyState";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import { FaGift, FaCoins, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function Rewards() {
  const { user, refreshUser } = useAuth();
  const [rewardsList, setRewardsList] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" | "my-redemptions"

  const userPoints = user?.ecoBalance ?? 0;

  async function loadData() {
    try {
      setLoading(true);
      const [rewards, redemps] = await Promise.all([
        ecoService.getRewards(),
        ecoService.getUserRedemptions(),
      ]);
      setRewardsList(rewards || []);
      setRedemptions(redemps || []);
    } catch (err) {
      console.error("Failed to load rewards:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (rewardId, pointsCost, title) => {
    if (userPoints < pointsCost) {
      setMessage({ type: "error", text: `Insufficient Eco Coins. You need ${pointsCost} points.` });
      return;
    }

    try {
      setRedeemingId(rewardId);
      setMessage(null);
      await ecoService.redeemReward(rewardId);
      setMessage({
        type: "success",
        text: `Successfully redeemed "${title}"! Your request has been recorded.`,
      });
      if (refreshUser) refreshUser();
      loadData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to redeem reward.",
      });
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="rewards-container">
      <div className="rewards-header-row">
        <div>
          <h2 className="rewards-title">Sustainable Rewards Catalog</h2>
          <p className="rewards-subtitle">
            Available balance: <strong className="rewards-balance-highlight">{userPoints.toLocaleString()} Eco Coins</strong>
          </p>
        </div>

        <div className="rewards-tab-group" role="tablist" aria-label="Rewards view options">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "catalog"}
            className={`rewards-tab-btn ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            Catalog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "my-redemptions"}
            className={`rewards-tab-btn ${activeTab === "my-redemptions" ? "active" : ""}`}
            onClick={() => setActiveTab("my-redemptions")}
          >
            My Redemptions ({redemptions.length})
          </button>
        </div>
      </div>

      {message && (
        <div className={`rewards-message-alert ${message.type}`} role="alert">
          {message.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{message.text}</span>
        </div>
      )}

      {loading && <LoadingSkeleton count={3} height="240px" type="card" />}

      {activeTab === "catalog" && !loading && (
        <>
          {rewardsList.length === 0 ? (
            <EmptyState
              icon={<FaGift />}
              title="No rewards in catalog"
              description="New sustainable eco-products and partner vouchers will be added shortly."
            />
          ) : (
            <div className="rewards-grid" role="region" aria-label="Available rewards list">
              {rewardsList.map((reward) => (
                <RewardCard
                  key={reward.id}
                  rewardId={reward.id}
                  rewardName={reward.title}
                  pointsNeeded={reward.pointsCost}
                  userPoints={userPoints}
                  imgSrc={reward.imageUrl}
                  category={reward.stock > 0 ? `Stock: ${reward.stock}` : "Out of Stock"}
                  onRedeem={handleRedeem}
                  redeeming={redeemingId === reward.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "my-redemptions" && !loading && (
        <div className="redemptions-card">
          {redemptions.length === 0 ? (
            <EmptyState
              icon={<FaCoins />}
              title="No redemptions yet"
              description="Browse the rewards catalog and redeem your Eco Coins for gifts and vouchers."
              actionText="Browse Rewards"
              onAction={() => setActiveTab("catalog")}
            />
          ) : (
            <div className="redemptions-list" role="feed" aria-label="Redemptions history">
              {redemptions.map((redemp) => (
                <article key={redemp.id} className="redemption-row">
                  <div>
                    <h4 className="redemption-title">{redemp.reward?.title || "Reward"}</h4>
                    <p className="redemption-meta">
                      Requested on {new Date(redemp.createdAt).toLocaleDateString()} • {redemp.pointsSpent} pts
                    </p>
                  </div>
                  <StatusBadge status={redemp.status} />
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
