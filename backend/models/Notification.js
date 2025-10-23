// models/Notification.js
import mongoose from "mongoose";

const allowedTypes = ["order", "delivery", "delivered", "promotion", "announcement", "alert"];

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: allowedTypes, default: "announcement" },
  client_ids: [{ type: String, required: true }], // Array of client IDs this notification is for
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null }, // Optional order reference
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  created_at: { type: Date, default: Date.now }
}, { collection: "notifications" });

export default mongoose.model("Notification", NotificationSchema);
