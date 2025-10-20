import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import User from "../models/User.js";
import { sendSuccess, sendError, sendServerError, sendUnauthorized, sendForbidden } from "../utils/apiResponse.js";
import { requireAdminSession } from "../middleware/adminSession.js";

const router = express.Router();

// ---------------- FIREBASE INITIALIZATION USING ENVIRONMENT VARIABLES ----------------
let firebaseInitialized = false;

// Initialize Firebase Admin SDK (called after environment variables are loaded)
function initializeFirebase() {
  if (firebaseInitialized) return true;
  
  try {
    if (!admin.apps.length) {
      // Get Firebase configuration from environment variables
      const firebaseConfig = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
      };

      // Validate required Firebase environment variables
      const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.error("❌ Missing Firebase environment variables:");
        missingVars.forEach(varName => console.error(`   - ${varName}`));
        console.error("\n💡 Please set Firebase environment variables in your .env file");
        console.error("   Check .env.example for the required format");
        return false;
      }

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });

      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK initialized successfully");
      console.log(`🔧 Loaded from environment variables`);
      return true;
    } else {
      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK already initialized");
      return true;
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    console.error("Stack:", error.stack);
    return false;
  }
}

// -------------------- AUTH ROUTES --------------------

// Helper: Verify Firebase ID token and upsert user in MongoDB, then sign JWT
async function handleFirebaseIdTokenLogin({ idToken, name, email, photoURL }, res) {
  try {
    if (!idToken || !email)
      return res.status(400).json({ message: "ID token and email are required" });

    if (!firebaseInitialized) {
      return res.status(500).json({
        message: "Firebase authentication is not configured on the server. Please ensure Firebase environment variables are set correctly.",
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

    console.log(`🔍 Looking for user with email: ${email.toLowerCase()}`);
    let user = await User.findOne({ email: email.toLowerCase() });
    console.log(`👤 User found: ${user ? 'YES' : 'NO'}${user ? ` (GoogleID: ${user.googleId || 'NONE'})` : ''}`);

    if (!user) {
      console.log("🚀 Creating new user for email:", email.toLowerCase());
      // Try to create a new user, but handle the case where another request might have created it
      try {
        user = new User({
          name: name || email.split("@")[0],
          email: email.toLowerCase(),
          password: await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10),
          googleId: decodedToken.uid,
          photoURL: photoURL || "",
        });
        await user.save();
        console.log("✅ Created new user:", user.email);
      } catch (duplicateError) {
        // If we get a duplicate key error, the user was created by another request
        if (duplicateError.code === 11000) {
          console.log("🔄 User creation failed due to duplicate, fetching existing user...");
          user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            throw new Error("Failed to retrieve existing user after duplicate key error");
          }
          console.log("✅ Found existing user after duplicate error:", user.email);
        } else {
          throw duplicateError; // Re-throw if it's not a duplicate key error
        }
      }
    } else {
      console.log("👤 User already exists:", user.email, "GoogleID:", user.googleId || 'NONE');
    }

    // Update user with Google ID and photo if needed (outside the creation block)
    if (user && !user.googleId) {
      console.log("🔄 Updating existing user with Google ID:", user.email);
      try {
        user.googleId = decodedToken.uid;
        user.photoURL = photoURL || user.photoURL;
        await user.save();
        console.log("✅ Updated existing user with Google ID:", user.email);
      } catch (updateError) {
        // If updating fails due to duplicate Google ID, it might already be set
        if (updateError.code === 11000) {
          console.log("🔄 Google ID already exists, refreshing user data...");
          user = await User.findOne({ email: email.toLowerCase() });
        } else {
          throw updateError;
        }
      }
    } else if (user && user.googleId) {
      console.log("✅ User already has Google ID, no update needed:", user.email);
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

// Export router as default and initializeFirebase as named export
export default router;
export { initializeFirebase };