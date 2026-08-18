import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Lesson from './models/Lesson.js';

dotenv.config();

/**
 * Script to audit and fix mathematically inconsistent examples in lesson content.
 * Synchronizes the 'solution' field with the final step from 'steps' array.
 */
const auditAndFixLessons = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in .env');
    process.exit(1);
  }

  console.log('🌐 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  const lessons = await Lesson.find({ 'content.sections': { $exists: true, $ne: [] } });
  console.log(`📚 Auditing ${lessons.length} lessons...`);

  let fixedCount = 0;

  for (const lesson of lessons) {
    let lessonModified = false;

    if (!lesson.content?.sections) continue;

    for (const section of lesson.content.sections) {
      if (!section.examples || !Array.isArray(section.examples)) continue;

      for (const ex of section.examples) {
        if (!ex.steps || !Array.isArray(ex.steps) || ex.steps.length === 0) continue;

        // Specific Fix: Logarithmic conversion 3^2 = 9
        if (ex.problem && (ex.problem.includes('3^2 = 9') || ex.problem.toLowerCase().includes('to logarithmic form'))) {
          ex.problem = 'Convert the exponential equation 3^2 = 9 to logarithmic form.';
          ex.steps = [
            'Identify the base (b = 3), exponent (y = 2), and value (x = 9).',
            'Apply the logarithm definition: b^y = x ⇔ log_b(x) = y.',
            'Substitute the values into the logarithmic form: log_3(9) = 2.'
          ];
          ex.solution = 'log_3(9) = 2';
          lessonModified = true;
          fixedCount++;
          console.log(`  🔧 Fixed logarithmic form in lesson "${lesson.title}" -> Solution: \\log_3(9) = 2`);
          continue;
        }

        // Generic Audit: Try to extract final step value and match with solution
        const lastStep = ex.steps[ex.steps.length - 1];
        
        // Match patterns like "Answer: (-2, 8)", "x = 5", "notation: (2, 8)", "is 42"
        const match = lastStep.match(/(?:solution|notation|answer|is|:)\s*(\([-\d\s,.]+\)|[-\d\w\s./^√=+-]+)$/i);
        if (match && match[1]) {
          const derivedSolution = match[1].trim();
          // If ex.solution is radically different from derivedSolution (e.g. (-8, 11) vs (-2, 8))
          if (ex.solution && derivedSolution && ex.solution.trim() !== derivedSolution) {
            console.log(`  ⚠️  Mismatch in "${lesson.title}" (${ex.problem}):`);
            console.log(`      Current solution : "${ex.solution}"`);
            console.log(`      Derived from step: "${derivedSolution}"`);
            ex.solution = derivedSolution;
            lessonModified = true;
            fixedCount++;
          }
        }
      }
    }

    if (lessonModified) {
      await lesson.save();
    }
  }

  console.log(`\n🎉 Audit complete. Fixed ${fixedCount} example solutions.`);
  await mongoose.connection.close();
  process.exit(0);
};

auditAndFixLessons().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
