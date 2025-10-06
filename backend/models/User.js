// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  phone: { 
    type: String,
    default: ""
  },
  address: { 
    type: String,
    default: ""
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true
  },
  photoURL: { 
    type: String,
    default: ""
  }
}, { 
  timestamps: true 
});

export default mongoose.model("User", UserSchema);