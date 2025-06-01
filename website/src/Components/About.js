import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <nav className="navbar">
              <div className="logo">SafeStreet</div>
              <div className="nav-links">
                <Link to="/home">Home</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/about">About Us</Link>
                <Link to="/" onClick={() => localStorage.removeItem("token")}>
                  Log Out
                </Link>
              </div>
            </nav>

      <div className="about-content">
        <h1>About SafeStreet</h1>
        <p className="mission">
          SafeStreet is dedicated to improving road safety and infrastructure through intelligent, AI-powered tools.
        </p>

        <section>
          <h2>🚀 Our Mission</h2>
          <p>
            We aim to make roads safer and maintenance more efficient by enabling real-time reporting, smart classification,
            and quick response to road damage.
          </p>
        </section>

        <section>
          <h2>📱 Mobile-First Solution</h2>
          <p>
            Our mobile app empowers field workers to capture road damage and upload images directly to the backend system.
            These images are then analyzed by our AI models to classify the damage and assess severity.
          </p>
        </section>

        <section>
          <h2>🧠 AI-Powered Analysis</h2>
          <p>
            The Vision Transformer (ViT) model identifies the type of road damage and evaluates its severity, while our
            system generates a summary including repair priority. This summary is automatically shared with relevant authorities.
          </p>
        </section>

        <section>
          <h2>📊 Web Dashboard</h2>
          <p>
            Built on the MERN stack, our web platform provides real-time dashboards, visual insights, and historical tracking
            tools for road authorities.
          </p>
        </section>

        <section>
          <h2>🌍 Our Impact</h2>
          <p>
            With SafeStreet, road maintenance becomes faster, smarter, and more transparent—leading to safer streets and
            better infrastructure for all.
          </p>
        </section>

        <section className="contact-section">
          <h2>📬 Contact Us</h2>
          <p>
            We'd love to hear from you! For inquiries, feedback, or partnership opportunities, please reach out:
          </p>
          <ul>
            <li>
            <strong>Email:</strong>{" "}
            <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=safestreet.help@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                safestreet.help@gmail.com
            </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default About;
