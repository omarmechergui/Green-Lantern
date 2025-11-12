import React, { useState } from "react";
import "./Profile.css";
import { FaLeaf, FaRecycle, FaUser, FaEdit, FaTimes } from "react-icons/fa";
import RewardCard from "../../../components/RewardCard/RewardCard";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userPoints, setUserPoints] = useState(450);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Omar Mechergui");
  const [userEmail, setUserEmail] = useState("omar@example.com");

  // Badges Example
  const badges = [
    { name: "Plastic Hero", unlocked: true },
    { name: "Paper Saver", unlocked: false },
    { name: "Clothes Collector", unlocked: true },
  ];

  // History Example
  const history = [
    { type: "Plastic", weight: 2, points: 4, date: "2025-11-10" },
    { type: "Food", weight: 1.5, points: 1.2, date: "2025-11-09" },
    { type: "Clothes", weight: 3, points: 3.6, date: "2025-11-08" },
  ];

  const handleModalSave = () => {
    // هنا نقدر نضيف أي منطق لحفظ البيانات
    setIsModalOpen(false);
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar"><FaUser /></div>
          <div className="user-details">
            <h2>{userName}</h2>
            <p>GreenLantern Member</p>
          </div>
          <button className="btn-edit" onClick={() => setIsModalOpen(true)}>
            <FaEdit /> Edit Profile
          </button>
        </div>
        <div className="profile-kpis">
          <div className="kpi-card">
            <FaLeaf />
            <div>
              <span>1200 kg</span>
              <p>Total Waste Collected</p>
            </div>
          </div>
          <div className="kpi-card">
            <FaRecycle />
            <div>
              <span>{userPoints} pts</span>
              <p>Recycling Points</p>
            </div>
          </div>
          <div className="kpi-card">
            <FaLeaf />
            <div>
              <span>75</span>
              <p>Badges Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {["overview", "badges", "history", "settings"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <h3>Quick Stats</h3>
            <div className="progress-bars">
              <div className="progress-item">
                <span>Recycled Items</span>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: "75%" }} />
                </div>
              </div>
              <div className="progress-item">
                <span>Eco Points</span>
                <div className="progress-bg">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(userPoints / 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="badges-tab">
            {badges.map((b, idx) => (
              <div
                key={idx}
                className={`badge-card ${b.unlocked ? "unlocked" : "locked"}`}
              >
                {b.name}
                {b.unlocked && <span className="badge-check">✓</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="history-tab">
            {history.map((h, idx) => (
              <div key={idx} className="history-item">
                <span>{h.date}</span>
                <p>
                  {h.type} – {h.weight} kg – {h.points} pts
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-tab">
            <p>Settings will go here (notifications, password, profile info...)</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={`modal-overlay ${isModalOpen ? "show" : ""}`}>
  <div className="modal">
    <div className="modal-header">
      <h3>Edit Profile</h3>
      <button className="modal-close" onClick={() => setIsModalOpen(false)}>
        <FaTimes />
      </button>
    </div>
    <div className="modal-body">
      <label>
        Name:
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
      </label>
      <button className="btn-save" onClick={handleModalSave}>
        Save
      </button>
    </div>
  </div>
</div>

      )}
    </div>
  );
}
