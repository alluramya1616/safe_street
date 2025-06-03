// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./ReportDetails.css";

// const ReportDetails = () => {
//   const { id } = useParams();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [successMsg, setSuccessMsg] = useState("");

//   // Fetch report details
//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8000/api/reports/${id}`);
//         console.log("Fetched report:", response.data); // Debug log
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

//   // Clear success message after 3 seconds
//   useEffect(() => {
//     if (successMsg) {
//       const timer = setTimeout(() => setSuccessMsg(""), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMsg]);

//   // Check if report is resolved
//   const isResolved = report && report.status && report.status.trim().toLowerCase() === "resolved";

//   // Handle mark as resolved button click
//   const handleMarkResolved = async () => {
//     if (isResolved) {
//       alert("The report has already been resolved.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       await axios.patch(`http://localhost:8000/api/reports/${id}/status`, { status: "Resolved" });
//       setReport((prev) => ({ ...prev, status: "Resolved" }));
//       setSuccessMsg("Report marked as resolved.");
//     } catch (err) {
//       console.error("Error updating status:", err);
//       setError("Failed to update status.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <p>Loading report details...</p>;
//   if (error) return <p className="error-text">{error}</p>;
//   if (!report) return <p>No report data found.</p>;

//   return (
//     <div className="report-details-page">
//       <div className="report-details-container">
//         <div className="images-container">
//           <div className="image-wrapper">
//             <h3>Original Image</h3>
//             <img
//               src={report.imageUrl || "/default-image.png"}
//               alt="Original Damage"
//               className="report-image"
//             />
//           </div>
//         </div>

//         <p><strong>Date:</strong> {new Date(report.dateTime).toLocaleString()}</p>
//         <p><strong>Severity:</strong> {report.severity || "Unknown"}</p>
//         <p><strong>Type of Damage:</strong> {report.typeOfDamage ? report.typeOfDamage.join(", ") : "Not specified"}</p>
//         <p><strong>📍 Location:</strong>
//           <a
//             href={`https://www.google.com/maps?q=${report.location[0]},${report.location[1]}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="location-link"
//           >
//             {`Lat: ${report.location[0]}, Long: ${report.location[1]}`}
//           </a>
//         </p>
//         <p><strong>Recommended Action:</strong> {report.recommendedAction || "No action recommended"}</p>

//         <div className="status-update-section">
//           <button onClick={handleMarkResolved} disabled={submitting}>
//             {submitting
//               ? "Marking as Resolved..."
//               : isResolved
//                 ? "Resolved"
//                 : "Mark as Resolved"}
//           </button>
//           {successMsg && <p className="success-text">{successMsg}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportDetails;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ReportDetails.css";

// Modal component
const Modal = ({ children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>✖</button>
      {children}
    </div>
  </div>
);

// Badge component
const Badge = ({ text, type }) => {
  const classMap = {
    severity: {
      Low: "severity-low",
      Medium: "severity-medium",
      High: "severity-high",
    },
    status: {
      Resolved: "status-resolved",
      Pending: "status-pending",
    },
    damage: "damage-badge",
  };

  const className =
    type === "damage"
      ? classMap.damage
      : classMap[type][text] || `${type}-badge`;

  return <span className={`badge ${className}`}>{text}</span>;
};

// Icons (Unicode)
const icons = {
  calendar: "📅",
  location: "📍",
  severity: "⚠",
  damage: "🛠",
  action: "📝",
  status: "✅",
};

const ReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [modalImage, setModalImage] = useState(null);

  // Fix leaflet icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/reports/${id}`);
        setReport(res.data);
      } catch {
        setError("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const isResolved = report?.status?.toLowerCase().trim() === "resolved";

  const handleMarkResolved = async () => {
    if (isResolved) return alert("Report already resolved.");
    try {
      setSubmitting(true);
      await axios.patch(`http://localhost:8000/api/reports/${id}/status`, {
        status: "Resolved",
      });
      setReport(prev => ({ ...prev, status: "Resolved" }));
      setSuccessMsg("Marked as resolved!");
    } catch {
      setError("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const openModalWithImage = (src) => setModalImage(src);
  const closeModal = () => setModalImage(null);

  if (loading) return <p>Loading report details...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!report) return <p>No report data found.</p>;

  return (
    <div className="report-details-page">
      <div className="report-details-container">
        {/* Images */}
        <section className="section images-section">
          <h2 className="section-title">Report Details</h2>
          <div className="images-container">
            <div className="image-wrapper">
              <h3>Original Image</h3>
              <img
                src={report.imageUrl || "/default-image.png"}
                alt="Original"
                className="report-image clickable"
                onClick={() => openModalWithImage(report.imageUrl || "/default-image.png")}
              />
            </div>
            {report.image && (
              <div className="image-wrapper">
                <h3>Annotated Image</h3>
                <img
                  src={`data:image/jpeg;base64,${report.image}`}
                  alt="Annotated"
                  className="report-image clickable"
                  onClick={() => openModalWithImage(`data:image/jpeg;base64,${report.image}`)}
                />
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <section className="section details-section">
          <p><strong>{icons.calendar} Date:</strong> {new Date(report.dateTime).toLocaleString()}</p>
          <p><strong>{icons.severity} Severity:</strong> {report.severity ? <Badge text={report.severity} type="severity" /> : "Unknown"}</p>
          <p><strong>{icons.damage} Type of Damage:</strong>{" "}
            {report.typeOfDamage?.length ? report.typeOfDamage.map((d, i) => (
              <Badge key={i} text={d} type="damage" />
            )) : "Not specified"}
          </p>
          <p><strong>{icons.location} Location:</strong>{" "}
            {report.location?.length === 2 ? (
              <a
                href={`https://www.google.com/maps?q=${report.location[0]},${report.location[1]}`}
                target="_blank"
                rel="noreferrer"
                className="location-link"
              >
                {`Lat: ${report.location[0]}, Long: ${report.location[1]}`}
              </a>
            ) : "Unknown"}
          </p>

          {/* Map */}
          {report.location?.length === 2 && (
            <div className="map-container">
              <MapContainer center={report.location} zoom={13} scrollWheelZoom={false}
                style={{ height: "250px", width: "100%", borderRadius: "8px" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={report.location}>
                  <Popup>Damage reported here.</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <p><strong>{icons.action} Recommended Action:</strong> {report.recommendedAction || "No action recommended"}</p>
          <p><strong>{icons.status} Status:</strong> <Badge text={report.status || "Unknown"} type="status" /></p>
        </section>

        {/* Status Update */}
        <section className="section status-update-section">
          <h2 className="section-title">Update Status</h2>
          <button onClick={handleMarkResolved} disabled={submitting}>
            {submitting ? "Marking..." : isResolved ? "Resolved" : "Mark as Resolved"}
          </button>
          {successMsg && <p className="success-text">{successMsg}</p>}
        </section>
      </div>

      {/* Modal for image preview */}
      {modalImage && (
        <Modal onClose={closeModal}>
          <img src={modalImage} alt="Zoomed view" className="modal-image" />
        </Modal>
      )}
    </div>
  );
};

export default ReportDetails;
