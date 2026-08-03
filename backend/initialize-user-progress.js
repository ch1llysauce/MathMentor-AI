// Initialize progress records for existing users
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Progress, Lesson } from './models/index.js';

dotenv.config();

const initializeProgress = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users\n`);

    if (users.length === 0) {
      console.log('❌ No users found. Register a user first.');
      process.exit(1);
    }

    // Get all unique topics and subtopics from lessons
    const lessons = await Lesson.find().distinct('topic');
    console.log(`📚 Found topics: ${lessons.join(', ')}\n`);

    let totalCreated = 0;

    for (const user of users) {
      console.log(`👤 Processing user: ${user.email}`);
      
      // Check if user already has progress
      const existingProgress = await Progress.countDocuments({ user: user._id });
      
      if (existingProgress > 0) {
        console.log(`   ⏭️  User already has ${existingProgress} progress records, skipping\n`);
        continue;
      }

      // Get all distinct subtopics for each topic
      for (const topic of lessons) {
        const subtopics = await Lesson.find({ topic }).distinct('subtopic');
        
        console.log(`   📖 Initializing ${subtopics.length} subtopics for ${topic}`);

        for (const subtopic of subtopics) {
          const progress = new Progress({
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

          await progress.save();
          totalCreated++;
        }
      }

      console.log(`   ✅ Created progress records for ${user.email}\n`);
    }

    console.log(`\n✅ Initialization complete!`);
    console.log(`   Total progress records created: ${totalCreated}`);
    console.log(`   Records per user: ~${Math.round(totalCreated / users.length)}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

initializeProgress();
