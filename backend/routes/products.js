import express from "express";
import Product from "../models/Product.js";
import { io } from "../server.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const { productType } = req.query;
    let query = {};
    
    if (productType) {
      query.productType = productType;
    }
    
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET medicines only
router.get("/medicines", async (req, res) => {
  try {
    const medicines = await Product.find({ productType: 'medicine' });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE product
router.post("/", async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      inStock: req.body.inStock ?? true,
      rating: req.body.rating || 0,
      reviews: req.body.reviews || 0,
      tags: req.body.tags || [],
      // Medicine-specific fields
      requiresPrescription: req.body.requiresPrescription || false,
      manufacturer: req.body.manufacturer,
      productType: req.body.productType || 'food',
    });

    const newProduct = await product.save();
    
    // Emit socket event for real-time update
    io.emit("product:created", newProduct);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    });

    const updatedProduct = await product.save();
    
    // Emit socket event for real-time update
    io.emit("product:updated", updatedProduct);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    
    // Emit socket event for real-time update
    io.emit("product:deleted", req.params.id);
    
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TOGGLE stock status
router.patch("/:id/stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.inStock = !product.inStock;
    const updatedProduct = await product.save();
    
    // Emit socket event for real-time update
    io.emit("product:updated", updatedProduct);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;