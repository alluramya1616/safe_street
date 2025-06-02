// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./ReportDetails.css"; // Add CSS for styling

// const ReportDetails = () => {
//   const { id } = useParams(); // Get _id from URL
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         console.log("Fetching report with ID:", id); // Debugging
//         const response = await axios.get(`http://localhost:8000/api/reports/${id}`);
//         setReport(response.data);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//         setError("Failed to load report details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReport();
//   }, [id]);

//   if (loading) return <p>Loading report details...</p>;
//   if (error) return <p className="error-text">{error}</p>;

//   const openGoogleMaps = () => {
//     if (report.location && report.latitude && report.longitude) {
//       const locationUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
//       window.open(locationUrl, "_blank");
//     }
//   };

//   return (
//     <div className="report-details-page">  {/* Unique class for styling */}
//       <div className="report-details-container">
//         <div className="images-container">
//           {/* Display Original Image */}
//           <div className="image-wrapper">
//             <h3>Original Image</h3>
//             <img
//               src={report.imageUrl || "/default-image.png"}
//               alt="Original Damage"
//               className="report-image"
//             />
//           </div>

//           {/* Display Image with Bounding Boxes */}
//           <div className="image-wrapper">
//             <h3>Image with Bounding Boxes</h3>
//             <img
//               src={report.imageWithBoundingBoxes || "/default-image.png"}
//               alt="Damage with Bounding Boxes"
//               className="report-image"
//             />
//           </div>
//         </div>

//         {/* Report Details */}
//         <p><strong>Date:</strong> {new Date(report.dateTime).toLocaleString()}</p>
//         <p><strong>Severity:</strong> {report.severity || "Unknown"}</p>
//         <p><strong>Type of Damage:</strong> {report.typeOfDamage || "Not specified"}</p>
//         <p><strong>📍 Location:</strong>
//           <span className="location-link" onClick={openGoogleMaps}>
//             {report.location || "Not specified"}
//           </span>
//         </p>
//         <p><strong>Recommended Action:</strong> {report.recommendedAction || "No action recommended"}</p>
//       </div>
//     </div>
//   );
// };

// export default ReportDetails;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/reports/${id}`);
        console.log("Fetched report:", response.data); // Debug log
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Check if report is resolved
  const isResolved = report && report.status && report.status.trim().toLowerCase() === "resolved";

  // Handle mark as resolved button click
  const handleMarkResolved = async () => {
    if (isResolved) {
      alert("The report has already been resolved.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.patch(`http://localhost:8000/api/reports/${id}/status`, { status: "Resolved" });
      setReport((prev) => ({ ...prev, status: "Resolved" }));
      setSuccessMsg("Report marked as resolved.");
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading report details...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!report) return <p>No report data found.</p>;

  return (
    <div className="report-details-page">
      <div className="report-details-container">
        <div className="images-container">
          <div className="image-wrapper">
            <h3>Original Image</h3>
            <img
              src={report.imageUrl || "/default-image.png"}
              alt="Original Damage"
              className="report-image"
            />
          </div>
        </div>

        <p><strong>Date:</strong> {new Date(report.dateTime).toLocaleString()}</p>
        <p><strong>Severity:</strong> {report.severity || "Unknown"}</p>
        <p><strong>Type of Damage:</strong> {report.typeOfDamage ? report.typeOfDamage.join(", ") : "Not specified"}</p>
        <p><strong>📍 Location:</strong>
          <a
            href={`https://www.google.com/maps?q=${report.location[0]},${report.location[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="location-link"
          >
            {`Lat: ${report.location[0]}, Long: ${report.location[1]}`}
          </a>
        </p>
        <p><strong>Recommended Action:</strong> {report.recommendedAction || "No action recommended"}</p>

        <div className="status-update-section">
          <button onClick={handleMarkResolved} disabled={submitting}>
            {submitting
              ? "Marking as Resolved..."
              : isResolved
                ? "Resolved"
                : "Mark as Resolved"}
          </button>
          {successMsg && <p className="success-text">{successMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
