import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for faster user-specific queries
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting by date
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', 'upi'],
    required: true
  },
  // Admin management fields
  orderAction: {
    type: String,
    default: 'none'
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Enhanced tracking fields
  trackingNumber: {
    type: String,
    sparse: true // Allow null but unique when set
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  adminNotes: {
    type: String,
    default: ''
  },
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String, // admin email or system
      default: 'system'
    },
    notes: String
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add middleware to track status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    // Add to status history if status changed
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    
    // Add new status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._adminUpdatedBy || 'system',
      notes: this._statusChangeNotes || ''
    });
    
    // Update delivery date if status is delivered
    if (this.status === 'delivered' && !this.actualDelivery) {
      this.actualDelivery = new Date();
    }
  }
  
  console.log('[Order Model] Saving order:', this._id, 'Status:', this.status);
  next();
});

// Add compound index for efficient user queries
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });

export default mongoose.model('Order', orderSchema);