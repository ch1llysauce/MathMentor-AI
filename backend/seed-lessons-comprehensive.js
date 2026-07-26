// Seed comprehensive lessons and practice problems
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lesson, PracticeProblem } from './models/index.js';

dotenv.config();

const seedLessons = async () => {
  try {
    console.log('🌐 Connecting to production database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing lessons and problems
    await Lesson.deleteMany({});
    await PracticeProblem.deleteMany({});
    console.log('🗑️  Cleared existing lessons and problems');

    // Comprehensive lesson data for all three topics
    const sampleLessons = [
      // ALGEBRA LESSON 1
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        order: 1,
        title: 'Introduction to Linear Equations',
        description: 'Learn the basics of linear equations and how to solve them',
        difficulty: 'Beginner',
        content: {
          introduction: 'Linear equations are algebraic equations where each term is either a constant or the product of a constant and a single variable.',
          sections: [
            {
              title: 'What is a Linear Equation?',
              content: 'A linear equation is an equation that can be written in the form ax + b = c.',
              examples: [
                {
                  problem: 'Solve for x: 2x + 5 = 13',
                  solution: 'x = 4',
                  steps: ['Subtract 5 from both sides: 2x = 8', 'Divide both sides by 2: x = 4']
                }
              ]
            }
          ],
          summary: 'Linear equations are fundamental to algebra.',
          keyTakeaways: ['Linear equations have one variable', 'Use inverse operations', 'Always check your answer']
        },
        estimatedTime: 15
      },
      // ALGEBRA LESSON 2
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        order: 2,
        title: 'Multi-Step Linear Equations',
        description: 'Learn to solve complex linear equations',
        difficulty: 'Intermediate',
        content: {
          introduction: 'Multi-step linear equations require several operations to solve.',
          sections: [
            {
              title: 'Combining Like Terms',
              content: 'Simplify before solving.',
              examples: [
                {
                  problem: 'Solve: 2x + 3x - 5 = 20',
                  solution: 'x = 5',
                  steps: ['Combine like terms: 5x - 5 = 20', 'Add 5: 5x = 25', 'Divide by 5: x = 5']
                }
              ]
            }
          ],
          summary: 'Multi-step equations require patience.',
          keyTakeaways: ['Simplify first', 'Follow order of operations', 'Check your work']
        },
        estimatedTime: 20
      },
      // GEOMETRY LESSON 1
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        order: 1,
        title: 'Triangle Basics',
        description: 'Learn about types of triangles and their properties',
        difficulty: 'Beginner',
        content: {
          introduction: 'Triangles are three-sided polygons with many unique properties.',
          sections: [
            {
              title: 'Types of Triangles',
              content: 'Triangles can be classified by sides or angles.',
              examples: [
                {
                  problem: 'What type has sides 5, 5, 8?',
                  solution: 'Isosceles',
                  steps: ['Two sides equal', 'This is isosceles']
                }
              ]
            }
          ],
          summary: 'Understanding triangles is essential.',
          keyTakeaways: ['All triangles have 3 sides', 'Angles sum to 180 degrees', 'Multiple classifications exist']
        },
        estimatedTime: 18
      },
      // GEOMETRY LESSON 2
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        order: 2,
        title: 'Pythagorean Theorem',
        description: 'Master the Pythagorean theorem',
        difficulty: 'Intermediate',
        content: {
          introduction: 'The Pythagorean theorem relates the sides of a right triangle.',
          sections: [
            {
              title: 'Understanding the Theorem',
              content: 'In a right triangle, a² + b² = c²',
              examples: [
                {
                  problem: 'Find hypotenuse if legs are 3 and 4',
                  solution: '5',
                  steps: ['Use a² + b² = c²', '9 + 16 = c²', '25 = c²', 'c = 5']
                }
              ]
            }
          ],
          summary: 'The Pythagorean theorem is very useful.',
          keyTakeaways: ['Only for right triangles', 'a² + b² = c²', 'Common triples: 3-4-5']
        },
        estimatedTime: 22
      },
      // TRIGONOMETRY LESSON 1
      {
        topic: 'Trigonometry',
        subtopic: 'Basic Ratios',
        order: 1,
        title: 'Sine, Cosine, and Tangent',
        description: 'Learn the three basic trig ratios',
        difficulty: 'Beginner',
        content: {
          introduction: 'Trigonometry studies relationships between angles and sides.',
          sections: [
            {
              title: 'SOH-CAH-TOA',
              content: 'Sine = Opposite/Hypotenuse, Cosine = Adjacent/Hypotenuse, Tangent = Opposite/Adjacent',
              examples: [
                {
                  problem: 'If opposite = 3, hypotenuse = 5, find sin',
                  solution: '0.6',
                  steps: ['sin = opposite/hypotenuse', 'sin = 3/5', 'sin = 0.6']
                }
              ]
            }
          ],
          summary: 'The three basic ratios are essential.',
          keyTakeaways: ['SOH-CAH-TOA', 'sin = opp/hyp', 'cos = adj/hyp', 'tan = opp/adj']
        },
        estimatedTime: 20
      }
    ];

    // Insert lessons
    const createdLessons = await Lesson.insertMany(sampleLessons);
    console.log(`✅ Created ${createdLessons.length} lessons`);

    // Get lesson references
    const algebraLesson1 = createdLessons.find(l => l.topic === 'Algebra' && l.order === 1);
    const algebraLesson2 = createdLessons.find(l => l.topic === 'Algebra' && l.order === 2);
    const geometryLesson1 = createdLessons.find(l => l.topic === 'Geometry' && l.order === 1);
    const geometryLesson2 = createdLessons.find(l => l.topic === 'Geometry' && l.order === 2);
    const trigLesson1 = createdLessons.find(l => l.topic === 'Trigonometry' && l.order === 1);

    // Comprehensive practice problems
    const sampleProblems = [
      // ALGEBRA EASY PROBLEMS
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: x + 5 = 12' },
        correctAnswer: 'x = 7',
        options: [
          { text: 'x = 7', isCorrect: true },
          { text: 'x = 17', isCorrect: false },
          { text: 'x = 5', isCorrect: false },
          { text: 'x = 12', isCorrect: false }
        ],
        explanation: 'To solve x + 5 = 12, subtract 5 from both sides: x = 7',
        solution: { steps: ['Subtract 5 from both sides', 'x = 12 - 5', 'x = 7'], finalAnswer: 'x = 7' },
        hints: ['What undoes addition?', 'Subtract 5 from both sides'],
        points: 10
      },
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: 2x = 10' },
        correctAnswer: 'x = 5',
        options: [
          { text: 'x = 5', isCorrect: true },
          { text: 'x = 20', isCorrect: false },
          { text: 'x = 2', isCorrect: false },
          { text: 'x = 12', isCorrect: false }
        ],
        explanation: 'To solve 2x = 10, divide both sides by 2: x = 5',
        solution: { steps: ['Divide both sides by 2', 'x = 10 / 2', 'x = 5'], finalAnswer: 'x = 5' },
        hints: ['What undoes multiplication?', 'Divide both sides by 2'],
        points: 10
      },
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: x - 8 = 15' },
        correctAnswer: 'x = 23',
        options: [
          { text: 'x = 23', isCorrect: true },
          { text: 'x = 7', isCorrect: false },
          { text: 'x = -7', isCorrect: false },
          { text: 'x = 15', isCorrect: false }
        ],
        explanation: 'To solve x - 8 = 15, add 8 to both sides: x = 23',
        solution: { steps: ['Add 8 to both sides', 'x = 15 + 8', 'x = 23'], finalAnswer: 'x = 23' },
        hints: ['What undoes subtraction?', 'Add 8 to both sides'],
        points: 10
      },
      // ALGEBRA MEDIUM PROBLEMS
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson1._id,
        difficulty: 'Medium',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: 3x + 4 = 19' },
        correctAnswer: 'x = 5',
        options: [
          { text: 'x = 5', isCorrect: true },
          { text: 'x = 15', isCorrect: false },
          { text: 'x = 7', isCorrect: false },
          { text: 'x = 23', isCorrect: false }
        ],
        explanation: 'First subtract 4 (3x = 15), then divide by 3 (x = 5)',
        solution: { steps: ['Subtract 4: 3x = 15', 'Divide by 3', 'x = 5'], finalAnswer: 'x = 5' },
        hints: ['Isolate the term with x', 'Subtract 4', 'Then divide by 3'],
        points: 15
      },
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson2._id,
        difficulty: 'Medium',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: 2x + 3x = 25' },
        correctAnswer: 'x = 5',
        options: [
          { text: 'x = 5', isCorrect: true },
          { text: 'x = 10', isCorrect: false },
          { text: 'x = 25', isCorrect: false },
          { text: 'x = 8', isCorrect: false }
        ],
        explanation: 'Combine like terms: 5x = 25, so x = 5',
        solution: { steps: ['Combine: 5x = 25', 'Divide by 5', 'x = 5'], finalAnswer: 'x = 5' },
        hints: ['Combine 2x + 3x', 'Then divide'],
        points: 15
      },
      // ALGEBRA HARD PROBLEMS
      {
        topic: 'Algebra',
        subtopic: 'Linear Equations',
        lessonId: algebraLesson2._id,
        difficulty: 'Hard',
        type: 'multiple-choice',
        problem: { text: 'Solve for x: 2(x + 3) = 5x - 9' },
        correctAnswer: 'x = 5',
        options: [
          { text: 'x = 5', isCorrect: true },
          { text: 'x = 3', isCorrect: false },
          { text: 'x = -5', isCorrect: false },
          { text: 'x = 7', isCorrect: false }
        ],
        explanation: 'Expand to get 2x + 6 = 5x - 9, solve to get x = 5',
        solution: { steps: ['Expand: 2x + 6 = 5x - 9', 'Subtract 2x: 6 = 3x - 9', 'Add 9: 15 = 3x', 'x = 5'], finalAnswer: 'x = 5' },
        hints: ['Use distributive property', 'Move x terms to one side'],
        points: 20
      },
      // GEOMETRY EASY PROBLEMS
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        lessonId: geometryLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'Two angles of a triangle are 50 and 60 degrees. Find the third angle.' },
        correctAnswer: '70 degrees',
        options: [
          { text: '70 degrees', isCorrect: true },
          { text: '110 degrees', isCorrect: false },
          { text: '180 degrees', isCorrect: false },
          { text: '100 degrees', isCorrect: false }
        ],
        explanation: 'Sum of angles is 180. So 180 - 50 - 60 = 70',
        solution: { steps: ['Sum = 180', '50 + 60 + x = 180', 'x = 70'], finalAnswer: '70 degrees' },
        hints: ['What is sum of triangle angles?', 'Subtract from 180'],
        points: 10
      },
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        lessonId: geometryLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'What type of triangle has all three sides equal?' },
        correctAnswer: 'Equilateral',
        options: [
          { text: 'Equilateral', isCorrect: true },
          { text: 'Isosceles', isCorrect: false },
          { text: 'Scalene', isCorrect: false },
          { text: 'Right', isCorrect: false }
        ],
        explanation: 'An equilateral triangle has all sides equal.',
        solution: { steps: ['All sides equal = equilateral'], finalAnswer: 'Equilateral' },
        hints: ['Think about the prefix equi'],
        points: 10
      },
      // GEOMETRY MEDIUM PROBLEMS
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        lessonId: geometryLesson2._id,
        difficulty: 'Medium',
        type: 'multiple-choice',
        problem: { text: 'In a right triangle with legs 6 and 8, find the hypotenuse.' },
        correctAnswer: '10',
        options: [
          { text: '10', isCorrect: true },
          { text: '14', isCorrect: false },
          { text: '12', isCorrect: false },
          { text: '100', isCorrect: false }
        ],
        explanation: 'Use Pythagorean theorem: 6² + 8² = 36 + 64 = 100, so c = 10',
        solution: { steps: ['a² + b² = c²', '36 + 64 = 100', 'c = 10'], finalAnswer: '10' },
        hints: ['Use Pythagorean theorem', 'This is 3-4-5 scaled by 2'],
        points: 15
      },
      // GEOMETRY HARD PROBLEMS
      {
        topic: 'Geometry',
        subtopic: 'Triangles',
        lessonId: geometryLesson2._id,
        difficulty: 'Hard',
        type: 'multiple-choice',
        problem: { text: 'If one leg is 5 and hypotenuse is 13, find the other leg.' },
        correctAnswer: '12',
        options: [
          { text: '12', isCorrect: true },
          { text: '8', isCorrect: false },
          { text: '18', isCorrect: false },
          { text: '10', isCorrect: false }
        ],
        explanation: 'Use a² + b² = c². So 25 + b² = 169, b² = 144, b = 12',
        solution: { steps: ['5² + b² = 13²', '25 + b² = 169', 'b² = 144', 'b = 12'], finalAnswer: '12' },
        hints: ['Use Pythagorean theorem', 'This is 5-12-13 triple'],
        points: 20
      },
      // TRIGONOMETRY EASY PROBLEMS
      {
        topic: 'Trigonometry',
        subtopic: 'Basic Ratios',
        lessonId: trigLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'In SOH-CAH-TOA, what does SOH stand for?' },
        correctAnswer: 'Sine = Opposite / Hypotenuse',
        options: [
          { text: 'Sine = Opposite / Hypotenuse', isCorrect: true },
          { text: 'Sine = Opposite / Horizontal', isCorrect: false },
          { text: 'Side = Over / Height', isCorrect: false },
          { text: 'Sum of Hypotenuse', isCorrect: false }
        ],
        explanation: 'SOH means Sine = Opposite / Hypotenuse',
        solution: { steps: ['S = Sine', 'O = Opposite', 'H = Hypotenuse'], finalAnswer: 'Sine = Opposite / Hypotenuse' },
        hints: ['Each letter represents a word'],
        points: 10
      },
      {
        topic: 'Trigonometry',
        subtopic: 'Basic Ratios',
        lessonId: trigLesson1._id,
        difficulty: 'Easy',
        type: 'multiple-choice',
        problem: { text: 'If opposite = 3 and hypotenuse = 5, what is sin?' },
        correctAnswer: '0.6 or 3/5',
        options: [
          { text: '0.6 or 3/5', isCorrect: true },
          { text: '0.8 or 4/5', isCorrect: false },
          { text: '0.75 or 3/4', isCorrect: false },
          { text: '1.67 or 5/3', isCorrect: false }
        ],
        explanation: 'sin = opposite/hypotenuse = 3/5 = 0.6',
        solution: { steps: ['sin = opp/hyp', 'sin = 3/5', 'sin = 0.6'], finalAnswer: '0.6 or 3/5' },
        hints: ['Use SOH', 'Divide opposite by hypotenuse'],
        points: 10
      },
      // TRIGONOMETRY MEDIUM PROBLEMS
      {
        topic: 'Trigonometry',
        subtopic: 'Basic Ratios',
        lessonId: trigLesson1._id,
        difficulty: 'Medium',
        type: 'multiple-choice',
        problem: { text: 'If adjacent = 4 and hypotenuse = 5, what is cos?' },
        correctAnswer: '0.8 or 4/5',
        options: [
          { text: '0.8 or 4/5', isCorrect: true },
          { text: '0.6 or 3/5', isCorrect: false },
          { text: '0.75 or 3/4', isCorrect: false },
          { text: '1.25 or 5/4', isCorrect: false }
        ],
        explanation: 'cos = adjacent/hypotenuse = 4/5 = 0.8',
        solution: { steps: ['cos = adj/hyp', 'cos = 4/5', 'cos = 0.8'], finalAnswer: '0.8 or 4/5' },
        hints: ['Use CAH', 'Divide adjacent by hypotenuse'],
        points: 15
      },
      // TRIGONOMETRY HARD PROBLEMS
      {
        topic: 'Trigonometry',
        subtopic: 'Basic Ratios',
        lessonId: trigLesson1._id,
        difficulty: 'Hard',
        type: 'multiple-choice',
        problem: { text: 'If sin = 0.6 and hypotenuse is 10, find the opposite side.' },
        correctAnswer: '6',
        options: [
          { text: '6', isCorrect: true },
          { text: '8', isCorrect: false },
          { text: '4', isCorrect: false },
          { text: '16', isCorrect: false }
        ],
        explanation: 'sin = opp/hyp, so 0.6 = opp/10, opp = 6',
        solution: { steps: ['sin = opp/hyp', '0.6 = opp/10', 'opp = 0.6 * 10', 'opp = 6'], finalAnswer: '6' },
        hints: ['Start with sin formula', 'Substitute values', 'Solve for opposite'],
        points: 20
      }
    ];

    // Insert problems
    const createdProblems = await PracticeProblem.insertMany(sampleProblems);
    console.log(`✅ Created ${createdProblems.length} practice problems`);

    console.log('\n📚 Lessons created:');
    createdLessons.forEach(l => {
      console.log(`  - ${l.topic} > ${l.subtopic} > ${l.title}`);
    });

    console.log('\n📝 Problems by topic and difficulty:');
    ['Algebra', 'Geometry', 'Trigonometry'].forEach(topic => {
      const topicProblems = sampleProblems.filter(p => p.topic === topic);
      console.log(`  ${topic}:`);
      ['Easy', 'Medium', 'Hard'].forEach(diff => {
        const count = topicProblems.filter(p => p.difficulty === diff).length;
        console.log(`    ${diff}: ${count} problems`);
      });
    });

    console.log('\n✅ Lesson seeding complete!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedLessons();
