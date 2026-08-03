// Test script to verify production API is working
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import { User, Progress, Lesson, PracticeProblem, DiagnosticResult } from './models/index.js';

dotenv.config();

const PRODUCTION_URL = 'https://mathmentor-ai-i8sl.onrender.com/api';

const testProductionAPI = async () => {
  try {
    console.log('🌐 Connecting to production database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check database collections
    console.log('📊 Checking database collections...');
    const userCount = await User.countDocuments();
    const progressCount = await Progress.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    const problemCount = await PracticeProblem.countDocuments();
    const diagnosticCount = await DiagnosticResult.countDocuments();

    console.log(`  Users: ${userCount}`);
    console.log(`  Progress records: ${progressCount}`);
    console.log(`  Lessons: ${lessonCount}`);
    console.log(`  Practice Problems: ${problemCount}`);
    console.log(`  Diagnostic Results: ${diagnosticCount}\n`);

    if (userCount === 0) {
      console.log('⚠️  WARNING: No users found in database!');
      console.log('   You need to register a user first.\n');
    }

    if (lessonCount === 0) {
      console.log('⚠️  WARNING: No lessons found in database!');
      console.log('   Run: npm run seed:full\n');
    }

    if (problemCount === 0) {
      console.log('⚠️  WARNING: No practice problems found!');
      console.log('   Run: npm run seed:full\n');
    }

    // Test API endpoints (without auth for public endpoints)
    console.log('🔌 Testing API endpoints...\n');

    // Test 1: Root endpoint
    try {
      const rootResponse = await axios.get('https://mathmentor-ai-i8sl.onrender.com/');
      console.log('✅ Root endpoint working');
      console.log('   Response:', rootResponse.data.message);
    } catch (error) {
      console.log('❌ Root endpoint failed:', error.message);
    }

    // Test 2: Health check
    try {
      const healthResponse = await axios.get('https://mathmentor-ai-i8sl.onrender.com/health');
      console.log('✅ Health endpoint working');
      console.log('   Status:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
    }

    // Test with a real user if exists
    if (userCount > 0) {
      console.log('\n🔐 Testing with existing user...');
      const testUser = await User.findOne();
      console.log(`   Found user: ${testUser.email}`);

      // Try to login
      try {
        const loginResponse = await axios.post(`${PRODUCTION_URL}/auth/login`, {
          email: testUser.email,
          password: 'test123' // You'll need to know the actual password
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Test authenticated endpoint
        try {
          const summaryResponse = await axios.get(`${PRODUCTION_URL}/progress/stats/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Progress summary endpoint working');
          console.log('   Data:', JSON.stringify(summaryResponse.data.data, null, 2));
        } catch (error) {
          console.log('❌ Progress summary failed:', error.response?.data || error.message);
        }

      } catch (error) {
        console.log('⚠️  Login failed (this is expected if password is wrong)');
        console.log('   Try registering a new user or use the correct password');
      }
    }

    console.log('\n📝 Summary:');
    console.log('   Database connection: ✅');
    console.log(`   Users in DB: ${userCount}`);
    console.log(`   Lessons in DB: ${lessonCount}`);
    console.log(`   Problems in DB: ${problemCount}`);
    
    if (lessonCount === 0 || problemCount === 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Run: npm run seed:full');
      console.log('   2. Register a user in the mobile app');
      console.log('   3. Try the dashboard again');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

testProductionAPI();
