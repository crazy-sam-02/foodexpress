import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get all categories with product counts
router.get("/", async (req, res) => {
  try {
    // Aggregate to count products in each category directly in MongoDB
    const categoriesWithCounts = await Category.aggregate([
      {
        $lookup: {
          from: 'products', // The name of the products collection
          localField: 'name', // Field in the categories collection
          foreignField: 'category', // Field in the products collection
          as: 'productsInCategory' // Alias for the joined products
        }
      },
      {
        $addFields: {
          productCount: { $size: '$productsInCategory' } // Count the number of products in each category
        }
      },
      {
        $project: { productsInCategory: 0 } // Exclude the productsInCategory array from the results
      }
    ]);

    res.status(200).json(categoriesWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a category
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
