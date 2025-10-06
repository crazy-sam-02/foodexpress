import express from "express";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import User from "../models/User.js";

const router = express.Router();

// Initialize Firebase Admin SDK using environment variables
let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
      console.error("⚠️ Firebase Admin credentials are missing in .env file");
      console.error("Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK initialized successfully");
    }
  } else {
    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK already initialized");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error.message);
}

// Middleware to check if user is authenticated
export const requireAuth = async (req, res, next) => {
  try {
    console.log("🔒 Auth check - Session:", req.session);
    
    if (!req.session.userId || !req.session.isAuthenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

// Middleware to check if user is admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    if (!req.session.userId || !req.session.isAuthenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

// ------------------- AUTH ROUTES -------------------

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    console.log("📝 Registration attempt for:", email);

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
    });

    await user.save();
    console.log("✅ User created:", user._id);

    // Create session
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    // Save session explicitly
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          reject(err);
        } else {
          console.log("✅ Session saved for user:", user._id);
          resolve();
        }
      });
    });

    // Return user data (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📝 Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    // Save session explicitly and wait for it
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          reject(err);
        } else {
          console.log("✅ Session saved for user:", user._id);
          resolve();
        }
      });
    });

    console.log("✅ Login successful for:", email);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google Login/Signup route
router.post("/google-login", async (req, res) => {
  try {
    const { idToken, name, email, photoURL } = req.body;

    console.log("📝 Google login attempt for:", email);

    if (!idToken || !email) {
      return res.status(400).json({ message: "ID token and email are required" });
    }

    if (!firebaseInitialized) {
      console.error("❌ Firebase Admin SDK not initialized");
      return res.status(500).json({ 
        message: "Firebase authentication is not configured on the server. Please check server logs." 
      });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("✅ Token verified for user:", decodedToken.email);
    } catch (error) {
      console.error("❌ Token verification error:", error);
      return res.status(401).json({ 
        message: "Invalid authentication token",
        details: error.message 
      });
    }

    // Verify that the email from token matches the provided email
    if (decodedToken.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({ message: "Email mismatch" });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("📝 Creating new user for:", email);
      
      // Create new user if doesn't exist
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10),
        phone: '',
        address: '',
        googleId: decodedToken.uid,
        photoURL: photoURL || '',
      });

      await user.save();
      console.log("✅ New user created:", user._id);
    } else {
      console.log("✅ Existing user found:", user._id);
      
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = decodedToken.uid;
        await user.save();
        console.log("✅ Updated googleId for user:", user._id);
      }
    }

    // Create session
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    // Save session explicitly and wait for it
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          reject(err);
        } else {
          console.log("✅ Session saved for user:", user._id);
          resolve();
        }
      });
    });

    console.log("✅ Google login successful for:", user.email);

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(500).json({ 
      message: "Server error during Google login",
      details: error.message 
    });
  }
});

// Get current user (check session)
router.get("/me", async (req, res) => {
  try {
    console.log("🔍 Session check - SessionID:", req.sessionID);
    console.log("🔍 Session data:", req.session);
    
    if (!req.session.userId || !req.session.isAuthenticated) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      req.session.destroy();
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User authenticated:", user.email);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("❌ Session check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  console.log("📝 Logout request for session:", req.sessionID);
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    console.log("✅ Logout successful");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Check auth status (protected route example)
router.post("/check-auth", requireAuth, (req, res) => {
  res.status(200).json({
    message: "User is authenticated",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin || false,
    },
  });
});

export default router;