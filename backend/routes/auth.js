import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import User from "../models/User.js";

const router = express.Router();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- FIREBASE INITIALIZATION USING JSON FILE ----------------
let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    // Try multiple paths to find the Firebase service account JSON
    const possiblePaths = [
      path.resolve(__dirname, "../config/firebase-service-account.json"),
      path.resolve(process.cwd(), "config/firebase-service-account.json"),
      path.resolve(process.cwd(), "backend/config/firebase-service-account.json"),
    ];

    let serviceAccount = null;
    let foundPath = null;

    for (const firebasePath of possiblePaths) {
      if (fs.existsSync(firebasePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(firebasePath, "utf-8"));
        foundPath = firebasePath;
        break;
      }
    }

    if (!serviceAccount) {
      console.error("❌ Firebase service account JSON not found. Tried paths:");
      possiblePaths.forEach(p => console.error(`   - ${p}`));
      console.error("\n💡 Please place your firebase-service-account.json in the backend/config/ folder");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK initialized successfully");
      console.log(`📁 Loaded from: ${foundPath}`);
    }
  } else {
    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK already initialized");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error.message);
  console.error("Stack:", error.stack);
}

// -------------------- AUTH ROUTES --------------------

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google Login/Signup route
router.post("/google-login", async (req, res) => {
  try {
    const { idToken, name, email, photoURL } = req.body;

    if (!idToken || !email)
      return res.status(400).json({ message: "ID token and email are required" });

    if (!firebaseInitialized) {
      return res.status(500).json({
        message: "Firebase authentication is not configured on the server. Please ensure firebase-service-account.json is in the backend/config/ folder.",
      });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (decodedToken.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({ message: "Email mismatch" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10),
        googleId: decodedToken.uid,
        photoURL: photoURL || "",
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = decodedToken.uid;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
    }

    const payload = {
        user: {
            id: user.id,
        },
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
    );

  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
});

export default router;