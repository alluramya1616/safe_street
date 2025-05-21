require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// **MongoDB Connection**
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// **Check if MongoDB is connected**
db.once("open", async () => {
  console.log("✅ MongoDB Connected Successfully!");
});

db.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

// **User Schema**
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// **Registration Route**
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, location } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, location });

    await newUser.save();
    console.log(`✅ New User Registered: ${username}`);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});
// **Login Route**
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1️⃣ Check if user exists in MongoDB
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // 2️⃣ Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});
// ✅ Route to get users by city (for notification)
app.get("/api/users-by-city/:city", async (req, res) => {
  try {
    const users = await User.find({ location: req.params.city }).select("email username");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users by city" });
  }
});

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
