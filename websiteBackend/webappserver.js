// const express = require("express");
// const mongoose = require("mongoose");//object data Modeling library to define schemas and intract with the database
// const dotenv = require("dotenv");//loads environment variables from .env file into process.env
// const cors = require("cors");//communication between frontend and backend
// const { exec } = require("child_process");//used to invoke python scripts
// const path = require("path");//utility for resolving file paths
// const axios = require("axios");//interact with external services and internal auth server
// const nodemailer = require("nodemailer");//sending email via SMTP

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "*" }));

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongaoDB Connected"))
//   .catch((err) => console.error("❌ DB Connection Error:", err));

// // ✅ Report Schema
// const reportSchema = new mongoose.Schema(
//   {
//     reportId: { type: String, unique: true },
//     dateTime: { type: Date, default: Date.now },
//     location: { type: Array, required: true },
//     typeOfDamage: { type: Array },
//     severity: { type: String },
//     imageUrl: { type: String, required: true },
//     image: { type: String }, // base64
//     recommendedAction: { type: String },
//     status: { type: String, default: "Pending" }, // <-- NEW
//   },
//   { collection: "reports" }
// );


// const Report = mongoose.model("Report", reportSchema);

// // ✅ Get city from coordinates using OpenCage API
// async function getCityFromCoordinates(lat, lon) {
//   try {
//     if (!process.env.OPENCAGE_API_KEY) throw new Error("Missing OPENCAGE_API_KEY");

//     const response = await axios.get(
//       `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.OPENCAGE_API_KEY}`
//     );

//     const result = response.data.results?.[0];
//     const components = result?.components;

//     return (
//       components?.city ||
//       components?.town ||
//       components?.village ||
//       components?.state_district ||
//       "Unknown"
//     );
//   } catch (error) {
//     console.error("❌ Failed to reverse geocode:", error.message);
//     return "Unknown";
//   }
// }

// // ✅ Send email notifications
// async function notifyUsers(city, report) {
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     return console.warn("⚠️ Email credentials not set, skipping notification");
//   }

//   try {
//     const response = await axios.get(
//       `${process.env.AUTH_SERVER_URL}/api/users-by-city/${city}`
//     );
//     const users = response.data;

//     if (!users.length) {
//       console.log(`ℹ️ No users found in ${city}`);
//       return;
//     }
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });    

//     for (const user of users) {
//       const [lat, lon] = report.location;
//       const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    
//       await transporter.sendMail({
//         from: `"SafeStreet Alerts" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: "New Road Report in Your Area",
//         html: `
//           <p>Hi ${user.username},</p>
//           <p>A new road damage has been reported in <b>${city}</b>.</p>
//           <p><strong>Type:</strong> ${report.typeOfDamage.join(", ")}</p>
//           <p><strong>Severity:</strong> ${report.severity}</p>
//           <p><strong>Location:</strong> <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a></p>
//           <br />
//           <p>For more details, visit the SafeStreet website.</p>
//           <hr />
//         `
//       });
//     }

//     console.log(`📧 Emails sent to users in ${city}`);
//   } catch (error) {
//     console.error("❌ Failed to notify users:", error.message);
//   }
// }

// // ✅ Get recommended action from Python script
// async function getRecommendedAction(typeOfDamage, severity) {
//   return new Promise((resolve, reject) => {
//     const scriptPath = path.join(__dirname, "../model/recommend_action.py");
//     const command = `python "${scriptPath}" "${typeOfDamage}" "${severity}"`;
//     const env = { ...process.env };

//     exec(command, { env }, (error, stdout, stderr) => {
//       if (error) {
//         console.error("❌ Gemini Script Error:", error.message);
//         return reject("Gemini script failed");
//       }
//       resolve(stdout.trim());
//     });
//   });
// }

// // ✅ Predict and Save
// app.post("/api/predict", async (req, res) => {
//   const { imageUrl, location } = req.body;

//   console.log("📥 Received request:", { imageUrl, location });

//   if (!imageUrl || !Array.isArray(location) || location.length !== 2) {
//     return res.status(400).json({ error: "Missing or invalid imageUrl or location" });
//   }

//   const [lat, lon] = location;
//   const scriptPath = path.join(__dirname, "..", "model", "predict.py");
//   const pythonCmd = `python "${scriptPath}" "${imageUrl}"`;

//   exec(pythonCmd, async (err, stdout, stderr) => {
//     if (err) {
//       console.error("❌ Prediction Error:", err.message);
//       return res.status(500).json({ error: "Prediction failed", details: stderr });
//     }

//     try {
//       const prediction = JSON.parse(stdout.trim());
//       console.log("🧠 Model prediction:", prediction);

//       if (prediction.isRoad === false) {
//         return res.status(200).json({ error: prediction.message || "Image is not a road" });
//       }

//       const { typeOfDamage, severity, image: base64_image } = prediction;

//       const recommendedAction = await getRecommendedAction(
//         typeOfDamage.join(", "),
//         severity
//       );

//       const newReport = new Report({
//         reportId: `REP-${Date.now()}`,
//         dateTime: new Date(),
//         location,
//         typeOfDamage,
//         severity,
//         imageUrl,
//         image: base64_image || null,
//         recommendedAction,
//       });

//       await newReport.save();

//       const city = await getCityFromCoordinates(lat, lon);

//       if (severity === "Severe") {
//         await notifyUsers(city, newReport);
//       }

//       // Send prediction details only — NO 'message' field
//       res.json({
//         typeOfDamage: newReport.typeOfDamage,
//         severity: newReport.severity,
//         objectsDetected: prediction.objectsDetected || [],
//         image: newReport.image,
//         recommendedAction: newReport.recommendedAction,
//       });

//     } catch (parseError) {
//       console.error("❌ JSON Parse Error:", parseError.message);
//       res.status(500).json({ error: "Failed to parse model output" });
//     }
//   });
// });


// // ✅ Get all reports
// app.get("/api/reports", async (req, res) => {
//   try {
//     const reports = await Report.find().sort({ dateTime: -1 });
//     res.json(reports);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch reports" });
//   }
// });
// // ✅ Get report by ID (including imageUrl)
// app.get("/api/reports/:id", async (req, res) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report) return res.status(404).json({ message: "Report not found" });

//     // Include the status field here
//     res.json({
//       reportId: report.reportId,
//       dateTime: report.dateTime,
//       location: report.location,
//       typeOfDamage: report.typeOfDamage,
//       severity: report.severity,
//       imageUrl: report.imageUrl,
//       image: report.image,
//       recommendedAction: report.recommendedAction,
//       status: report.status,  // <-- ADD THIS LINE
//     });
//   } catch {
//     res.status(500).json({ message: "Failed to fetch report" });
//   }
// });

// app.patch("/api/reports/:id/status", async (req, res) => {
//   const { status } = req.body;
//   try {
//     const report = await Report.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!report) return res.status(404).json({ message: "Report not found" });
//     res.json(report);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update status" });
//   }
// });

// // ✅ Get report by ID
// // app.get("/api/reports/:id", async (req, res) => {
// //   try {
// //     const report = await Report.findById(req.params.id);
// //     if (!report) return res.status(404).json({ message: "Report not found" });
// //     res.json(report);
// //   } catch {
// //     res.status(500).json({ message: "Failed to fetch report" });
// //   }
// // });

// // ✅ Start the server
// const PORT = process.env.WEBAPP_PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
// ✅ Required Dependencies
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Mongoose Schema
const reportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true },
  dateTime: { type: Date, default: Date.now },
  location: { type: Array, required: true },
  typeOfDamage: { type: Array },
  severity: { type: String },
  imageUrl: { type: String, required: true },
  image: { type: String },
  recommendedAction: { type: String },
  status: { type: String, default: "Pending" },
}, { collection: "reports" });

const Report = mongoose.model("Report", reportSchema);

// ✅ In-memory cache for cities
const cityCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// ✅ Get city from coordinates
async function getCityFromCoordinates(lat, lon) {
  const cacheKey = `${lat},${lon}`;
  const cachedCity = cityCache.get(cacheKey);
  if (cachedCity) return cachedCity;

  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`);
    const components = response.data.results?.[0]?.components;
    const city = components?.city || components?.town || components?.village || components?.state_district || "Unknown";

    cityCache.set(cacheKey, city);
    return city;
  } catch (error) {
    console.error("❌ Reverse geocoding failed:", error.message);
    return "Unknown";
  }
}

// ✅ Send email alerts to users
async function notifyUsers(city, report) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return console.warn("⚠️ Email credentials not set.");
  }

  try {
    const response = await axios.get(`${process.env.AUTH_SERVER_URL}/api/users-by-city/${city}`);
    const users = response.data;

    if (!users.length) return console.log(`ℹ️ No users in ${city}`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const [lat, lon] = report.location;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

    for (const user of users) {
      await transporter.sendMail({
        from: `"SafeStreet Alerts" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "🚧 New Road Report in Your Area",
        html: `
          <p>Hi ${user.username},</p>
          <p>A new road damage has been reported in <b>${city}</b>.</p>
          <p><strong>Type:</strong> ${report.typeOfDamage.join(", ")}</p>
          <p><strong>Severity:</strong> ${report.severity}</p>
          <p><strong>Location:</strong> <a href="${mapsUrl}" target="_blank">View on Google Maps</a></p>
          <br />
          <p>Stay safe,<br/>SafeStreet Team</p>
        `,
      });
    }

    console.log(`📧 Notifications sent to ${users.length} users in ${city}`);
  } catch (error) {
    console.error("❌ Email notification error:", error.message);
  }
}

// ✅ Get recommended action from Python
async function getRecommendedAction(typeOfDamage, severity) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../model/recommend_action.py");
    const command = `python "${scriptPath}" "${typeOfDamage}" "${severity}"`;
    exec(command, (error, stdout) => {
      if (error) {
        console.error("❌ recommend_action.py error:", error.message);
        return reject("Action script failed");
      }
      resolve(stdout.trim());
    });
  });
}

// ✅ Predict and Save report
app.post("/api/predict", async (req, res) => {
  const { imageUrl, location } = req.body;
  if (!imageUrl || !Array.isArray(location) || location.length !== 2) {
    return res.status(400).json({ error: "Invalid imageUrl or location" });
  }

  const [lat, lon] = location;
  const scriptPath = path.join(__dirname, "../model/predict.py");
  const command = `python "${scriptPath}" "${imageUrl}"`;

  exec(command, async (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Predict script error:", err.message);
      return res.status(500).json({ error: "Prediction failed" });
    }

    try {
      const prediction = JSON.parse(stdout.trim());
      if (prediction.isRoad === false) {
        return res.status(200).json({ error: prediction.message || "Not a road image" });
      }

      const { typeOfDamage, severity, image: base64Image, objectsDetected } = prediction;

      const recommendedAction = await getRecommendedAction(
        typeOfDamage.join(", "),
        severity
      );

      const newReport = new Report({
        reportId: `REP-${Date.now()}`,
        dateTime: new Date(),
        location,
        typeOfDamage,
        severity,
        imageUrl,
        image: base64Image || null,
        recommendedAction,
      });

      await newReport.save();
      const city = await getCityFromCoordinates(lat, lon);

      if (severity === "Severe") {
        await notifyUsers(city, newReport);
      }

      res.json({
        typeOfDamage,
        severity,
        objectsDetected,
        image: base64Image,
        recommendedAction,
      });
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      res.status(500).json({ error: "Prediction JSON parsing failed" });
    }
  });
});

// ✅ Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ dateTime: -1 });
    res.json(reports);
  } catch {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ✅ Get report by ID
app.get("/api/reports/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json({
      reportId: report.reportId,
      dateTime: report.dateTime,
      location: report.location,
      typeOfDamage: report.typeOfDamage,
      severity: report.severity,
      imageUrl: report.imageUrl,
      image: report.image,
      recommendedAction: report.recommendedAction,
      status: report.status,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

// ✅ Update report status
app.patch("/api/reports/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ✅ Start server
const PORT = process.env.WEBAPP_PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
