import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/FoodExpress');
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminEmail = 'admin@foodexpress.com';
    const adminPassword = 'FoodExpress2024!';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      
      // Update existing user to be admin
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Create admin user
      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📧 Admin Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();