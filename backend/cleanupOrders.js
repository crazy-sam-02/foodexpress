import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FoodExpress";

async function cleanupOrders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all orders
    const orders = await Order.find().populate('items.product');
    console.log(`Found ${orders.length} total orders`);

    let ordersWithNullProducts = 0;
    let itemsRemoved = 0;

    for (const order of orders) {
      const originalItemCount = order.items.length;
      
      // Filter out items with null products
      const validItems = order.items.filter(item => item.product !== null);
      
      if (validItems.length !== originalItemCount) {
        ordersWithNullProducts++;
        itemsRemoved += (originalItemCount - validItems.length);
        
        console.log(`Order ${order._id}: Removing ${originalItemCount - validItems.length} items with null products`);
        
        if (validItems.length === 0) {
          // If no valid items remain, delete the entire order
          await Order.findByIdAndDelete(order._id);
          console.log(`Deleted order ${order._id} - no valid items remaining`);
        } else {
          // Update the order with only valid items
          order.items = validItems;
          
          // Recalculate total based on remaining items
          let newTotal = 0;
          for (const item of validItems) {
            if (item.product && item.product.price) {
              newTotal += item.product.price * item.quantity;
            }
          }
          
          // Add tax and shipping (8% tax, ₹499 shipping under ₹500)
          const subtotal = newTotal;
          const tax = subtotal * 0.08;
          const shipping = subtotal > 500 ? 0 : 499;
          order.total = subtotal + tax + shipping;
          
          await order.save();
          console.log(`Updated order ${order._id} - new total: ₹${order.total.toFixed(2)}`);
        }
      }
    }

    console.log(`\nCleanup completed:`);
    console.log(`- Orders with null products: ${ordersWithNullProducts}`);
    console.log(`- Items removed: ${itemsRemoved}`);
    
    // List all available products
    const products = await Product.find();
    console.log(`\nAvailable products: ${products.length}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrders();