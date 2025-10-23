// routes/notifications.js
import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { requireAdminSession } from "../middleware/adminSession.js";
import { authenticateToken } from "../middleware/auth.js";
import { io } from "../server.js";
import createRateLimiter from "../middleware/rateLimit.js";
import AdminActionLog from "../models/AdminActionLog.js";

// Allowed notification types (keep in sync with model)
const ALLOWED_TYPES = ["order", "delivery", "delivered", "promotion", "announcement", "alert"];

const router = express.Router();

// Admin: Send notification (rate limited)
const adminSendRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  keyGenerator: (req) => req.sessionID || req.ip || 'global'
});

router.post("/admin/send", requireAdminSession, adminSendRateLimit, async (req, res) => {
  try {
    const { title, message, type, clientIds } = req.body;

    // Basic presence checks
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.trim().length > 100) {
      errors.push({ field: 'title', message: 'Title must be at most 100 characters' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      errors.push({ field: 'message', message: 'Message is required' });
    } else if (message.trim().length > 500) {
      errors.push({ field: 'message', message: 'Message must be at most 500 characters' });
    }

    if (!type || typeof type !== 'string' || !ALLOWED_TYPES.includes(type)) {
      errors.push({ field: 'type', message: `Type must be one of: ${ALLOWED_TYPES.join(', ')}` });
    }

    if (clientIds !== undefined) {
      if (!Array.isArray(clientIds)) {
        errors.push({ field: 'clientIds', message: 'clientIds must be an array of user IDs' });
      } else {
        const invalid = clientIds.filter(id => !mongoose.isValidObjectId(id));
        if (invalid.length > 0) {
          errors.push({ field: 'clientIds', message: `Invalid clientIds (not ObjectId): ${invalid.join(', ')}` });
        }
      }
    }

    if (errors.length > 0) {
      // Audit: validation failure
      try {
        await AdminActionLog.create({
          route: '/notifications/admin/send',
          action: 'notifications.admin_send',
          admin_session_id: req.sessionID || null,
          admin_user_id: null,
          ip: req.ip,
          user_agent: req.headers['user-agent'] || null,
          payload: { title, type, clientIdsCount: Array.isArray(clientIds) ? clientIds.length : 0 },
          result: { errors },
          success: false,
        });
      } catch {}
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }

    let targetClientIds = [];

    if (clientIds && Array.isArray(clientIds) && clientIds.length > 0) {
      const validUsers = await User.find({ _id: { $in: clientIds } }, '_id');
      targetClientIds = validUsers.map(user => user._id.toString());
      const invalidClientIds = clientIds.filter(id => !targetClientIds.includes(id));
      
      if (invalidClientIds.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Invalid client IDs: ${invalidClientIds.join(', ')}`
        });
      }
    } else {
      const allUsers = await User.find({}, '_id');
      targetClientIds = allUsers.map(user => user._id.toString());
    }

    // Determine created_by safely from session (may be missing in some setups)
    let createdBy = null;
    try {
      if (req && req.session && req.session.user) {
        createdBy = req.session.user.id || req.session.user._id || null;
      }
    } catch (e) {
      console.warn('Warning: unable to read req.session.user for created_by', e && e.message);
      createdBy = null;
    }

    // Defensive: if there are no target client IDs, return a 400 instead of creating an empty notification
    if (!Array.isArray(targetClientIds) || targetClientIds.length === 0) {
      // Audit: no targets
      try {
        await AdminActionLog.create({
          route: '/notifications/admin/send',
          action: 'notifications.admin_send',
          admin_session_id: req.sessionID || null,
          admin_user_id: null,
          ip: req.ip,
          user_agent: req.headers['user-agent'] || null,
          payload: { title, type, clientIdsCount: 0 },
          result: { message: 'No valid target client IDs found.' },
          success: false,
        });
      } catch {}
      return res.status(400).json({
        success: false,
        message: 'No valid target client IDs found. Notification not created.'
      });
    }

    // Only convert createdBy to ObjectId when it looks like a valid ObjectId
    let createdByObject = null;
    if (createdBy && mongoose.isValidObjectId(createdBy)) {
      createdByObject = new mongoose.Types.ObjectId(createdBy);
    } else if (createdBy) {
      console.warn('createdBy value is present but not a valid ObjectId, storing as null');
    }

    const notification = new Notification({
      title: title.trim(),
      message: message.trim(),
      type,
      client_ids: targetClientIds,
      created_by: createdByObject,
    });

  await notification.save();

    let successCount = 0;
    for (const clientId of targetClientIds) {
      try {
        io.to(`user_${clientId}`).emit('notification', {
          id: notification._id.toString(),
          title: notification.title,
          message: notification.message,
          type: notification.type,
          created_at: notification.created_at.toISOString(),
          is_read: false,
          read_at: null
        });
        successCount++;
      } catch (error) {
        console.error(`Error sending notification to client ${clientId}:`, error);
      }
    }

    io.to("admin_room").emit('notification_sent', {
      notificationId: notification._id.toString(),
      recipientCount: successCount,
      title: notification.title,
      clientIds: targetClientIds
    });

    // Audit: success result
    try {
      const adminUserId = (createdBy && mongoose.isValidObjectId(createdBy)) ? new mongoose.Types.ObjectId(createdBy) : null;
      await AdminActionLog.create({
        route: '/notifications/admin/send',
        action: 'notifications.admin_send',
        admin_session_id: req.sessionID || null,
        admin_user_id: adminUserId,
        ip: req.ip,
        user_agent: req.headers['user-agent'] || null,
        payload: { title, type, clientIdsCount: targetClientIds.length },
        result: { successCount, notificationId: notification._id.toString() },
        success: true,
      });
    } catch {}

    res.json({
      success: true,
      message: `Notification sent successfully to ${successCount} client(s)`,
      notification: {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        client_ids: targetClientIds,
        recipients: successCount,
      }
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    // Audit: server error
    try {
      await AdminActionLog.create({
        route: '/notifications/admin/send',
        action: 'notifications.admin_send',
        admin_session_id: req.sessionID || null,
        admin_user_id: null,
        ip: req.ip,
        user_agent: req.headers['user-agent'] || null,
        payload: {},
        result: { error: error?.message },
        success: false,
      });
    } catch {}
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message
    });
  }
});

// Get notifications for authenticated user
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;
    // Pagination params with sane defaults
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const query = { client_ids: clientId };

    const [total, notifications] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const readStatuses = await UserNotification.find({ user_id: clientId });
    const readStatusMap = new Map(readStatuses.map(rs => [rs.notification_id.toString(), rs]));

    const notificationsWithStatus = notifications.map(notification => {
      const readStatus = readStatusMap.get(notification._id.toString());
      return {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        created_at: notification.created_at.toISOString(),
        is_read: readStatus?.is_read || false,
        read_at: readStatus?.read_at?.toISOString() || null,
      };
    });

    res.json({
      success: true,
      notifications: notificationsWithStatus,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching notifications for client:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
});

// Mark notification as read for authenticated user
router.patch("/user/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;
    const notificationId = req.params.notificationId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (!notification.client_ids.includes(clientId)) {
      return res.status(403).json({
        success: false,
        message: "Notification not intended for this client"
      });
    }

    const userNotification = await UserNotification.findOneAndUpdate(
      { 
        user_id: clientId, 
        notification_id: notificationId 
      },
      { 
        is_read: true, 
        read_at: new Date() 
      },
      { 
        new: true, 
        upsert: true
      }
    );

    res.json({
      success: true,
      message: "Notification marked as read",
      notification: {
        id: notificationId,
        is_read: true,
        read_at: userNotification.read_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
});

// Mark all notifications as read for authenticated user
router.patch("/user/read-all", authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;

    const notifications = await Notification.find({ 
      client_ids: clientId 
    }, '_id');

    const notificationIds = notifications.map(n => n._id);

    if (notificationIds.length === 0) {
      return res.json({
        success: true,
        message: "No notifications found for this client",
        updatedCount: 0
      });
    }

    const updatePromises = notificationIds.map(async (notificationId) => {
      return UserNotification.findOneAndUpdate(
        { 
          user_id: clientId, 
          notification_id: notificationId 
        },
        { 
          is_read: true, 
          read_at: new Date() 
        },
        { 
          new: true, 
          upsert: true
        }
      );
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.length;

    res.json({
      success: true,
      message: `Marked ${updatedCount} notifications as read`,
      updatedCount: updatedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message
    });
  }
});

export default router;