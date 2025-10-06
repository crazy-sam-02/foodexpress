import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { io } from "../server.js";

const router = express.Router();

// GET all categories with product counts
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          productCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    
    const productCount = await Product.countDocuments({ category: category.name });
    
    res.json({
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
    });

    const newCategory = await category.save();
    
    const categoryWithCount = {
      _id: newCategory._id,
      name: newCategory.name,
      description: newCategory.description,
      image: newCategory.image,
      productCount: 0,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    };
    
    // Emit socket event for real-time update
    io.emit("category:created", categoryWithCount);
    
    res.status(201).json(categoryWithCount);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category name already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const oldName = category.name;

    // Update category fields
    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.image !== undefined) category.image = req.body.image;

    const updatedCategory = await category.save();

    // If category name changed, update all products with old category name
    if (oldName !== updatedCategory.name) {
      await Product.updateMany(
        { category: oldName },
        { category: updatedCategory.name }
      );
    }

    const productCount = await Product.countDocuments({ category: updatedCategory.name });
    
    const categoryWithCount = {
      _id: updatedCategory._id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      image: updatedCategory.image,
      productCount,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };
    
    // Emit socket event for real-time update
    io.emit("category:updated", categoryWithCount);
    
    res.json(categoryWithCount);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Category name already exists" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${productCount} associated products. Please reassign or delete products first.` 
      });
    }

    await category.deleteOne();
    
    // Emit socket event for real-time update
    io.emit("category:deleted", req.params.id);
    
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;