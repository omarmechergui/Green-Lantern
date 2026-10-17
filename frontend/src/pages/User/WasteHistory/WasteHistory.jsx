import React, { useState, useEffect } from "react";
import "./WasteHistory.css";
import { motion } from "framer-motion";
import { FaTshirt, FaUtensils, FaFilter, FaHistory } from "react-icons/fa";
import { FaBottleWater } from "react-icons/fa6";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ecoService } from "../../../services/eco.service";
import StatusBadge from "../../../components/common/StatusBadge";
import EmptyState from "../../../components/common/EmptyState";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";

export default function WasteHistory() {
  const [filter, setFilter] = useState("all");
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ecoService.getUserDeclarations({ limit: 50 });
      setDeclarations(data?.declarations || []);
    } catch (err) {
      setError(err.message || "Failed to load waste history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getCategoryName = (decl) => decl.wasteCategory?.name || "General Waste";

  const filteredData =
    filter === "all"
      ? declarations
      : declarations.filter((item) => {
          const cat = getCategoryName(item).toLowerCase();
          const st = item.status?.toLowerCase();
          return cat === filter || st === filter;
        });

  // Calculate dynamic Pie chart data from real declarations
  const categoryCounts = {};
  declarations.forEach((d) => {
    const cat = getCategoryName(d);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + (d.delivery?.acceptedWeight ?? d.estimatedWeight);
  });

  const chartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: Math.round(categoryCounts[cat] * 10) / 10,
  }));

  const COLORS = ["#16A34A", "#15803D", "#34D399", "#059669", "#86EFAC"];

  const getIcon = (catName) => {
    const lower = catName.toLowerCase();
    if (lower.includes("food") || lower.includes("organic")) {
      return <FaUtensils className="waste-icon food" aria-label="Organic Food Waste" />;
    }
    if (lower.includes("plastic") || lower.includes("bottle")) {
      return <FaBottleWater className="waste-icon plastic" aria-label="Plastic Recyclable" />;
    }
    if (lower.includes("cloth") || lower.includes("textile")) {
      return <FaTshirt className="waste-icon clothes" aria-label="Textile Waste" />;
    }
    return <FaUtensils className="waste-icon general" aria-label="Waste Item" />;
  };

  return (
    <div className="waste-history-container">
      {/* Header */}
      <div className="waste-history-header">
        <div>
          <h2 className="history-title">Waste History</h2>
          <p className="history-subtitle">
            Review all your past and pending recyclable waste declarations.
          </p>
        </div>

        <div className="filter-wrapper">
          <FaFilter className="filter-icon" aria-hidden="true" />
          <label htmlFor="history-filter" className="sr-only">Filter Declarations</label>
          <select
            id="history-filter"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value.toLowerCase())}
            aria-label="Filter waste declarations by status or type"
          >
            <option value="all">All Declarations ({declarations.length})</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="plastic">Plastic</option>
            <option value="food">Food</option>
            <option value="clothes">Clothes</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSkeleton count={4} height="80px" type="list" />}

      {error && (
        <div className="history-error-card" role="alert">
          <p>{error}</p>
          <button type="button" className="retry-btn" onClick={fetchHistory}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && declarations.length === 0 && (
        <EmptyState
          icon={<FaHistory />}
          title="No waste declarations yet"
          description="Log your recyclable waste drop-off or pickup request to start earning Eco Coins."
          actionText="Declare Waste Now"
          actionLink="/declare"
        />
      )}

      {/* Chart Section */}
      {!loading && !error && chartData.length > 0 && (
        <div className="waste-chart-card">
          <h3 className="chart-heading">Recycled Waste by Category (kg)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={4}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#D1FAE5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(20, 83, 45, 0.08)",
                  color: "#14532D",
                  fontWeight: "600",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Waste Declarations List */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="waste-list" role="feed" aria-label="Waste declarations list">
          {filteredData.map((decl) => {
            const categoryName = getCategoryName(decl);
            const weight = decl.delivery?.acceptedWeight ?? decl.estimatedWeight;
            const points =
              decl.delivery?.transactions?.find((t) => t.type === "EARNED")?.amount ||
              (decl.status === "APPROVED"
                ? Math.round(weight * (decl.wasteCategory?.pointsPerKg || 10))
                : 0);

            const dateStr = decl.createdAt
              ? new Date(decl.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            return (
              <motion.article
                key={decl.id}
                className="waste-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                aria-label={`Declaration of ${weight} kg of ${categoryName}, status ${decl.status}`}
              >
                <div className="waste-left">
                  <div className="waste-icon-wrap" aria-hidden="true">
                    {getIcon(categoryName)}
                  </div>
                  <div className="waste-details">
                    <h4 className="waste-category-title">{categoryName}</h4>
                    <p className="waste-meta">
                      <strong>{weight} kg</strong> • {decl.deliveryMethod === "PICKUP" ? "Pickup" : "Drop-off"}
                    </p>
                    <div className="waste-status-row">
                      <StatusBadge status={decl.status} />
                    </div>
                  </div>
                </div>

                <div className="waste-right">
                  <span className={`waste-points-badge ${decl.status === "APPROVED" ? "approved" : "pending"}`}>
                    {decl.status === "APPROVED" ? `+${points} pts` : "Pending pts"}
                  </span>
                  <time className="waste-date" dateTime={decl.createdAt || ""}>
                    {dateStr}
                  </time>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {!loading && !error && declarations.length > 0 && filteredData.length === 0 && (
        <EmptyState
          icon={<FaFilter />}
          title="No declarations match the filter"
          description={`There are no declarations matching "${filter}". Try selecting a different filter option.`}
          actionText="Show All Declarations"
          onAction={() => setFilter("all")}
        />
      )}
    </div>
  );
}
