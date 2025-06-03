import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/reports");
      if (Array.isArray(response.data)) {
        setReports(response.data);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalReports = reports.length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const pending = totalReports - resolved;

  const severityCount = { Severe: 0, Medium: 0, Low: 0, Unknown: 0 };

  reports.forEach((r) => {
    const severity = r.severity || "Unknown";
    severityCount[severity] = (severityCount[severity] || 0) + 1;
  });

  const pieData = Object.keys(severityCount).map((key) => ({
    name: key,
    value: severityCount[key],
  }));

  const barData = [
    { severity: "Severe", count: severityCount["Severe"] },
    { severity: "Medium", count: severityCount["Medium"] },
    { severity: "Low", count: severityCount["Low"] },
    { severity: "Unknown", count: severityCount["Unknown"] },
  ];

  const COLORS = ["#FF4C4C", "#FFA500", "#00BFFF", "#AAAAAA"];

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">SafeStreet</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/about">About</Link>
          <Link to="/" onClick={() => localStorage.removeItem("token")}>
            Log Out
          </Link>
        </div>
      </nav>

      <h1 className="dashboard-title">Road Damage Reports Dashboard</h1>

      <div className="analysis-cards">
        <div className="card total">Total Reports: {totalReports}</div>
        <div className="card resolved">Resolved: {resolved}</div>
        <div className="card pending">Pending: {pending}</div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="charts-container">
          <div className="chart-section">
            <h3>Severity Report Counts (Bar)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>Severity Distribution (Pie)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
