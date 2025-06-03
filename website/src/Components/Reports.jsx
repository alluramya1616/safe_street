import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import { Link } from "react-router-dom";
import "./Reports.css";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("newest");
  const navigate = useNavigate();

  const severityLevels = { High: 3, Moderate: 2, Low: 1, null: 0 };

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

  const sortReports = (data) => {
    return [...data].sort((a, b) => {
      if (sortType === "newest") return new Date(b.dateTime) - new Date(a.dateTime);
      if (sortType === "oldest") return new Date(a.dateTime) - new Date(b.dateTime);
      if (sortType === "severity") return severityLevels[b.severity] - severityLevels[a.severity];
      return 0;
    });
  };

  const pendingReports = sortReports(reports.filter(r => r.status !== "Resolved"));
  const resolvedReports = sortReports(reports.filter(r => r.status === "Resolved"));

  return (
    <div className="reports-container">
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
      <h1 className="reports-title">Road Damage Reports</h1>

      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="severity">Severity (High to Low)</option>
        </select>
        <button onClick={fetchReports} disabled={loading} className="refresh-button">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Pending Reports */}
      <h2 className="section-title">⏳ Pending Reports</h2>
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Date & Time</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {pendingReports.length > 0 ? (
              pendingReports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <img
                      src={report.imageUrl}
                      alt={`Damage ${report._id}`}
                      className="thumbnail"
                    />
                  </td>
                  <td>{new Date(report.dateTime).toLocaleString()}</td>
                  <td className={`severity ${report.severity?.toLowerCase()}`}>
                    {report.severity?.toUpperCase() || "UNKNOWN"}
                  </td>
                  <td>{report.status || "Pending"}</td>
                  <td>
                    <button onClick={() => navigate(`/report/${report._id}`)}>View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-reports-text">No pending reports.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resolved Reports */}
      <h2 className="section-title">✅ Resolved Reports</h2>
      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Date & Time</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {resolvedReports.length > 0 ? (
              resolvedReports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <img
                      src={report.imageUrl}
                      alt={`Damage ${report._id}`}
                      className="thumbnail"
                    />
                  </td>
                  <td>{new Date(report.dateTime).toLocaleString()}</td>
                  <td className={`severity ${report.severity?.toLowerCase()}`}>
                    {report.severity?.toUpperCase() || "UNKNOWN"}
                  </td>
                  <td>{report.status}</td>
                  <td>
                    <button onClick={() => navigate(`/report/${report._id}`)}>View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-reports-text">No resolved reports.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
