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

  const getBorderClass = (severity) => {
    if (!severity) return "border-blue";
    switch (severity.toLowerCase()) {
      case "high":
        return "border-red";
      case "moderate":
        return "border-yellow";
      case "low":
        return "border-green";
      default:
        return "border-blue";
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/reports");
        console.log("Fetched reports:", response.data);
        if (response.data && Array.isArray(response.data)) {
          setReports(response.data);
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

    fetchReports();
  }, []);

  const severityLevels = { High: 3, Moderate: 2, Low: 1, null: 0 };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortType === "newest") return new Date(b.dateTime) - new Date(a.dateTime);
    if (sortType === "oldest") return new Date(a.dateTime) - new Date(b.dateTime);
    if (sortType === "severity") return severityLevels[b.severity] - severityLevels[a.severity];
  });

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">SafeStreet</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/" onClick={() => localStorage.removeItem("token")}>Log Out</Link>
        </div>
      </nav>

      <h1 className="dashboard-title">Road Damage Reports</h1>

      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="severity">Severity (High to Low)</option>
        </select>
      </div>

      {loading && <p className="loading-text">Loading reports...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="reports-grid">
        {sortedReports.length > 0 ? (
          sortedReports.map((report) => (
            <div
              key={report._id}
              className={`report-card ${getBorderClass(report.severity)}`}
              onClick={() => navigate(`/report/${report._id}`)}
            >
              <div className="report-image-container">
                <img src={report.imageUrl} alt="Damage" className="report-image" />
              </div>
              <div className="report-info">
                <div className="report-date">{new Date(report.dateTime).toLocaleString()}</div>
                <div className={`report-severity ${report.severity ? report.severity.toLowerCase() : ""}`}>
                  {report.severity ? report.severity.toUpperCase() : "UNKNOWN"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-reports-text">No reports found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
