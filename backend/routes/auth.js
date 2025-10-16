import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import User from "../models/User.js";
import { sendSuccess, sendError, sendServerError, sendUnauthorized, sendForbidden } from "../utils/apiResponse.js";
import { requireAdminSession } from "../middleware/adminSession.js";

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

// Helper: Verify Firebase ID token and upsert user in MongoDB, then sign JWT
async function handleFirebaseIdTokenLogin({ idToken, name, email, photoURL }, res) {
  try {
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

    if (decodedToken.email?.toLowerCase() !== email.toLowerCase()) {
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
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return res.status(500).json({ message: "Failed to generate authentication token" });
        }
        return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    console.error("❌ Firebase token login error:", error);
    res.status(500).json({ message: "Server error during Firebase token login" });
  }
}

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters long", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "User already exists with this email", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return sendServerError(res, err, "Failed to generate authentication token");
        }
        
        return sendSuccess(res, {
          token,
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email 
          }
        }, "User registered successfully", 201);
      }
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    return sendServerError(res, error, "Failed to register user");
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
  const { idToken, name, email, photoURL } = req.body || {};
  return handleFirebaseIdTokenLogin({ idToken, name, email, photoURL }, res);
});

// New alias: Generic Firebase ID token login (email/password or Google)
router.post("/firebase-login", async (req, res) => {
  const { idToken, name, email, photoURL } = req.body || {};
  return handleFirebaseIdTokenLogin({ idToken, name, email, photoURL }, res);
});

// Admin login route
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    // Find user by email and check if they are admin
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return sendUnauthorized(res, "Invalid credentials");
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return sendForbidden(res, "Access denied. Admin privileges required.");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendUnauthorized(res, "Invalid credentials");
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: true
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return sendServerError(res, err, "Failed to generate authentication token");
        }
        
        return sendSuccess(res, {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: true
          }
        }, "Admin logged in successfully");
      }
    );

  } catch (error) {
    console.error("❌ Admin login error:", error);
    return sendServerError(res, error, "Failed to authenticate admin");
  }
});

// ---------------- ADMIN SESSION AUTH WITH ENVIRONMENT VARIABLES ----------------
// Admin credentials from environment variables for security
const ADMIN_EMAIL_CONST = process.env.ADMIN_EMAIL || "admin@foodexpress.com";
const ADMIN_PASSWORD_CONST = process.env.ADMIN_PASSWORD || "FoodExpress2025!";

// Admin session: login
router.post('/admin/session/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Compare against constants (no DB lookup)
    const isValid = email === ADMIN_EMAIL_CONST && password === ADMIN_PASSWORD_CONST;
    if (!isValid) {
      return sendUnauthorized(res, 'Invalid admin credentials');
    }

    // Establish admin session
    req.session.admin = true;
    req.session.adminUser = {
      id: 'const-admin',
      name: 'Food Express Admin',
      email: ADMIN_EMAIL_CONST,
      isAdmin: true,
    };

    // Persist session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return sendServerError(res, err, 'Failed to create session');
      }
      return sendSuccess(res, {
        user: req.session.adminUser
      }, 'Admin logged in (session)');
    });
  } catch (error) {
    console.error('❌ Admin session login error:', error);
    return sendServerError(res, error, 'Failed to authenticate admin');
  }
});

// Admin session: status (who am I)
router.get('/admin/session/me', requireAdminSession, (req, res) => {
  return sendSuccess(res, {
    user: req.session.adminUser
  }, 'Admin session active');
});

// Admin session: logout
router.post('/admin/session/logout', (req, res) => {
  try {
    if (!req.session) {
      return sendSuccess(res, { loggedOut: true }, 'Session already cleared');
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return sendServerError(res, err, 'Failed to destroy session');
      }
      // Clear cookie (name is usually connect.sid)
      res.clearCookie('connect.sid');
      return sendSuccess(res, { loggedOut: true }, 'Admin logged out');
    });
  } catch (error) {
    console.error('❌ Admin session logout error:', error);
    return sendServerError(res, error);
  }
});

export default router;