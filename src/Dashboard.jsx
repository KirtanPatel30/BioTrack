

/*
This is our Dashboard. It automatically loads the full dataset from FastAPI and converts it into two clean visual charts.

The first bar chart shows conservation status distribution — which animals are Least Concern, Vulnerable, Endangered, etc.
The pie chart shows habitat distribution — how many animals live in forests, oceans, grasslands, and so on.

This helps users instantly understand biodiversity patterns instead of reading a long dataset.
*/




import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [statusData, setStatusData] = useState([]);
  const [habitatData, setHabitatData] = useState([]);
// when the dashboard loads it will fetch all the animals form the API 
  useEffect(() => {
    fetch(`${API_BASE}/animals`)
      .then((res) => res.json())
      .then((data) => buildCharts(data))
      .catch((err) => console.error("Error loading animals:", err));
  }, []);
// groups the Animals based on differnt things 
  const buildCharts = (data) => {
    // Group by Conservation Status
    const statusCounts = {};
    data.forEach((a) => {
      const status = a["Conservation Status"] || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const formattedStatus = Object.entries(statusCounts).map(([k, v]) => ({
      name: k,
      count: v,
    }));
    setStatusData(formattedStatus);

    // Group by Habitat
    const habitatCounts = {};
    data.forEach((a) => {
      const habitat = a["Habitat"] || "Unknown";
      habitatCounts[habitat] = (habitatCounts[habitat] || 0) + 1;
    });

    const sortedHabitat = Object.entries(habitatCounts)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // top 10 habitats for clarity

    setHabitatData(sortedHabitat);
  };

  const COLORS = [
    "#1565c0",
    "#2e7d32",
    "#ef6c00",
    "#6a1b9a",
    "#00838f",
    "#c62828",
    "#0288d1",
    "#43a047",
    "#f9a825",
    "#8e24aa",
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        minHeight: "100vh",
        padding: "2rem 3rem",
        fontFamily: "Segoe UI, Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        <h1
          style={{
            color: "#0a4785",
            fontWeight: 800,
            fontSize: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          📊 Animal Data Dashboard
        </h1>
        <p style={{ color: "#444", fontSize: "1.05rem" }}>
          A visual overview of animal conservation and habitat distribution.
        </p>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "stretch",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Bar Chart Card */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.8rem",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              color: "#1565c0",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Number of Animals by Conservation Status
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1565c0" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Card (clean version) */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.8rem",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              color: "#1565c0",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Top 10 Habitats by Number of Animals
          </h3>

          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={habitatData}
                dataKey="value"
                nameKey="name"
                outerRadius={130}
                labelLine={false}
                // Show only percentages inside slices for clarity
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {habitatData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  fontSize: "0.9rem",
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          marginTop: "2.5rem",
          color: "#555",
          fontSize: "0.9rem",
        }}
      >
        🌍 BioTrack Dashboard — Empowering wildlife awareness through data
        visualization.
      </p>
    </div>
  );
}
