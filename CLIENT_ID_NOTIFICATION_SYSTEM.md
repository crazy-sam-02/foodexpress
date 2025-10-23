# Client ID-Based Notification System

## Overview

The notification system has been rewritten to be client ID-centric, where notifications are stored with the client IDs they should be delivered to, rather than using separate user-notification association tables.

## Key Changes

### 1. Notification Model (`backend/models/Notification.js`)

```javascript
// NEW FIELDS ADDED:
client_ids: [{ type: String, required: true }], // Array of client IDs this notification is for
order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null }, // Optional order reference
```

### 2. Admin Send Endpoint (`POST /admin/send`)

**New Request Body Format:**

```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "announcement",
  // ONE OF THE FOLLOWING TARGET OPTIONS:
  "clientIds": ["client1", "client2", "client3"], // Array of specific client IDs
  "customerId": "single_client_id", // Single client ID
  "orderId": "order_id_here" // Order ID (finds associated client)
  // OR send to all (no targeting parameters)
}
```

**How it works:**

1. **Client ID Array**: Direct targeting of multiple clients
2. **Single Customer**: One specific client ID
3. **Order ID**: Finds the client who placed the order
4. **All Users**: Gets all user IDs and targets everyone

**Database Storage:**

- Creates notification with `client_ids` array containing target clients
- No separate UserNotification entries needed for basic delivery
- Real-time delivery via Socket.IO to `user_${clientId}` rooms

### 3. User Notification Loading (`GET /user`)

**New Logic:**

```javascript
// Find notifications that include this client ID
const notifications = await Notification.find({
  client_ids: clientId,
}).sort({ created_at: -1 });
```

**Response Format:**

```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification_id",
      "title": "Title",
      "message": "Message",
      "type": "announcement",
      "created_at": "2024-01-01T00:00:00.000Z",
      "is_read": false,
      "read_at": null,
      "client_ids": ["client1", "client2"],
      "order_id": "order_id_or_null"
    }
  ]
}
```

### 4. Read Status Management

**Mark Single as Read (`PATCH /user/:notificationId/read`)**:

- Verifies notification exists and includes the client ID
- Creates/updates UserNotification entry for read status tracking
- Uses upsert to handle first-time reads

**Mark All as Read (`PATCH /user/read-all`)**:

- Finds all notifications for client ID
- Creates UserNotification entries for all notifications
- Updates read status for all client's notifications

### 5. Admin Panel Enhancements

**New Targeting Options:**

1. **All Users** - Send to everyone
2. **Order ID** - Send to customer of specific order
3. **Customer ID** - Send to single specific customer
4. **Client IDs** - Send to multiple specific clients (comma-separated)

**Client IDs Input:**

```
Enter multiple client IDs separated by commas:
68df16557843d38da8567a23, 674a1b2c3d4e5f678901234, 68df16557843d38da8567a24
```

## Benefits of Client ID-Centric Approach

### ✅ **Simplified Architecture**

- Single source of truth for notification targeting
- No complex joins between Notification and UserNotification tables
- Client IDs stored directly in notification document

### ✅ **Better Performance**

- Direct query: `Notification.find({ client_ids: clientId })`
- No need for complex populate operations
- Faster notification loading for users

### ✅ **Flexible Targeting**

- Multiple clients in single notification
- Easy bulk operations
- Clear audit trail of who was targeted

### ✅ **Scalable Design**

- Client IDs array can handle any number of targets
- Efficient MongoDB array queries with indexing
- Real-time and persistent storage unified

## Usage Examples

### Admin Sending Notifications

**1. Send to All Users:**

```javascript
POST /notifications/admin/send
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "type": "announcement"
}
```

**2. Send to Specific Clients:**

```javascript
POST /notifications/admin/send
{
  "title": "VIP Offer",
  "message": "Exclusive deal for premium customers",
  "type": "promotion",
  "clientIds": ["client1", "client2", "client3"]
}
```

**3. Send to Order Customer:**

```javascript
POST /notifications/admin/send
{
  "title": "Order Update",
  "message": "Your order has been shipped",
  "type": "delivery",
  "orderId": "674a1b2c3d4e5f678901234"
}
```

### Client Receiving Notifications

**1. Load Notifications:**

```javascript
GET /notifications/user
Authorization: Bearer <jwt_token>
```

**2. Mark as Read:**

```javascript
PATCH /notifications/user/674a1b2c3d4e5f678901234/read
Authorization: Bearer <jwt_token>
```

**3. Real-time Reception:**

```javascript
socket.on("notification", (data) => {
  // Notification received instantly
  console.log("New notification:", data);
});
```

## Database Schema

### Notification Document

```javascript
{
  _id: ObjectId,
  title: "Notification Title",
  message: "Notification message content",
  type: "announcement",
  client_ids: ["68df16557843d38da8567a23", "674a1b2c3d4e5f678901234"],
  order_id: ObjectId || null,
  created_by: ObjectId,
  created_at: Date
}
```

### UserNotification Document (Read Status Only)

```javascript
{
  _id: ObjectId,
  notification_id: ObjectId,
  user_id: "68df16557843d38da8567a23",
  is_read: true,
  read_at: Date,
  created_at: Date
}
```

## Migration Notes

### From Previous System:

1. **Notification creation** now requires client_ids array
2. **User loading** uses client_ids query instead of UserNotification joins
3. **Read status** still uses UserNotification but with upsert capability
4. **Admin UI** enhanced with multiple targeting options

### Backward Compatibility:

- Existing UserNotification entries remain functional
- Read status system unchanged for end users
- Socket.IO real-time delivery unchanged
- API endpoints maintain same response formats

## Performance Considerations

### Indexing Recommendations:

```javascript
// Notification collection
db.notifications.createIndex({ client_ids: 1 });
db.notifications.createIndex({ created_at: -1 });
db.notifications.createIndex({ client_ids: 1, created_at: -1 });

// UserNotification collection
db.user_notifications.createIndex(
  { user_id: 1, notification_id: 1 },
  { unique: true }
);
db.user_notifications.createIndex({ user_id: 1, is_read: 1 });
```

### Query Efficiency:

- ✅ Direct client_ids array queries are highly efficient
- ✅ MongoDB handles array membership tests natively
- ✅ Reduced number of database operations per user
- ✅ Bulk operations for multiple clients simplified
