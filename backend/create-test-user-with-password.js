// Create a test user with known password
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Progress, Lesson } from './models/index.js';

dotenv.config();

const createTestUser = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testEmail = 'demo@mathmentor.ai';
    const testPassword = 'Demo123!';

    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log('\n✅ You can use these credentials to log in!\n');
      await mongoose.connection.close();
      process.exit(0);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    // Create user
    const user = await User.create({
      email: testEmail,
      password: hashedPassword,
      displayName: 'Demo User',
      focusAreas: ['Algebra', 'Geometry'],
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTime: 0,
      lastActiveDate: new Date()
    });

    console.log('✅ Test user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('   LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log(`   Email:    ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('═══════════════════════════════════════\n');

    // Initialize progress for the user
    console.log('📊 Initializing progress records...');
    
    const topics = await Lesson.find().distinct('topic');
    let progressCount = 0;

    for (const topic of topics) {
      const subtopics = await Lesson.find({ topic }).distinct('subtopic');
      
      for (const subtopic of subtopics) {
        await Progress.create({
          user: user._id,
          topic,
          subtopic,
          masteryLevel: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          accuracy: 0,
          lastPracticed: new Date(),
          difficultyLevel: 'Medium',
          strengths: [],
          weaknesses: []
        });
        progressCount++;
      }
    }

    console.log(`✅ Created ${progressCount} progress records\n`);
    console.log('🎉 All set! Use the credentials above to log in.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
