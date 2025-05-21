// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const { exec } = require("child_process");
// const path = require("path");
// const axios = require("axios");
// const nodemailer = require("nodemailer");

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "*" }));

// // ✅ MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.log("❌ DB Connection Error:", err));

// // ✅ Define Schema for reports
// const reportSchema = new mongoose.Schema(
//   {
//     reportId: { type: String, unique: true },
//     dateTime: { type: Date, required: true, default: Date.now },
//     location: { type: Array, required: true },
//     typeOfDamage: { type: Array, default: null },
//     severity: { type: String, default: null },
//     imageUrl: { type: String, required: true },
//     image: { type: String, default: null }, // base64
//     recommendedAction: { type: String, default: null },
//   },
//   { collection: "reports" }
// );

// const Report = mongoose.model("Report", reportSchema);

// // ✅ Reverse Geocode function to get city from coordinates
// async function getCityFromCoordinates(lat, lon) {
//   try {
//     const response = await axios.get(
//       `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.OPENCAGE_API_KEY}`
//     );
//     const city =
//       response.data.results[0]?.components.city ||
//       response.data.results[0]?.components.town ||
//       response.data.results[0]?.components.village ||
//       "Unknown";
//     return city;
//   } catch (error) {
//     console.error("❌ Failed to reverse geocode:", error.message);
//     return "Unknown";
//   }
// }

// // ✅ Function to notify users via email
// async function notifyUsers(city, report) {
//   try {
//     const response = await axios.get(`${process.env.AUTH_SERVER_URL}/api/users-by-city/${city}`);
//     const users = response.data;

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     for (let user of users) {
//       await transporter.sendMail({
//         from: `"SafeStreet" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: "🚧 New Road Damage Reported in Your Area",
//         html: `<p>Hi ${user.username},</p>
//                <p>A new road damage has been reported in <b>${city}</b>.</p>
//                <p><b>Type of Damage:</b> ${report.typeOfDamage.join(", ")}</p>
//                <p><b>Severity:</b> ${report.severity}</p>
//                <p><b>Recommended Action:</b> ${report.recommendedAction}</p>`,
//       });
//     }

//     console.log(`📧 Emails sent to users in ${city}`);
//   } catch (error) {
//     console.error("❌ Failed to notify users:", error.message);
//   }
// }

// // ✅ Function to get recommended action using Gemini via Python
// async function getRecommendedAction(typeOfDamage, severity) {
//   return new Promise((resolve, reject) => {
//     const scriptPath = path.join(__dirname, "../model/recommend_action.py");
//     const command = `python "${scriptPath}" "${typeOfDamage}" "${severity}"`;
//     const env = { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY };

//     exec(command, { env }, (error, stdout, stderr) => {
//       if (error) {
//         console.error("❌ Gemini Script Error:", error.message);
//         return reject("Gemini script execution failed");
//       }

//       resolve(stdout.trim());
//     });
//   });
// }

// // ✅ Predict route (fully fixed)
// app.post("/api/predict", async (req, res) => {
//   try {
//     const { imageUrl, location } = req.body;
//     console.log("📥 Received request:", req.body);

//     if (!imageUrl || !location || location.length !== 2) {
//       return res.status(400).json({ error: "Missing or invalid imageUrl or location" });
//     }

//     const [lat, lon] = location;
//     const scriptPath = path.join(__dirname, "../model/predict.py");
//     const pythonCommand = `python "${scriptPath}" "${imageUrl}"`;

//     exec(pythonCommand, async (error, stdout, stderr) => {
//       if (error) {
//         console.error("❌ Prediction Error:", error.message);
//         return res.status(500).json({ error: "Prediction failed", details: stderr || error.message });
//       }

//       try {
//         const prediction = JSON.parse(stdout.trim());
//         console.log("🧠 Model prediction:", prediction);

//         const { typeOfDamage, severity, image: base64_image } = prediction;

//         const recommendedAction = await getRecommendedAction(
//           typeOfDamage.join(", "),
//           severity
//         );

//         const newReport = new Report({
//           reportId: `REP-${Date.now()}`,
//           dateTime: new Date(),
//           location,
//           typeOfDamage,
//           severity,
//           imageUrl,
//           image: base64_image || null,
//           recommendedAction,
//         });

//         await newReport.save();

//         const city = await getCityFromCoordinates(lat, lon);
//         if (severity === "Severe") {
//           await notifyUsers(city, newReport);
//         }
//         res.json({ message: "Prediction saved", report: newReport });
//       } catch (parseError) {
//         console.error("❌ JSON Parse Error:", parseError.message);
//         res.status(500).json({ error: "Failed to parse model output", details: parseError.message });
//       }
//     });
//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: "Internal Server Error", details: error.message });
//   }
// });

// // ✅ Fetch all reports
// app.get("/api/reports", async (req, res) => {
//   try {
//     const reports = await Report.find().sort({ dateTime: -1 });
//     res.json(reports);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch reports" });
//   }
// });

// // ✅ Fetch report by ID
// app.get("/api/reports/:id", async (req, res) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report) return res.status(404).send({ message: "Report not found" });
//     res.status(200).json(report);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch report details" });
//   }
// });

// // ✅ Start server
// const PORT = process.env.WEBAPP_PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ✅ Report Schema
const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true },
    dateTime: { type: Date, default: Date.now },
    location: { type: Array, required: true },
    typeOfDamage: { type: Array },
    severity: { type: String },
    imageUrl: { type: String, required: true },
    image: { type: String }, // base64
    recommendedAction: { type: String },
  },
  { collection: "reports" }
);

const Report = mongoose.model("Report", reportSchema);

// ✅ Get city from coordinates using OpenCage
async function getCityFromCoordinates(lat, lon) {
  try {
    if (!process.env.OPENCAGE_API_KEY) throw new Error("Missing OPENCAGE_API_KEY");

    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.OPENCAGE_API_KEY}`
    );

    const result = response.data.results?.[0];
    const components = result?.components;

    return (
      components?.city ||
      components?.town ||
      components?.village ||
      components?.state_district ||
      "Unknown"
    );
  } catch (error) {
    console.error("❌ Failed to reverse geocode:", error.message);
    return "Unknown";
  }
}

// ✅ Send email notifications
async function notifyUsers(city, report) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return console.warn("⚠️ Email credentials not set, skipping notification");
  }

  try {
    const response = await axios.get(
      `${process.env.AUTH_SERVER_URL}/api/users-by-city/${city}`
    );
    const users = response.data;

    if (!users.length) {
      console.log(`ℹ️ No users found in ${city}`);
      return;
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });    

    for (const user of users) {
      const [lat, lon] = report.location;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    
      await transporter.sendMail({
        from: `"SafeStreet Alerts" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "New Road Report in Your Area",
        html: `
          <p>Hi ${user.username},</p>
          <p>A new road damage has been reported in <b>${city}</b>.</p>
          <p><strong>Type:</strong> ${report.typeOfDamage.join(", ")}</p>
          <p><strong>Severity:</strong> ${report.severity}</p>
          <p><strong>Location:</strong> <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a></p>
          <br />
          <p>For more details, visit the SafeStreet website.</p>
          <hr />
        `
      });
    }

    console.log(`📧 Emails sent to users in ${city}`);
  } catch (error) {
    console.error("❌ Failed to notify users:", error.message);
  }
}

// ✅ Get recommended action from Python script
async function getRecommendedAction(typeOfDamage, severity) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../model/recommend_action.py");
    const command = `python "${scriptPath}" "${typeOfDamage}" "${severity}"`;
    const env = { ...process.env };

    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Gemini Script Error:", error.message);
        return reject("Gemini script failed");
      }
      resolve(stdout.trim());
    });
  });
}

// ✅ Predict and Save
app.post("/api/predict", async (req, res) => {
  try {
    const { imageUrl, location } = req.body;
    console.log("📥 Received request:", req.body);

    if (!imageUrl || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ error: "Missing or invalid imageUrl or location" });
    }

    const [lat, lon] = location;
    const scriptPath = path.join(__dirname, "../model/predict.py");
    const pythonCmd = `python "${scriptPath}" "${imageUrl}"`;

    exec(pythonCmd, async (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Prediction Error:", err.message);
        return res.status(500).json({ error: "Prediction failed", details: stderr });
      }

      try {
        const prediction = JSON.parse(stdout.trim());
        console.log("🧠 Model prediction:", prediction);

        const { typeOfDamage, severity, image: base64_image } = prediction;

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
          image: base64_image || null,
          recommendedAction,
        });

        await newReport.save();

        const city = await getCityFromCoordinates(lat, lon);

        if (severity === "Severe") {
          await notifyUsers(city, newReport);
        }

        res.json({ message: "Prediction saved", report: newReport });
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError.message);
        res.status(500).json({ error: "Failed to parse model output" });
      }
    });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
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
// ✅ Get report by ID (including imageUrl)
app.get("/api/reports/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    
    // Ensure that imageUrl is included in the response
    res.json({
      reportId: report.reportId,
      dateTime: report.dateTime,
      location: report.location,
      typeOfDamage: report.typeOfDamage,
      severity: report.severity,
      imageUrl: report.imageUrl, // The image URL from the database
      image: report.image, // If you're storing base64 image data as well
      recommendedAction: report.recommendedAction
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

// ✅ Get report by ID
// app.get("/api/reports/:id", async (req, res) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report) return res.status(404).json({ message: "Report not found" });
//     res.json(report);
//   } catch {
//     res.status(500).json({ message: "Failed to fetch report" });
//   }
// });

// ✅ Start the server
const PORT = process.env.WEBAPP_PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
