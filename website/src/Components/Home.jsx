// import React from "react";
// import { Link } from "react-router-dom";
// import "./Home.css"; // Import the CSS file
// import websiteImg from "../images/website.jpg";


// const HomePage = () => {
//   return (
//     <div className="home-container">
//       {/* Navbar */}
//       <nav className="navbar">
//         <div className="logo">SafeStreet</div>
//         <div className="nav-links">
//           <Link to="/home">Home</Link>
//           <Link to="/dashboard">Dashboard</Link>
//           <Link to="/about">About Us</Link>
//           <Link to="/help">Help</Link>
//           <Link to="/" onClick={() => localStorage.removeItem("token")}>Log Out</Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <header className="hero-section">
//         <h1>Smart Road Maintenance for Safer Cities</h1>
//         <p>AI-powered detection and reporting system for road authorities.</p>
//         <Link to="/dashboard" className="cta-button">Access Dashboard</Link>
//       </header>

//       {/* Key Benefits Section */}
//       <section className="benefits-section">
//         <div className="benefit">
//           <h2>Real-Time Road Monitoring</h2>
//           <p>Track road conditions instantly with AI-driven analysis.</p>
//         </div>
//         <div className="benefit">
//           <h2>Data-Driven Decision Making</h2>
//           <p>Prioritize repairs based on severity and impact.</p>
//         </div>
//         <div className="benefit">
//           <h2>Automated Reporting</h2>
//           <p>Receive real-time alerts and actionable insights.</p>
//         </div>
//       </section>
//             <section className="image-section">
//         <div className="image-container">
//           {/* Larger Image */}
//           <img src={websiteImg} alt="Road Monitoring Example" className="benefit-image" />
          
//           {/* Arrow from pothole to analysis box */}
//           <div className="arrow"></div>

//           {/* Blinking Analysis Box */}
//           <div className="analysis-box">
//             <p><strong>Type:</strong> Pothole with surrounding cracks</p>
//             <p><strong>Severity:</strong> High (visible depth and water retention)</p>
//             <p><strong>Risks:</strong> Vehicle damage (tires, suspension), road safety hazard</p>
//             <p><strong>Cause:</strong> Water seepage, freeze-thaw cycles, heavy traffic</p>
//             <p><strong>Recommended Action:</strong> Immediate patching, long-term resurfacing, improved drainage</p>
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="how-it-works">
//         <h2>How SafeStreet Works</h2>
//         <ul>
//           <li><strong>1. Capture & Upload:</strong> Field teams report road damage via the mobile app.</li>
//           <li><strong>2. AI Analysis:</strong> ViT model classifies damage severity.</li>
//           <li><strong>3. Automated Reporting:</strong> Reports sent to road authorities.</li>
//           <li><strong>4. Dashboard Insights:</strong> Monitor, plan, and manage repairs.</li>
//         </ul>
//       </section>
//     </div>
//   );
// };

// export default HomePage; 
// import React from "react";
// import { Link } from "react-router-dom";
// import "./Home.css"; // Import the CSS file
// import websiteImg from "../images/website.jpg";
// import video from "../images/robot.jpg"
// const HomePage = () => {
//   return (
//     <div className="home-container">
//       {/* Navbar */}
//       <nav className="navbar">
//         <div className="logo">SafeStreet</div>
//         <div className="nav-links">
//           <Link to="/home">Home</Link>
//           <Link to="/dashboard">Dashboard</Link>
//           <Link to="/about">About Us</Link>
//           <Link to="/help">Help</Link>
//           <Link to="/" onClick={() => localStorage.removeItem("token")}>Log Out</Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <header className="hero-section">
//         <h1>Smart Road Maintenance for Safer Cities</h1>
//         <p>AI-powered detection and reporting system for road authorities.</p>
//         <Link to="/dashboard" className="cta-button">Access Dashboard</Link>
//       </header>
//       {/* Image, Arrows, Video, and Analysis Box Section */}
//       <section className="image-section">
//         <div className="image-container">
//           {/* Image */}
//           <img src={websiteImg} alt="Road Monitoring Example" className="benefit-image" />
          
//           {/* First Arrow */}
//           <span className="arrow">→</span>
//           <img src={video} alt="robot" className="benefit-image" />
//           {/* Second Arrow */}
//           <span className="arrow">→</span>
          
//           {/* Blinking Analysis Box */}
//           <div className="analysis-box">
//             <p><strong>Type:</strong> Pothole with surrounding cracks</p>
//             <p><strong>Severity:</strong> High (visible depth and water retention)</p>
//             <p><strong>Risks:</strong> Vehicle damage (tires, suspension), road safety hazard</p>
//             <p><strong>Cause:</strong> Water seepage, freeze-thaw cycles, heavy traffic</p>
//             <p><strong>Recommended Action:</strong> Immediate patching, long-term resurfacing, improved drainage</p>
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section className="how-it-works">
//         <h2>How SafeStreet Works</h2>
//         <ul>
//           <li><strong>1. Capture & Upload:</strong> Field teams report road damage via the mobile app.</li>
//           <li><strong>2. AI Analysis:</strong> ViT model classifies damage severity.</li>
//           <li><strong>3. Automated Reporting:</strong> Reports sent to road authorities.</li>
//           <li><strong>4. Dashboard Insights:</strong> Monitor, plan, and manage repairs.</li>
//         </ul>
//       </section>
//     </div>
//   );
// };

// export default HomePage;
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import heroImage from "../images/background.png"; // Your image

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 2000 });
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SafeStreet</div>
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About Us</Link>
          <Link to="/help">Help</Link>
          <Link to="/" onClick={() => localStorage.removeItem("token")}>
            Log Out
          </Link>
        </div>
      </nav>

      {/* Hero Section with Image Background */}
      <header
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-content">
          <h1 data-aos="fade-up">Smart Road Maintenance for Safer Cities</h1>
          <p data-aos="fade-up">AI-powered detection and reporting system for road authorities.</p>
          <Link to="/dashboard" className="cta-button" data-aos="fade-up">
            Access Dashboard
          </Link>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How SafeStreet Works</h2>
        <ul>
          <li><strong>1. Capture & Upload:</strong> Field teams report road damage via the mobile app.</li>
          <li><strong>2. AI Analysis:</strong> ViT model classifies damage severity.</li>
          <li><strong>3. Automated Reporting:</strong> Reports sent to road authorities.</li>
          <li><strong>4. Dashboard Insights:</strong> Monitor, plan, and manage repairs.</li>
        </ul>
      </section>
      <div className="email-banner">
        <p>Contact us: <a href="safestreet.help@gmail.com">support@safestreet.com</a></p>
      </div>
    </div>

  );
};

export default HomePage;
