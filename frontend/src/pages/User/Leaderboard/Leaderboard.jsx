import React, { useState, useEffect } from "react";
import "./Leaderboard.css";

export default function DynamicLeaderboard({ users }) {
  const [sortedUsers, setSortedUsers] = useState([]);

  useEffect(() => {
    // ترتيب المستخدمين حسب النقاط تنازلياً
    const sorted = [...users].sort((a, b) => b.points - a.points);
    setSortedUsers(sorted);
  }, [users]);

  return (
    <div className="leaderboard-wrapper">
      <h2>Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, idx) => (
            <tr
              key={user.id}
              className={`rank-row ${idx === 0 ? "top-rank" : ""}`}
              style={{ transition: "all 0.5s ease" }}
            >
              <td>{idx + 1}</td>
              <td>{user.name}</td>
              <td>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
