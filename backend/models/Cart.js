import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// 🧮 Helper methods (optional)
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

cartSchema.methods.calculateTotalItems = function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
