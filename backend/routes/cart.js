import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Helper: Format cart response with totals
 */
const formatCartResponse = (cart) => {
  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  const totals = cart.items.reduce(
    (acc, item) => ({
      totalPrice: acc.totalPrice + item.price * item.quantity,
      totalItems: acc.totalItems + item.quantity,
    }),
    { totalPrice: 0, totalItems: 0 }
  );

  return {
    _id: cart._id,
    items: cart.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })),
    ...totals,
    updatedAt: cart.updatedAt,
  };
};

// 🛒 Get user's cart
router.get("/", requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price image description",
    });

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
});

// ➕ Add item to cart
router.post("/add", requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId).select("name price");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price image description",
    });

    res.status(200).json({
      success: true,
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
});

// ✏️ Update cart item quantity
router.put("/update/:itemId", requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required and must be 0 or greater",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      const product = await Product.findById(cart.items[itemIndex].product).select("price");
      if (product) {
        cart.items[itemIndex].price = product.price;
      }
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price image description",
    });

    res.status(200).json({
      success: true,
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
});

// ❌ Remove item from cart
router.delete("/remove/:itemId", requireAuth, async (req, res) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price image description",
    });

    res.status(200).json({
      success: true,
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
});

// 🧹 Clear entire cart
router.delete("/clear", requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
});

export default router;
