import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Helper: format cart for response
 */
const formatCart = (cart) => {
  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items.map((item) => ({
      _id: item._id,               // cartItemId
      product: item.product,       // populated product
      quantity: item.quantity,
      price: item.price,
    })),
  };
};

/**
 * GET /api/cart
 * Get current user's cart
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }
    res.json({ success: true, cart: formatCart(cart) });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
});

/**
 * POST /api/cart/add
 * Add product to cart
 */
router.post("/add", requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        price: product.price, // snapshot
      });
    }

    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart: formatCart(cart) });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
});

/**
 * PUT /api/cart/update/:itemId
 * Update item quantity
 */
router.put("/update/:itemId", requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart: formatCart(cart) });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

/**
 * DELETE /api/cart/remove/:itemId
 * Remove single item from cart
 */
router.delete("/remove/:itemId", requireAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart: formatCart(cart) });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
});

/**
 * DELETE /api/cart/clear
 * Clear all items from cart
 */
router.delete("/clear", requireAuth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, cart: formatCart(cart) });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
});

export default router;
