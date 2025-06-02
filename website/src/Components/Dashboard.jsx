// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Dashboard.css"; 

// const Dashboard = () => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortType, setSortType] = useState("newest");
//   const navigate = useNavigate();

//   const getBorderClass = (severity) => {
//     if (!severity) return "border-blue"; 
//     switch (severity.toLowerCase()) {
//       case "high":
//         return "border-red";
//       case "moderate":
//         return "border-yellow";
//       case "low":
//         return "border-green";
//       default:
//         return "border-blue";
//     }
//   };

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await axios.get("http://localhost:8000/api/reports");
//         console.log("Fetched reports:", response.data); 
//         if (response.data && Array.isArray(response.data)) {
//           setReports(response.data); 
//         } else {
//           throw new Error("Invalid response format");
//         }
//       } catch (error) {
//         console.error("Error fetching reports:", error);
//         setError("Failed to load reports.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   const severityLevels = { High: 3, Moderate: 2, Low: 1, null: 0 };

//   const sortedReports = [...reports].sort((a, b) => {
//     if (sortType === "newest") return new Date(b.dateTime) - new Date(a.dateTime);
//     if (sortType === "oldest") return new Date(a.dateTime) - new Date(b.dateTime);
//     if (sortType === "severity") return severityLevels[b.severity] - severityLevels[a.severity];
//   });

//   return (
//     <div className="dashboard-container">
//       <nav className="navbar">
//         <div className="logo">SafeStreet</div>
//         <div className="nav-links">
//           <Link to="/home">Home</Link>
//           <Link to="/dashboard">Dashboard</Link>
//           <Link to="/about">About</Link>
//           <Link to="/help">Help</Link>
//           <Link to="/" onClick={() => localStorage.removeItem("token")}>Log Out</Link>
//         </div>
//       </nav>

//       <h1 className="dashboard-title">Road Damage Reports</h1>

//       <div className="sort-options">
//         <label>Sort by: </label>
//         <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
//           <option value="newest">Newest First</option>
//           <option value="oldest">Oldest First</option>
//           <option value="severity">Severity (High to Low)</option>
//         </select>
//       </div>

//       {loading && <p className="loading-text">Loading reports...</p>}
//       {error && <p className="error-text">{error}</p>}

//       <div className="reports-grid">
//         {sortedReports.length > 0 ? (
//           sortedReports.map((report) => (
//             <div
//               key={report._id}
//               className={`report-card ${getBorderClass(report.severity)}`}
//               onClick={() => navigate(`/report/${report._id}`)}
//             >
//               <img src={report.imageUrl} alt="Damage" className="report-image" />
//               <div className="report-info">
//                 <div className="report-date">{new Date(report.dateTime).toLocaleString()}</div>
//                 <div className="report-severity">{report.severity ? report.severity.toUpperCase() : "UNKNOWN"}</div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="no-reports-text">No reports found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
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
      if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
        setError(null);
        // Debug logs - can remove later
        console.log("Reports fetched:", response.data);
        console.log("Resolved count:", response.data.filter(r => r.status === "Resolved").length);
        console.log("Pending count:", response.data.filter(r => r.status !== "Resolved").length);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const sortedReports = [...reports].sort((a, b) => {
    if (sortType === "newest") return new Date(b.dateTime) - new Date(a.dateTime);
    if (sortType === "oldest") return new Date(a.dateTime) - new Date(b.dateTime);
    if (sortType === "severity") return severityLevels[b.severity] - severityLevels[a.severity];
    return 0;
  });

  const totalReports = reports.length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const pending = reports.filter(r => r.status !== "Resolved").length;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">SafeStreet</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
          <Link to="/" onClick={() => localStorage.removeItem("token")}>Log Out</Link>
        </div>
      </nav>

      <h1 className="dashboard-title">Road Damage Reports Dashboard</h1>

      <div className="analysis-cards">
        <div className="card total">Total Reports: {totalReports}</div>
        <div className="card resolved">Resolved: {resolved}</div>
        <div className="card pending">Pending: {pending}</div>
      </div>

      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="severity">Severity (High to Low)</option>
        </select>
      </div>

      {/* Refresh button to reload reports */}
      <button onClick={fetchReports} disabled={loading} className="refresh-button">
        {loading ? "Loading..." : "Refresh Reports"}
      </button>

      {error && <p className="error-text">{error}</p>}

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
            {sortedReports.length > 0 ? (
              sortedReports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <img
                      src={report.imageUrl}
                      alt={`Damage Report ${report._id}`}
                      title="Click to view full image"
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
                <td colSpan="5" className="no-reports-text">No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
