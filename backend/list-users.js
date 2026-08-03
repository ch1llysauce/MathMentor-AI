// List all users in the database
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/index.js';

dotenv.config();

const listUsers = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find().select('email displayName createdAt');
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.displayName}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}\n`);
    });

    console.log('⚠️  Note: Passwords are hashed and cannot be retrieved.');
    console.log('   You need to either:');
    console.log('   1. Use a password you remember for these accounts');
    console.log('   2. Register a new account in the mobile app\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
