// Comprehensive curriculum seeder following the structured format
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lesson, PracticeProblem } from './models/index.js';
import { CURRICULUM, getFlatLessonList } from './curriculum-structure.js';

dotenv.config();

const seedFullCurriculum = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Lesson.deleteMany({});
    await PracticeProblem.deleteMany({});
    console.log('🗑️  Cleared existing lessons and problems');

    const allLessons = [];
    let lessonCounter = 0;

    // Generate lessons for all subjects
    for (const [subject, data] of Object.entries(CURRICULUM)) {
      console.log(`\n📚 Processing ${subject}...`);
      
      for (const module of data.modules) {
        console.log(`  Module ${module.moduleNumber}: ${module.moduleName}`);
        
        for (const lesson of module.lessons) {
          lessonCounter++;
          
          const lessonDoc = {
            topic: subject,
            subtopic: `Module ${module.moduleNumber}: ${module.moduleName}`,
            order: lessonCounter,
            title: lesson.title,
            description: `Learn ${lesson.title} - ${lesson.learningObjectives[0]}`,
            difficulty: module.moduleNumber <= 3 ? 'Beginner' : 
                       module.moduleNumber <= 7 ? 'Intermediate' : 'Advanced',
            content: {
              introduction: `Welcome to ${lesson.title}. In this lesson, you will master key concepts that build your understanding of ${subject}.`,
              sections: [
                {
                  title: 'Learning Objectives',
                  content: lesson.learningObjectives.join('; '),
                  examples: [
                    {
                      problem: `Sample problem for ${lesson.title}`,
                      solution: 'Detailed solution will be provided',
                      steps: ['Step 1: Understand the problem', 'Step 2: Apply concepts', 'Step 3: Verify answer']
                    }
                  ]
                },
                {
                  title: 'Key Concepts',
                  content: `This section covers the fundamental principles of ${lesson.title}.`,
                  examples: []
                }
              ],
              summary: `You have completed ${lesson.title}. Make sure you understand all learning objectives before moving on.`,
              keyTakeaways: lesson.learningObjectives
            },
            learningObjectives: lesson.learningObjectives,
            moduleNumber: module.moduleNumber,
            moduleName: module.moduleName,
            estimatedTime: 15 + (module.moduleNumber * 2), // Scales with complexity
            isLocked: false
          };
          
          allLessons.push(lessonDoc);
        }
      }
    }

    // Insert all lessons
    const insertedLessons = await Lesson.insertMany(allLessons);
    console.log(`\n✅ Created ${insertedLessons.length} lessons`);

    // Create sample practice problems for each subject
    const problems = [];
    
    // Get some sample lessons to attach problems to
    const algebraLessons = insertedLessons.filter(l => l.topic === 'Algebra').slice(0, 5);
    const geometryLessons = insertedLessons.filter(l => l.topic === 'Geometry').slice(0, 5);
    const trigLessons = insertedLessons.filter(l => l.topic === 'Trigonometry').slice(0, 5);

    // Helper to create problems
    const createProblemsForLesson = (lesson, count = 3) => {
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const problemsForLesson = [];
      
      for (let i = 0; i < Math.min(count, difficulties.length); i++) {
        problemsForLesson.push({
          topic: lesson.topic,
          subtopic: lesson.subtopic,
          lessonId: lesson._id,
          difficulty: difficulties[i],
          type: 'multiple-choice',
          problem: {
            text: `${difficulties[i]} problem for ${lesson.title}`,
            latex: null
          },
          options: [
            { text: 'Option A (Correct)', isCorrect: true },
            { text: 'Option B', isCorrect: false },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false }
          ],
          explanation: `This problem tests: ${lesson.learningObjectives[0]}`,
          solution: {
            steps: ['Analyze the problem', 'Apply the concept', 'Verify the answer'],
            finalAnswer: 'Option A'
          },
          hints: ['Start by reviewing the concept', 'Apply the formula', 'Check your work'],
          points: difficulties[i] === 'Easy' ? 10 : difficulties[i] === 'Medium' ? 15 : 20,
          learningObjective: lesson.learningObjectives[0]
        });
      }
      
      return problemsForLesson;
    };

    // Create problems for sample lessons
    [...algebraLessons, ...geometryLessons, ...trigLessons].forEach(lesson => {
      problems.push(...createProblemsForLesson(lesson));
    });

    const insertedProblems = await PracticeProblem.insertMany(problems);
    console.log(`✅ Created ${insertedProblems.length} practice problems`);

    // Print summary
    console.log('\n📊 CURRICULUM SUMMARY:');
    console.log('═══════════════════════════════════════════════');
    
    for (const [subject, data] of Object.entries(CURRICULUM)) {
      const subjectLessons = insertedLessons.filter(l => l.topic === subject);
      console.log(`\n${subject}: ${data.modules.length} modules, ${subjectLessons.length} lessons`);
      
      data.modules.forEach(module => {
        console.log(`  Module ${module.moduleNumber}: ${module.moduleName} (${module.lessons.length} lessons)`);
        module.lessons.forEach(lesson => {
          console.log(`    ${lesson.order}. ${lesson.title}`);
        });
      });
    }

    console.log('\n✅ Full curriculum seeding complete!');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedFullCurriculum();
