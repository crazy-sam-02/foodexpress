import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FoodExpress";

async function checkFoodProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all food products
    const foodProducts = await Product.find({ productType: { $ne: 'medicine' } });
    
    console.log(`\n🍰 Found ${foodProducts.length} food products:`);
    
    // Group by category
    const productsByCategory = {};
    foodProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product.name);
    });

    // Display by category
    Object.keys(productsByCategory).forEach(category => {
      console.log(`\n📂 ${category} (${productsByCategory[category].length} products):`);
      productsByCategory[category].forEach(name => {
        console.log(`   - ${name}`);
      });
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkFoodProducts();