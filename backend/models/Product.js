import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  tags: [String],
  // Medicine-specific fields
  requiresPrescription: { type: Boolean, default: false },
  manufacturer: String,
  productType: { type: String, enum: ['food', 'medicine'], default: 'food' },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
