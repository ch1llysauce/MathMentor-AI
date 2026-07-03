// Create a test user for testing login
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/index.js';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@example.com';
    const testPassword = 'TestPass123';

    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log('\n⚠️  User already exists!');
      console.log('Email:', testEmail);
      console.log('\nUpdating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('✅ Password updated!');
    } else {
      console.log('\n📝 Creating new test user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);

      // Create user
      const user = await User.create({
        displayName: 'Test User',
        email: testEmail,
        password: hashedPassword,
        gradeLevel: 10,
        focusAreas: ['Algebra', 'Geometry']
      });

      console.log('✅ Test user created!');
      console.log('User ID:', user._id);
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', testEmail);
    console.log('Password: ', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
