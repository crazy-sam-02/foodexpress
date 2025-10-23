import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

import authRoutes, { initializeFirebase } from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

// Initialize Firebase after environment variables are loaded
initializeFirebase();

const app = express();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FoodExpress";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middlewares
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:8080",
      "http://localhost:8081", // Alternative local port
      "http://localhost:5173", // Vite default port
    ];
    
    // In production, also allow the specific Render URL
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Server & Socket.IO setup
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5173",
      ];
      
      if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

// Socket.IO connection handling with user authentication
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  
  // Handle user authentication for socket
  socket.on("authenticate", (data) => {
    const { userId, token } = data;
    if (userId && token) {
      socket.userId = userId;
      socket.join(`user_${userId}`); // Join user-specific room
      console.log(`👤 User ${userId} authenticated and joined room user_${userId}`);
    }
  });
  
  // Handle admin authentication for socket
  socket.on("authenticate_admin", (data) => {
    const { adminId } = data;
    if (adminId) {
      socket.adminId = adminId;
      socket.join("admin_room"); // Join admin room
      console.log(`👑 Admin ${adminId} authenticated and joined admin room`);
    }
  });
  
  socket.on("disconnect", () => {
    if (socket.userId) {
      console.log(`🔌 User ${socket.userId} disconnected:`, socket.id);
    } else if (socket.adminId) {
      console.log(`🔌 Admin ${socket.adminId} disconnected:`, socket.id);
    } else {
      console.log("🔌 Client disconnected:", socket.id);
    }
  });
});

// Export io for use in routes
export { io };

// Routes (must be after io is created)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "FoodExpress API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});