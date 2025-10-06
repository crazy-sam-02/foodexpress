// routes/notifications.js
import express from "express";
import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find().sort({ created_at: -1 });

    const readStatuses = await UserNotification.find({ user_id: userId });
    const map = new Map(readStatuses.map(rs => [rs.notification_id.toString(), rs]));

    const withStatus = notifications.map(n => {
      const rs = map.get(n._id.toString());
      return {
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        created_at: n.created_at,
        is_read: rs?.is_read || false,
        read_at: rs?.read_at || null
      };
    });

    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark one as read
router.post("/:userId/read/:notifId", async (req, res) => {
  try {
    const { userId, notifId } = req.params;
    const updated = await UserNotification.findOneAndUpdate(
      { user_id: userId, notification_id: notifId },
      { is_read: true, read_at: new Date() },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark all as read
router.post("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;
    const unread = await Notification.find();
    await Promise.all(unread.map(n =>
      UserNotification.findOneAndUpdate(
        { user_id: userId, notification_id: n._id },
        { is_read: true, read_at: new Date() },
        { upsert: true }
      )
    ));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
