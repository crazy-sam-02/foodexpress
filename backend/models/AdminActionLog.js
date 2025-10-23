// models/AdminActionLog.js
import mongoose from 'mongoose';

const AdminActionLogSchema = new mongoose.Schema({
  route: { type: String, required: true },
  action: { type: String, required: true },
  admin_session_id: { type: String, default: null },
  admin_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ip: { type: String, default: null },
  user_agent: { type: String, default: null },
  payload: { type: Object, default: {} },
  result: { type: Object, default: {} },
  success: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, { collection: 'admin_action_logs' });

AdminActionLogSchema.index({ created_at: -1 });
AdminActionLogSchema.index({ action: 1, created_at: -1 });

export default mongoose.model('AdminActionLog', AdminActionLogSchema);
