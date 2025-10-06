import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  address: { type: String },
  isAdmin: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth users
  photoURL: { type: String }, // Google profile picture
}, { timestamps: true });

export default mongoose.model("User", UserSchema);