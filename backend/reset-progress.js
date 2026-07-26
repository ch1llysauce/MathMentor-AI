import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserLessonProgress from './models/UserLessonProgress.js';
import UserProblemAttempt from './models/UserProblemAttempt.js';
import User from './models/User.js';

dotenv.config();

const resetUserProgress = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('❌ MongoDB URI not found in environment variables!');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found!');
      process.exit(1);
    }

    console.log(`📋 Resetting progress for user: ${testUser.email}`);
    console.log(`   User ID: ${testUser._id}\n`);

    // Delete all lesson progress
    const lessonProgressResult = await UserLessonProgress.deleteMany({ 
      userId: testUser._id 
    });
    console.log(`🗑️  Deleted ${lessonProgressResult.deletedCount} lesson progress records`);

    // Delete all problem attempts
    const problemAttemptsResult = await UserProblemAttempt.deleteMany({ 
      userId: testUser._id 
    });
    console.log(`🗑️  Deleted ${problemAttemptsResult.deletedCount} problem attempt records`);

    console.log('\n✅ Progress reset complete!');
    console.log('👉 All lessons will now appear as not completed');
    console.log('👉 All practice problems will show as unattempted');

  } catch (error) {
    console.error('❌ Error resetting progress:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

resetUserProgress();
