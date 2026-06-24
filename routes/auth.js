import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ==========================================
// 1. SIGNUP ROUTE (नया यूज़र बनाने के लिए)
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // चेक करें कि सभी फील्ड्स भेजी गई हैं या नहीं
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    // चेक करें कि यूज़र पहले से तो मौजूद नहीं है
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // पासवर्ड को सिक्योर (Hash) करें
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // नया यूज़र डेटाबेस में सेव करें
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ success: "User registered successfully! Please login." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// ==========================================
// 2. LOGIN ROUTE (टोकन जनरेट करने के लिए)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // चेक करें कि यूज़र मौजूद है या नहीं
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // पासवर्ड मैच करके देखें
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // JWT Token जनरेट करें (इसमें यूज़र की ID छिपी होगी)
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } // 7 दिनों तक लॉगिन रहेगा
    );

    // रिस्पॉन्स में टोकन और यूज़र का नाम भेजें
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;