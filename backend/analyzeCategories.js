import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FoodExpress";

async function analyzeCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find();
    console.log(`\nFound ${categories.length} total categories:`);

    for (const category of categories) {
      const totalProducts = await Product.countDocuments({ category: category.name });
      const foodProducts = await Product.countDocuments({ 
        category: category.name, 
        productType: { $ne: 'medicine' } 
      });
      const medicineProducts = await Product.countDocuments({ 
        category: category.name, 
        productType: 'medicine' 
      });

      console.log(`\n📂 ${category.name}:`);
      console.log(`   - Total products: ${totalProducts}`);
      console.log(`   - Food products: ${foodProducts}`);
      console.log(`   - Medicine products: ${medicineProducts}`);
      console.log(`   - Category type: ${foodProducts > 0 ? (medicineProducts > 0 ? 'Mixed' : 'Food only') : 'Medicine only'}`);
    }

    // Get products by type
    const allProducts = await Product.find();
    const foodProducts = allProducts.filter(p => p.productType !== 'medicine');
    const medicineProducts = allProducts.filter(p => p.productType === 'medicine');

    console.log(`\n📊 Product Summary:`);
    console.log(`   - Total products: ${allProducts.length}`);
    console.log(`   - Food products: ${foodProducts.length}`);
    console.log(`   - Medicine products: ${medicineProducts.length}`);

    // List unique categories used by food products
    const foodCategories = [...new Set(foodProducts.map(p => p.category))];
    console.log(`\n🍰 Food categories (${foodCategories.length}):`);
    foodCategories.forEach(cat => console.log(`   - ${cat}`));

    // List unique categories used by medicine products
    const medicineCategories = [...new Set(medicineProducts.map(p => p.category))];
    console.log(`\n💊 Medicine categories (${medicineCategories.length}):`);
    medicineCategories.forEach(cat => console.log(`   - ${cat}`));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error during analysis:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the analysis
analyzeCategories();