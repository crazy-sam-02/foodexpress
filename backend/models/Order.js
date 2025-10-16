import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    // Allow both legacy and new admin statuses
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'confirmed', 'preparing', 'ready'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', 'upi'],
    required: true
  },
  orderAction: {
    type: String,
    default: 'none'
  },
  discount: {
    type: Number,
    default: 0
  }
});

// Add a pre-save hook for debugging
orderSchema.pre('save', function (next) {
  console.log('[Order Model] Saving order:', this);
  next();
});

export default mongoose.model('Order', orderSchema);