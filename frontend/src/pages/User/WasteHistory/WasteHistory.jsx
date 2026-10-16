import React, { useState } from "react";
import "./WasteHistory.css";
import { motion } from "framer-motion";
import { FaTshirt, FaUtensils } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaBottleWater } from "react-icons/fa6";

export default function WasteHistory() {
  const [filter, setFilter] = useState("all");

  const wasteData = [
    { id: 1, type: "Food", amount: "3 kg", date: "2025-11-08", points: 25 },
    { id: 2, type: "Plastic", amount: "2.2 kg", date: "2025-11-09", points: 15 },
    { id: 3, type: "Clothes", amount: "1.5 kg", date: "2025-11-10", points: 30 },
    { id: 4, type: "Food", amount: "4 kg", date: "2025-11-11", points: 20 },
  ];

  const filteredData =
    filter === "all"
      ? wasteData
      : wasteData.filter((item) => item.type.toLowerCase() === filter);

  // Pie chart data
  const chartData = [
    { name: "Food", value: 7 },
    { name: "Plastic", value: 2.2 },
    { name: "Clothes", value: 1.5 },
  ];

  const COLORS = ["#f97316", "#3b82f6", "#a855f7"];

  const getIcon = (type) => {
    switch (type) {
      case "Food":
        return <FaUtensils className="waste-icon food" />;
      case "Plastic":
        return <FaBottleWater className="waste-icon plastic" />;
      case "Clothes":
        return <FaTshirt className="waste-icon clothes" />;
      default:
        return <FaUtensils className="waste-icon" />;
    }
  };

  return (
    <div className="waste-history">
      {/* Header */}
      <div className="waste-history-header">
        <h2>Waste History</h2>
        <select
          className="filter-select"
          onChange={(e) => setFilter(e.target.value.toLowerCase())}
        >
          <option value="all">All</option>
          <option value="food">Food</option>
          <option value="plastic">Plastic</option>
          <option value="clothes">Clothes</option>
        </select>
      </div>

      {/* Chart */}
      <div className="waste-chart">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Waste List */}
      <div className="waste-list">
        {filteredData.map((waste) => (
          <motion.div
            key={waste.id}
            className="waste-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="waste-left">
              {getIcon(waste.type)}
              <div>
                <h3>{waste.type}</h3>
                <p>{waste.amount}</p>
              </div>
            </div>
            <div className="waste-right">
              <span className="waste-points">+{waste.points} pts</span>
              <small>{waste.date}</small>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
