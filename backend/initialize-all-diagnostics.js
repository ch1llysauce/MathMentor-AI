// Create diagnostic results for all users who don't have one
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, DiagnosticResult } from './models/index.js';

dotenv.config();

const initializeAllDiagnostics = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users\n`);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if user already has diagnostic
      const existing = await DiagnosticResult.findOne({ user: user._id });
      
      if (existing) {
        console.log(`⏭️  ${user.email} - Already has diagnostic (${existing.overallScore}%)`);
        skipped++;
        continue;
      }

      // Generate varied but realistic scores
      const algebraScore = Math.floor(Math.random() * 30) + 55; // 55-85
      const geometryScore = Math.floor(Math.random() * 30) + 50; // 50-80
      const trigonometryScore = Math.floor(Math.random() * 30) + 55; // 55-85
      const overallScore = Math.round((algebraScore + geometryScore + trigonometryScore) / 3);

      // Create diagnostic
      const diagnostic = await DiagnosticResult.create({
        user: user._id,
        overallScore,
        algebraScore,
        geometryScore,
        trigonometryScore,
        totalQuestions: 30,
        correctAnswers: Math.round((overallScore / 100) * 30),
        timeSpent: 1500 + Math.floor(Math.random() * 900), // 25-40 minutes
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random in last week
        weakTopics: [
          {
            topic: 'Geometry',
            subtopic: 'Triangles',
            score: Math.floor(Math.random() * 20) + 40,
            questionsAnswered: 5,
            correctAnswers: 2
          },
          {
            topic: 'Algebra',
            subtopic: 'Quadratic Equations',
            score: Math.floor(Math.random() * 20) + 45,
            questionsAnswered: 6,
            correctAnswers: 3
          }
        ],
        strongTopics: [
          {
            topic: 'Algebra',
            subtopic: 'Linear Equations',
            score: Math.floor(Math.random() * 15) + 85,
            questionsAnswered: 5,
            correctAnswers: 4
          },
          {
            topic: 'Trigonometry',
            subtopic: 'Basic Ratios',
            score: Math.floor(Math.random() * 15) + 80,
            questionsAnswered: 5,
            correctAnswers: 4
          }
        ],
        recommendations: [
          'Focus on Geometry fundamentals',
          'Practice more Quadratic Equations',
          'Maintain strong skills in Linear Equations'
        ]
      });

      console.log(`✅ ${user.email} - Created (Overall: ${overallScore}%, A:${algebraScore}% G:${geometryScore}% T:${trigonometryScore}%)`);
      created++;
    }

    console.log('\n═══════════════════════════════════════');
    console.log('   SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`   Total users:              ${users.length}`);
    console.log(`   Diagnostics created:      ${created}`);
    console.log(`   Already had diagnostics:  ${skipped}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 All users can now view diagnostic dashboard!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

initializeAllDiagnostics();
