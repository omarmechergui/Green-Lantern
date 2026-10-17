import React, { useState, useEffect } from "react";
import "./Profile.css";
import { FaLeaf, FaRecycle, FaUser, FaEdit, FaTimes, FaTrophy, FaCalendarAlt, FaCheck, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { ecoService } from "../../../services/eco.service";
import StatusBadge from "../../../components/common/StatusBadge";
import EmptyState from "../../../components/common/EmptyState";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";

export default function Profile() {
  const { user: authUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [badgesData, setBadgesData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const [profRes, declRes, badgesRes] = await Promise.allSettled([
          ecoService.getProfile(),
          ecoService.getUserDeclarations({ limit: 10 }),
          ecoService.getUserBadges(),
        ]);

        if (isMounted) {
          if (profRes.status === "fulfilled" && profRes.value) {
            setProfileData(profRes.value);
            setFullName(profRes.value.user?.fullName || "");
            setPhone(profRes.value.user?.phone || "");
            setAvatar(profRes.value.user?.avatar || "");
          } else if (authUser) {
            setFullName(authUser.fullName || "");
            setPhone(authUser.phone || "");
          }

          if (declRes.status === "fulfilled" && declRes.value) {
            setDeclarations(declRes.value.declarations || []);
          }

          if (badgesRes.status === "fulfilled" && badgesRes.value) {
            setBadgesData(badgesRes.value.badges || []);
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const currentUser = profileData?.user || authUser;
  const stats = profileData?.stats || {
    totalDeclarations: declarations.length,
    approvedDeclarations: declarations.filter((d) => d.status === "APPROVED").length,
    totalVerifiedWeightKg: declarations.reduce(
      (sum, d) => (d.status === "APPROVED" ? sum + (d.delivery?.acceptedWeight ?? d.estimatedWeight) : sum),
      0
    ),
    totalRedemptions: 0,
    ecoBalance: currentUser?.ecoBalance ?? 0,
  };

  const earnedBadgesCount = badgesData.filter((b) => b.earned).length;

  const handleModalSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload = { fullName };
      if (phone !== undefined) payload.phone = phone || null;
      if (avatar !== undefined) payload.avatar = avatar || null;

      const updated = await ecoService.updateProfile(payload);
      if (updated?.user) {
        setProfileData((prev) => ({
          ...prev,
          user: updated.user,
        }));
        setSuccessMsg("Profile updated successfully!");
        if (refreshUser) refreshUser();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <LoadingSkeleton count={3} height="120px" type="card" />
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* Header Profile Identity Card */}
      <div className="profile-identity-card">
        <div className="profile-identity-main">
          <div className="avatar-wrapper">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName || "Avatar"}
                className="avatar-img"
              />
            ) : (
              <div className="avatar-fallback" aria-hidden="true">
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <FaUser />}
              </div>
            )}
          </div>

          <div className="profile-identity-details">
            <h2 className="profile-name-text">{currentUser?.fullName || "Green Lantern Recycler"}</h2>
            <p className="profile-role-text">
              {currentUser?.email} • <span className="profile-role-tag">{currentUser?.role || "CITIZEN"}</span>
            </p>
            {currentUser?.phone && (
              <p className="profile-contact-text">📞 {currentUser.phone}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn-edit-profile"
          onClick={() => setIsModalOpen(true)}
          aria-label="Edit Profile Details"
        >
          <FaEdit aria-hidden="true" /> Edit Profile
        </button>
      </div>

      {/* Profile KPI Cards */}
      <div className="profile-stat-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-icon-wrap" style={{ background: "#DCFCE7", color: "#16A34A" }} aria-hidden="true">
            <FaLeaf />
          </div>
          <div>
            <span className="profile-stat-value">{stats.totalVerifiedWeightKg} kg</span>
            <p className="profile-stat-label">Verified Recycled</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon-wrap" style={{ background: "#DCFCE7", color: "#15803D" }} aria-hidden="true">
            <FaRecycle />
          </div>
          <div>
            <span className="profile-stat-value">{stats.ecoBalance} pts</span>
            <p className="profile-stat-label">Eco Coins Balance</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon-wrap" style={{ background: "#FEF3C7", color: "#D97706" }} aria-hidden="true">
            <FaTrophy />
          </div>
          <div>
            <span className="profile-stat-value">{earnedBadgesCount} / {badgesData.length || 4}</span>
            <p className="profile-stat-label">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs" role="tablist" aria-label="Profile Sections">
        {["overview", "badges", "history"].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`profile-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-tab-panel" role="tabpanel">
        {activeTab === "overview" && (
          <div className="profile-overview-tab">
            <h3 className="section-title">Milestones & Verification Rate</h3>
            <div className="milestone-track-list">
              <div className="milestone-item">
                <div className="milestone-label-row">
                  <span>Verified Declarations Ratio</span>
                  <strong>{stats.approvedDeclarations} of {stats.totalDeclarations || 1} approved</strong>
                </div>
                <div className="milestone-progress-track">
                  <div
                    className="milestone-progress-fill"
                    style={{
                      width: `${Math.min(
                        ((stats.approvedDeclarations || 0) / Math.max(stats.totalDeclarations, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="milestone-item">
                <div className="milestone-label-row">
                  <span>Eco Coins Starter Goal</span>
                  <strong>{stats.ecoBalance} / 1,000 pts</strong>
                </div>
                <div className="milestone-progress-track">
                  <div
                    className="milestone-progress-fill"
                    style={{ width: `${Math.min((stats.ecoBalance / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="profile-badges-tab">
            <h3 className="section-title">Earned Achievements</h3>
            {badgesData.length === 0 ? (
              <EmptyState
                icon={<FaTrophy />}
                title="No badges to display"
                description="Keep recycling to unlock platform badges and level up your Eco Citizen rank."
              />
            ) : (
              <div className="profile-badges-grid">
                {badgesData.map((badge) => (
                  <div key={badge.id} className={`profile-badge-card ${badge.earned ? "unlocked" : "locked"}`}>
                    <div className="badge-card-icon" aria-hidden="true">
                      {badge.earned ? <FaCheck /> : <FaTrophy />}
                    </div>
                    <div className="badge-card-info">
                      <h4>{badge.badgeName}</h4>
                      <p>{badge.description}</p>
                      <span className="badge-tag">
                        {badge.earned ? "Unlocked" : "In Progress"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="profile-history-tab">
            <h3 className="section-title">Recent Submissions</h3>
            {declarations.length === 0 ? (
              <EmptyState
                icon={<FaCalendarAlt />}
                title="No recent history"
                description="You haven't submitted any waste declarations yet."
                actionText="Declare Waste"
                actionLink="/declare"
              />
            ) : (
              <div className="profile-history-list">
                {declarations.slice(0, 5).map((decl) => (
                  <div key={decl.id} className="profile-history-row">
                    <div>
                      <strong>{decl.wasteCategory?.name || "General Waste"}</strong>
                      <span className="profile-history-meta">
                        {decl.delivery?.acceptedWeight ?? decl.estimatedWeight} kg • {decl.deliveryMethod}
                      </span>
                    </div>
                    <StatusBadge status={decl.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="modal-overlay show" onClick={() => setIsModalOpen(false)}>
          <div
            className="profile-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="modal-header">
              <h3 id="edit-profile-title">Edit Profile</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="modal-form">
              {errorMsg && (
                <div className="modal-error-alert" role="alert">
                  <FaExclamationCircle /> {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="modal-success-alert" role="alert">
                  <FaCheck /> {successMsg}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-fullName">Full Name</label>
                <input
                  id="edit-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-phone">Phone Number (Optional)</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="modal-input"
                  placeholder="+1234567890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-avatar">Avatar Image URL (Optional)</label>
                <input
                  id="edit-avatar"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="modal-input"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
