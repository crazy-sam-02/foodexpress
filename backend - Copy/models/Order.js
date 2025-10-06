import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * Helper: format order for response
 */
const formatOrder = (order) => {
  return {
    _id: order._id,
    user: order.user,
    items: order.items.map((item) => ({
      _id: item._id,
      product: item.product,  // populated product
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
  };
};

/**
 * POST /api/orders/create
 * Create order from cart
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      status: "pending",
    });

    await order.save();
    await order.populate("items.product");

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.json({ success: true, order: formatOrder(order) });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

/**
 * GET /api/orders
 * Get all orders for logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map((order) => formatOrder(order)),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

/**
 * GET /api/orders/:id
 * Get single order by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order: formatOrder(order) });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status (Admin only)
 */
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status || order.status;
    await order.save();

    res.json({ success: true, order: formatOrder(order) });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

export default router;
