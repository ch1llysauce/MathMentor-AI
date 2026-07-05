// Seed diagnostic data for production database
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, DiagnosticResult } from './models/index.js';

dotenv.config();

const seedProductionDiagnostic = async () => {
  try {
    console.log('🌐 Connecting to production database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test user (or any existing user)
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('\n⚠️  No test user found. Creating one...');
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);
      
      user = await User.create({
        displayName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        gradeLevel: 10,
        focusAreas: ['Algebra', 'Geometry']
      });
      console.log('✅ Test user created');
    }

    console.log(`\n📊 Seeding diagnostic data for user: ${user.email}`);
    console.log(`User ID: ${user._id}`);

    // Clear existing diagnostic results for this user
    await DiagnosticResult.deleteMany({ user: user._id });
    console.log('🗑️  Cleared existing diagnostic data');

    // Generate 6 months of diagnostic data
    const diagnosticResults = [];
    const today = new Date();

    // Create monthly diagnostic results for 6 months
    for (let month = 5; month >= 0; month--) {
      const testDate = new Date(today);
      testDate.setMonth(testDate.getMonth() - month);

      // Generate improving scores over time
      const baseAlgebra = 50 + (5 - month) * 5 + Math.random() * 10;
      const baseGeometry = 45 + (5 - month) * 6 + Math.random() * 10;
      const baseTrig = 40 + (5 - month) * 7 + Math.random() * 10;

      const totalQuestions = 30;
      const algebraCorrect = Math.round((baseAlgebra / 100) * 10);
      const geometryCorrect = Math.round((baseGeometry / 100) * 10);
      const trigCorrect = Math.round((baseTrig / 100) * 10);
      const totalCorrect = algebraCorrect + geometryCorrect + trigCorrect;

      diagnosticResults.push({
        user: user._id,
        topicScores: {
          algebra: {
            score: Math.round(baseAlgebra),
            questionsAnswered: 10,
            correctAnswers: algebraCorrect,
            subtopicScores: {
              fractions: Math.round(baseAlgebra + Math.random() * 10 - 5),
              linearEquations: Math.round(baseAlgebra + Math.random() * 10 - 5),
              factoring: Math.round(baseAlgebra + Math.random() * 10 - 5)
            }
          },
          geometry: {
            score: Math.round(baseGeometry),
            questionsAnswered: 10,
            correctAnswers: geometryCorrect,
            subtopicScores: {
              angles: Math.round(baseGeometry + Math.random() * 10 - 5),
              triangles: Math.round(baseGeometry + Math.random() * 10 - 5),
              area: Math.round(baseGeometry + Math.random() * 10 - 5),
              basicCircles: Math.round(baseGeometry + Math.random() * 10 - 5)
            }
          },
          trigonometry: {
            score: Math.round(baseTrig),
            questionsAnswered: 10,
            correctAnswers: trigCorrect,
            subtopicScores: {
              sohCahToa: Math.round(baseTrig + Math.random() * 10 - 5),
              basicTrigRatios: Math.round(baseTrig + Math.random() * 10 - 5),
              simpleApplications: Math.round(baseTrig + Math.random() * 10 - 5)
            }
          }
        },
        algebraScore: Math.round(baseAlgebra),
        geometryScore: Math.round(baseGeometry),
        trigonometryScore: Math.round(baseTrig),
        weakTopics: [
          { topic: 'Algebra', subtopic: 'fractions', score: Math.round(baseAlgebra) },
          { topic: 'Trigonometry', subtopic: 'sohCahToa', score: Math.round(baseTrig) }
        ],
        strongTopics: [
          { topic: 'Geometry', subtopic: 'triangles', score: Math.round(baseGeometry) }
        ],
        totalQuestions,
        correctAnswers: totalCorrect,
        overallScore: Math.round((totalCorrect / totalQuestions) * 100),
        timeSpent: Math.floor(Math.random() * 600 + 900), // 15-25 minutes
        completedAt: testDate
      });
    }

    // Insert all diagnostic results
    await DiagnosticResult.insertMany(diagnosticResults);
    console.log(`✅ Created ${diagnosticResults.length} diagnostic results`);

    // Show summary
    console.log('\n📈 Data Summary:');
    console.log(`- Time period: 6 months`);
    console.log(`- Topics: Algebra, Geometry, Trigonometry`);
    console.log(`- Total records: ${diagnosticResults.length}`);

    console.log('\n✅ Production database seeded successfully!');
    console.log('\n📱 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    test@example.com');
    console.log('Password: TestPass123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedProductionDiagnostic();
