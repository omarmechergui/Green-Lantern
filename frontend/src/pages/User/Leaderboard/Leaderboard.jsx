import React, { useState, useEffect } from "react";
import "./Leaderboard.css";
import { ecoService } from "../../../services/eco.service";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyState";
import { FaTrophy, FaCoins } from "react-icons/fa";

export default function DynamicLeaderboard({ users: initialUsers }) {
  const [leaderboard, setLeaderboard] = useState(initialUsers || []);
  const [loading, setLoading] = useState(!initialUsers);

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setLeaderboard(initialUsers);
      return;
    }

    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await ecoService.getLeaderboard(20);
        if (isMounted) {
          setLeaderboard(data || []);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [initialUsers]);

  const getRankClass = (rank) => {
    if (rank === 1) return "top-rank-1";
    if (rank === 2) return "top-rank-2";
    if (rank === 3) return "top-rank-3";
    return "";
  };

  return (
    <div className="leaderboard-wrapper" role="region" aria-label="Eco Leaderboard">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">Community Eco Leaderboard</h2>
        <p className="leaderboard-subtitle">
          Recognizing the top recyclers in the Green Lantern community.
        </p>
      </div>

      {loading && <LoadingSkeleton count={5} height="50px" type="list" />}

      {!loading && leaderboard.length === 0 && (
        <EmptyState
          icon={<FaTrophy />}
          title="No contributors recorded yet"
          description="Log and verify your recycling deposits to claim the top spot on the leaderboard."
        />
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="table-responsive-wrapper">
          <table className="leaderboard-table" aria-label="Community recycling rankings">
            <thead>
              <tr>
                <th scope="col" style={{ width: "80px" }}>Rank</th>
                <th scope="col">Contributor</th>
                <th scope="col" style={{ textAlign: "right" }}>Eco Coins</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => {
                const rankNum = user.rank || idx + 1;
                return (
                  <tr
                    key={user.id || idx}
                    className={`rank-row ${user.isCurrentUser ? "current-user-row" : ""}`}
                  >
                    <td>
                      <span className={`rank-badge ${getRankClass(rankNum)}`}>
                        {rankNum}
                      </span>
                    </td>
                    <td>
                      <strong>{user.name}</strong>
                      {user.isCurrentUser && (
                        <span className="current-user-tag">
                          You
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="coins-cell" style={{ justifyContent: "flex-end" }}>
                        <FaCoins style={{ color: "#eab308" }} aria-hidden="true" />
                        {user.points?.toLocaleString() ?? 0} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
