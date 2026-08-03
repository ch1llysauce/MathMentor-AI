// Create a diagnostic result for demo user
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, DiagnosticResult } from './models/index.js';

dotenv.config();

const createDemoDiagnostic = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@mathmentor.ai' });
    
    if (!demoUser) {
      console.log('❌ Demo user not found. Run create-test-user-with-password.js first.');
      process.exit(1);
    }

    // Check if diagnostic already exists
    const existing = await DiagnosticResult.findOne({ user: demoUser._id });
    
    if (existing) {
      console.log('⚠️  Diagnostic result already exists for demo user!');
      console.log(`   Overall Score: ${existing.overallScore}%`);
      console.log(`   Algebra: ${existing.algebraScore}%`);
      console.log(`   Geometry: ${existing.geometryScore}%`);
      console.log(`   Trigonometry: ${existing.trigonometryScore}%\n`);
      await mongoose.connection.close();
      process.exit(0);
      return;
    }

    console.log('📊 Creating diagnostic result for demo user...\n');

    // Create realistic diagnostic result
    const diagnostic = await DiagnosticResult.create({
      user: demoUser._id,
      overallScore: 65,
      algebraScore: 70,
      geometryScore: 55,
      trigonometryScore: 70,
      totalQuestions: 30,
      correctAnswers: 20,
      timeSpent: 1800, // 30 minutes
      completedAt: new Date(),
      weakTopics: [
        {
          topic: 'Geometry',
          subtopic: 'Triangles',
          score: 40,
          questionsAnswered: 5,
          correctAnswers: 2
        },
        {
          topic: 'Geometry',
          subtopic: 'Circles',
          score: 50,
          questionsAnswered: 4,
          correctAnswers: 2
        },
        {
          topic: 'Algebra',
          subtopic: 'Quadratic Equations',
          score: 55,
          questionsAnswered: 6,
          correctAnswers: 3
        }
      ],
      strongTopics: [
        {
          topic: 'Algebra',
          subtopic: 'Linear Equations',
          score: 90,
          questionsAnswered: 5,
          correctAnswers: 4
        },
        {
          topic: 'Trigonometry',
          subtopic: 'Basic Ratios',
          score: 85,
          questionsAnswered: 5,
          correctAnswers: 4
        }
      ],
      recommendations: [
        'Focus on Geometry fundamentals, especially Triangles',
        'Practice more Quadratic Equations problems',
        'Maintain strong skills in Linear Equations'
      ]
    });

    console.log('✅ Diagnostic result created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('   DIAGNOSTIC RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`   Overall Score:    ${diagnostic.overallScore}%`);
    console.log(`   Algebra:          ${diagnostic.algebraScore}%`);
    console.log(`   Geometry:         ${diagnostic.geometryScore}%`);
    console.log(`   Trigonometry:     ${diagnostic.trigonometryScore}%`);
    console.log('═══════════════════════════════════════');
    console.log(`\n   Weak Topics: ${diagnostic.weakTopics.length}`);
    console.log(`   Strong Topics: ${diagnostic.strongTopics.length}\n`);

    console.log('🎉 Demo user can now view diagnostic dashboard!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

createDemoDiagnostic();
