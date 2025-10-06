// models/UserNotification.js
import mongoose from "mongoose";

const UserNotificationSchema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", required: true },
  user_id: { type: String, required: true }, // store userId as string from your auth
  is_read: { type: Boolean, default: false },
  read_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
}, { collection: "user_notifications" });

UserNotificationSchema.index({ notification_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model("UserNotification", UserNotificationSchema);
