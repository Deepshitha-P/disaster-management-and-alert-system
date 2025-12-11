import express from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";
import { registerValidation, loginValidation } from "../utils/validators.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 🔑 JWT helper
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 */
router.post("/register", registerValidation, async (req, res) => {
  console.log("📩 Incoming register payload:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("❌ Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phone, role, homeLocation } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.warn("⚠️ Email already registered:", email);
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user
    const user = new User({
      name,
      email,
      password, // will be hashed by pre-save hook
      phone,
      role: role || "user",
      homeLocation: homeLocation || {},
    });

    await user.save();

    console.log("✅ User saved to Mongo:", user._id);
    console.log("📂 DB name:", mongoose.connection.name);
    console.log(
      "📂 Collections:",
      (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name)
    );

    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 Register error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user + optionally update currentLocation
 */
router.post("/login", loginValidation, async (req, res) => {
  console.log("📩 Login payload:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("❌ Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, currentLocation } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    console.log("👉 Entered email:", email);
console.log("👉 Entered password:", password);
console.log("👉 Stored hash in DB:", user.password);

const ok = await user.matchPassword(password);
console.log("👉 Password match result:", ok);

if (!ok) {
  console.warn("❌ Invalid password for:", email);
  return res.status(401).json({ message: "Invalid credentials" });
}

    // Update live currentLocation if provided
    if (
      currentLocation &&
      currentLocation.latitude &&
      currentLocation.longitude
    ) {
      user.currentLocation = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        updatedAt: new Date(),
      };
      await user.save();
      console.log("📍 Current location updated for user:", user._id);
    }

    const token = generateToken(user._id, user.role);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        homeLocation: user.homeLocation,
        currentLocation: user.currentLocation,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    return res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user (needs auth token)
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("🔥 Me error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
