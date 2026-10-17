import React, { useState, useEffect } from "react";
import "./EcoBadgesPage.css";
import EcoBadges from "../EcoBadges/EcoBadges";
import { useAuth } from "../../../context/AuthContext";
import { ecoService } from "../../../services/eco.service";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyState";
import { FaAward, FaCoins, FaCheckCircle } from "react-icons/fa";

export default function EcoBadgesPage() {
  const { user } = useAuth();
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBadges() {
      try {
        setLoading(true);
        const res = await ecoService.getUserBadges();
        if (isMounted && res) {
          setBadgeData(res);
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBadges();
    return () => {
      isMounted = false;
    };
  }, []);

  const userPoints = badgeData?.ecoBalance ?? user?.ecoBalance ?? 0;
  const currentLevel = badgeData?.currentLevel || {
    name: "Green Starter",
    min: 0,
    max: 500,
    color: "#16A34A",
  };
  const nextLevel = badgeData?.nextLevel;

  const progressPercent = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((userPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
        )
      )
    : 100;

  const badges = badgeData?.badges || [];

  return (
    <div className="eco-vip-page">
      <div className="vip-header-card">
        <div className="vip-icon-banner" aria-hidden="true">
          <FaAward />
        </div>
        <h1 className="vip-title">Eco Rank & Achievements</h1>
        <p className="vip-desc">
          Current Level: <strong className="rank-name-highlight">{currentLevel.name}</strong>
        </p>

        {/* Progress Bar Container */}
        <div className="progress-container">
          <div className="level-labels">
            <span>{currentLevel.name} ({currentLevel.min} pts)</span>
            <span>{nextLevel ? `${nextLevel.name} (${nextLevel.min} pts)` : "Maximum Level Reach!"}</span>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin="0" aria-valuemax="100">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="points-info-row">
            <span className="points-info">
              <FaCoins className="coin-mini" aria-hidden="true" /> {userPoints.toLocaleString()} / {nextLevel ? nextLevel.min.toLocaleString() : "10,000"} pts
            </span>
            <span className="progress-pct-text">{Math.round(progressPercent)}% to next level</span>
          </div>
        </div>
      </div>

      {loading && <LoadingSkeleton count={4} height="160px" type="card" />}

      {/* Badge Section */}
      {!loading && (
        <section className="vip-badges-section" aria-label="Eco badges">
          <div className="badges-section-header">
            <h2 className="section-title">Your Recycling Badges</h2>
            <span className="badges-count-tag">
              {badges.filter((b) => b.earned).length} of {badges.length} Unlocked
            </span>
          </div>

          {badges.length === 0 ? (
            <EmptyState
              icon={<FaAward />}
              title="No badges available"
              description="Complete waste declarations to unlock badges."
            />
          ) : (
            <div className="vip-badges-grid">
              {badges.map((badge) => (
                <EcoBadges
                  key={badge.id}
                  badgeName={badge.badgeName}
                  description={badge.description}
                  imgSrc={
                    badge.category === "food"
                      ? "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=60"
                      : badge.category === "plastic"
                      ? "https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=120&auto=format&fit=crop&q=60"
                      : badge.category === "clothes"
                      ? "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=120&auto=format&fit=crop&q=60"
                      : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=60"
                  }
                  earned={badge.earned}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
