import mongoose from "mongoose";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/FoodExpress");
    console.log("✅ MongoDB connected for seeding");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

// Sample medicine categories
const medicineCategories = [
  { name: "Pain Relief", description: "Medicines for pain management and relief" },
  { name: "Cold & Flu", description: "Medicines for cold, flu, and respiratory symptoms" },
  { name: "Vitamins", description: "Vitamins and nutritional supplements" },
  { name: "First Aid", description: "First aid supplies and emergency medicines" },
  { name: "Prescription", description: "Prescription medicines requiring doctor's prescription" }
];

// Sample medicine products
const medicineProducts = [
  {
    name: "Paracetamol 500mg",
    description: "Effective pain relief and fever reducer. Safe for adults and children over 12 years.",
    price: 25.99,
    category: "Pain Relief",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 124,
    tags: ["pain-relief", "fever", "headache", "analgesic"],
    requiresPrescription: false,
    manufacturer: "HealthCorp Pharmaceuticals",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Vitamin D3 Tablets 1000 IU",
    description: "Essential vitamin D supplement for bone health and immune system support.",
    price: 45.50,
    category: "Vitamins",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 89,
    tags: ["vitamins", "supplements", "bone-health", "immunity"],
    requiresPrescription: false,
    manufacturer: "VitaLife Sciences",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Cough Syrup 120ml",
    description: "Fast-acting cough relief syrup with natural honey. Suitable for dry and productive cough.",
    price: 35.75,
    category: "Cold & Flu",
    image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 67,
    tags: ["cough", "cold", "flu", "respiratory"],
    requiresPrescription: false,
    manufacturer: "MediCure Labs",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Complete First Aid Kit",
    description: "Comprehensive first aid kit containing bandages, antiseptic, thermometer, and emergency supplies.",
    price: 125.99,
    category: "First Aid",
    image: "https://images.unsplash.com/photo-1603398938059-e8bb4d2bb74e?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 156,
    tags: ["first-aid", "emergency", "bandages", "safety"],
    requiresPrescription: false,
    manufacturer: "SafeGuard Medical",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Antibiotic Cream 15g",
    description: "Topical antibiotic cream for wound care and infection prevention. Prescription required.",
    price: 18.25,
    category: "Prescription",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031d8d8?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 43,
    tags: ["antibiotic", "wound-care", "topical", "prescription"],
    requiresPrescription: true,
    manufacturer: "PharmaCare International",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Multivitamin Gummies 60 Count",
    description: "Delicious gummy vitamins for daily nutrition. Contains essential vitamins and minerals.",
    price: 55.99,
    category: "Vitamins",
    image: "https://images.unsplash.com/photo-1556909114-4f6e5d7d3a5f?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 78,
    tags: ["vitamins", "gummies", "multivitamin", "daily-nutrition"],
    requiresPrescription: false,
    manufacturer: "NutriGummy Health",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Digital Thermometer",
    description: "Accurate digital thermometer with fever alert. Fast 10-second reading.",
    price: 12.99,
    category: "First Aid",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 92,
    tags: ["thermometer", "temperature", "fever", "medical-device"],
    requiresPrescription: false,
    manufacturer: "MediTech Solutions",
    productType: "medicine",
    inStock: true
  },
  {
    name: "Ibuprofen 400mg",
    description: "Anti-inflammatory pain reliever for headaches, muscle pain, and inflammation.",
    price: 28.50,
    category: "Pain Relief",
    image: "https://images.unsplash.com/photo-1585435421519-2d287d942910?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 134,
    tags: ["anti-inflammatory", "pain-relief", "headache", "muscle-pain"],
    requiresPrescription: false,
    manufacturer: "HealthCorp Pharmaceuticals",
    productType: "medicine",
    inStock: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...");

    // Clear existing medicine data
    await Product.deleteMany({ productType: "medicine" });
    console.log("🧹 Cleared existing medicine products");

    // Add medicine categories (only if they don't exist)
    for (const categoryData of medicineCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Added category: ${categoryData.name}`);
      } else {
        console.log(`⏭️ Category already exists: ${categoryData.name}`);
      }
    }

    // Add medicine products
    await Product.insertMany(medicineProducts);
    console.log(`✅ Added ${medicineProducts.length} medicine products`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();