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

    // Question bank with real, correct questions for each lesson
    const questionBank = {
      // Algebra
      'Real Numbers': [
        { difficulty: 'Easy', problem: 'Which of the following is a rational number?', options: ['A. √2', 'B. π', 'C. 3/4', 'D. √3'], correctAnswer: 'C. 3/4', explanation: '3/4 is a ratio of two integers, making it rational. √2, π, and √3 are all irrational.', solution: { steps: ['A rational number can be expressed as a/b where a and b are integers', '3/4 fits this form', '√2, π, and √3 cannot be expressed as fractions'], finalAnswer: 'C. 3/4' }, hints: ['Rational numbers can be written as fractions', 'Irrational numbers cannot be written as fractions'], points: 10 },
        { difficulty: 'Medium', problem: 'What is the result of -3 × (-5)?', options: ['A. -15', 'B. 15', 'C. -8', 'D. 8'], correctAnswer: 'B. 15', explanation: 'Multiplying two negative numbers gives a positive result: -3 × -5 = 15', solution: { steps: ['Multiply the absolute values: 3 × 5 = 15', 'Two negatives make a positive'], finalAnswer: 'B. 15' }, hints: ['Remember: negative times negative equals positive'], points: 15 },
        { difficulty: 'Hard', problem: 'Which number is the smallest: 0.75, 7/10, 0.8, or 3/4?', options: ['A. 0.75', 'B. 7/10', 'C. 0.8', 'D. 3/4'], correctAnswer: 'B. 7/10', explanation: 'Convert all to decimals: 0.75, 0.7, 0.8, 0.75. The smallest is 0.7 (7/10).', solution: { steps: ['Convert fractions to decimals: 7/10 = 0.7', 'Compare: 0.75, 0.7, 0.8, 0.75', '0.7 is the smallest'], finalAnswer: 'B. 7/10' }, hints: ['Convert all numbers to the same form for comparison'], points: 20 },
      ],
      'Order of Operations (PEMDAS)': [
        { difficulty: 'Easy', problem: 'What is 3 + 4 × 2?', options: ['A. 14', 'B. 11', 'C. 7', 'D. 10'], correctAnswer: 'B. 11', explanation: 'Multiplication comes before addition: 4 × 2 = 8, then 3 + 8 = 11', solution: { steps: ['Multiply first: 4 × 2 = 8', 'Then add: 3 + 8 = 11'], finalAnswer: 'B. 11' }, hints: ['Remember PEMDAS: multiplication before addition'], points: 10 },
        { difficulty: 'Medium', problem: 'Evaluate: 5 + 3² - 4', options: ['A. 10', 'B. 14', 'C. 4', 'D. 18'], correctAnswer: 'A. 10', explanation: 'Exponent first: 3² = 9, then 5 + 9 - 4 = 10', solution: { steps: ['Exponent: 3² = 9', 'Add and subtract left to right: 5 + 9 - 4 = 10'], finalAnswer: 'A. 10' }, hints: ['Exponents come before addition and subtraction'], points: 15 },
        { difficulty: 'Hard', problem: 'What is (2 + 3)² - 4 × 3 + 1?', options: ['A. 14', 'B. 26', 'C. 10', 'D. 22'], correctAnswer: 'A. 14', explanation: 'Parentheses first: 5² = 25, then 25 - 12 + 1 = 14', solution: { steps: ['Parentheses: 2 + 3 = 5', 'Exponent: 5² = 25', 'Multiplication: 4 × 3 = 12', 'Left to right: 25 - 12 + 1 = 14'], finalAnswer: 'A. 14' }, hints: ['Follow PEMDAS: Parentheses, Exponents, Multiplication, Addition/Subtraction'], points: 20 },
      ],
      'Fractions, Decimals, and Percentages': [
        { difficulty: 'Easy', problem: 'What is 25% of 80?', options: ['A. 20', 'B. 25', 'C. 40', 'D. 10'], correctAnswer: 'A. 20', explanation: '25% of 80 = 0.25 × 80 = 20', solution: { steps: ['Convert percent to decimal: 25% = 0.25', 'Multiply: 0.25 × 80 = 20'], finalAnswer: 'A. 20' }, hints: ['Convert percentage to decimal first'], points: 10 },
        { difficulty: 'Medium', problem: 'Convert 3/8 to a decimal.', options: ['A. 0.375', 'B. 0.38', 'C. 0.25', 'D. 0.125'], correctAnswer: 'A. 0.375', explanation: '3 ÷ 8 = 0.375', solution: { steps: ['Divide numerator by denominator: 3 ÷ 8', '3/8 = 0.375'], finalAnswer: 'A. 0.375' }, hints: ['Divide the top number by the bottom number'], points: 15 },
        { difficulty: 'Hard', problem: 'A shirt costs $40. It is on sale for 15% off. What is the sale price?', options: ['A. $34', 'B. $6', 'C. $36', 'D. $30'], correctAnswer: 'A. $34', explanation: '15% of $40 = $6 discount. Sale price = $40 - $6 = $34', solution: { steps: ['Calculate discount: 0.15 × 40 = 6', 'Subtract from original: 40 - 6 = 34'], finalAnswer: 'A. $34' }, hints: ['Find the discount amount first, then subtract'], points: 20 },
      ],
      'Exponents and Radicals': [
        { difficulty: 'Easy', problem: 'What is 2³?', options: ['A. 6', 'B. 8', 'C. 9', 'D. 5'], correctAnswer: 'B. 8', explanation: '2³ = 2 × 2 × 2 = 8', solution: { steps: ['2³ means 2 × 2 × 2', '2 × 2 = 4', '4 × 2 = 8'], finalAnswer: 'B. 8' }, hints: ['An exponent tells you how many times to multiply the base by itself'], points: 10 },
        { difficulty: 'Medium', problem: 'Simplify: √48', options: ['A. 4√3', 'B. 3√4', 'C. 6√2', 'D. 2√12'], correctAnswer: 'A. 4√3', explanation: '√48 = √(16 × 3) = √16 × √3 = 4√3', solution: { steps: ['Factor 48: 48 = 16 × 3', '√48 = √16 × √3', '√16 = 4, so 4√3'], finalAnswer: 'A. 4√3' }, hints: ['Find the largest perfect square factor'], points: 15 },
        { difficulty: 'Hard', problem: 'What is (2²)³ × 2⁻¹?', options: ['A. 32', 'B. 16', 'C. 8', 'D. 64'], correctAnswer: 'A. 32', explanation: '(2²)³ = 2⁶ = 64, then 64 × 2⁻¹ = 64 ÷ 2 = 32', solution: { steps: ['Power of a power: (2²)³ = 2⁶ = 64', 'Negative exponent: 2⁻¹ = 1/2', 'Multiply: 64 × 1/2 = 32'], finalAnswer: 'A. 32' }, hints: ['Use power rule (aᵐ)ⁿ = aᵐⁿ and a⁻¹ = 1/a'], points: 20 },
      ],
      'Scientific Notation': [
        { difficulty: 'Easy', problem: 'Write 5,000,000 in scientific notation.', options: ['A. 5 × 10⁶', 'B. 5 × 10⁵', 'C. 50 × 10⁵', 'D. 0.5 × 10⁷'], correctAnswer: 'A. 5 × 10⁶', explanation: '5,000,000 = 5 × 1,000,000 = 5 × 10⁶', solution: { steps: ['Count the places after the first digit: 6 places', 'Write as 5 × 10⁶'], finalAnswer: 'A. 5 × 10⁶' }, hints: ['Move the decimal point to get a number between 1 and 10'], points: 10 },
        { difficulty: 'Medium', problem: 'What is (3 × 10⁴) × (2 × 10³)?', options: ['A. 6 × 10¹²', 'B. 6 × 10⁷', 'C. 5 × 10⁷', 'D. 6 × 10¹'], correctAnswer: 'B. 6 × 10⁷', explanation: 'Multiply coefficients: 3 × 2 = 6. Add exponents: 10⁴ × 10³ = 10⁷. Result: 6 × 10⁷', solution: { steps: ['Multiply coefficients: 3 × 2 = 6', 'Add exponents: 4 + 3 = 7', 'Result: 6 × 10⁷'], finalAnswer: 'B. 6 × 10⁷' }, hints: ['Multiply the numbers and add the exponents'], points: 15 },
        { difficulty: 'Hard', problem: 'Write 0.000045 in scientific notation.', options: ['A. 4.5 × 10⁻⁵', 'B. 45 × 10⁻⁴', 'C. 4.5 × 10⁻⁴', 'D. 0.45 × 10⁻⁵'], correctAnswer: 'A. 4.5 × 10⁻⁵', explanation: 'Move decimal 5 places right: 0.000045 = 4.5 × 10⁻⁵', solution: { steps: ['Move decimal to get 4.5 (between 1 and 10)', 'Moved 5 places to the right, so exponent is -5'], finalAnswer: 'A. 4.5 × 10⁻⁵' }, hints: ['Count how many places the decimal moves to get a number between 1 and 10'], points: 20 },
      ],
      // Geometry
      'Points, Lines, and Planes': [
        { difficulty: 'Easy', problem: 'What is a point in geometry?', options: ['A. A line', 'B. A location with no size', 'C. A flat surface', 'D. A curved shape'], correctAnswer: 'B. A location with no size', explanation: 'A point represents a location in space and has no dimensions (no size).', solution: { steps: ['A point has no length, width, or height', 'It only represents a location'], finalAnswer: 'B. A location with no size' }, hints: ['A point has zero dimensions'], points: 10 },
        { difficulty: 'Medium', problem: 'How many points determine a unique line?', options: ['A. One', 'B. Three', 'C. Two', 'D. Four'], correctAnswer: 'C. Two', explanation: 'Exactly two distinct points determine a unique line.', solution: { steps: ['Through any two distinct points, there is exactly one line'], finalAnswer: 'C. Two' }, hints: ['Think about how many points you need to draw a straight line'], points: 15 },
        { difficulty: 'Hard', problem: 'If points A, B, and C are collinear, and B is between A and C, AB = 5, and BC = 3, what is AC?', options: ['A. 8', 'B. 2', 'C. 15', 'D. 4'], correctAnswer: 'A. 8', explanation: 'By the Segment Addition Postulate, AC = AB + BC = 5 + 3 = 8', solution: { steps: ['B is between A and C', 'AC = AB + BC', 'AC = 5 + 3 = 8'], finalAnswer: 'A. 8' }, hints: ['Use the Segment Addition Postulate'], points: 20 },
      ],
      'Line Segments': [
        { difficulty: 'Easy', problem: 'What is the midpoint of a line segment with endpoints at 2 and 10?', options: ['A. 5', 'B. 6', 'C. 8', 'D. 12'], correctAnswer: 'B. 6', explanation: 'Midpoint = (2 + 10) / 2 = 12 / 2 = 6', solution: { steps: ['Use midpoint formula: (x₁ + x₂) / 2', '(2 + 10) / 2 = 6'], finalAnswer: 'B. 6' }, hints: ['The midpoint is the average of the two endpoints'], points: 10 },
        { difficulty: 'Medium', problem: 'A line segment has endpoints A(1, 2) and B(5, 6). What is its length?', options: ['A. 4√2', 'B. 8', 'C. 2√10', 'D. 10'], correctAnswer: 'A. 4√2', explanation: 'Use distance formula: √((5-1)² + (6-2)²) = √(16 + 16) = √32 = 4√2', solution: { steps: ['Distance = √((x₂-x₁)² + (y₂-y₁)²)', '= √((5-1)² + (6-2)²)', '= √(16 + 16)', '= √32 = 4√2'], finalAnswer: 'A. 4√2' }, hints: ['Use the distance formula derived from the Pythagorean theorem'], points: 15 },
        { difficulty: 'Hard', problem: 'If M is the midpoint of AB and AM = 3x + 1, MB = 2x + 6, find AB.', options: ['A. 14', 'B. 32', 'C. 7', 'D. 21'], correctAnswer: 'B. 32', explanation: 'Since M is the midpoint, AM = MB. So 3x + 1 = 2x + 6, x = 5. AM = 16, AB = 2 × 16 = 32.', solution: { steps: ['Set AM = MB: 3x + 1 = 2x + 6', 'Solve: x = 5', 'AM = 3(5) + 1 = 16', 'AB = 2 × AM = 2 × 16 = 32'], finalAnswer: 'B. 32' }, hints: ['At the midpoint, both halves are equal'], points: 20 },
      ],
      'Rays': [
        { difficulty: 'Easy', problem: 'What is a ray in geometry?', options: ['A. A line with two endpoints', 'B. A part of a line with one endpoint that extends infinitely in one direction', 'C. A curved line', 'D. A point'], correctAnswer: 'B. A part of a line with one endpoint that extends infinitely in one direction', explanation: 'A ray has one starting point (endpoint) and extends infinitely in one direction.', solution: { steps: ['A ray has one endpoint', 'It extends infinitely in one direction'], finalAnswer: 'B. A part of a line with one endpoint that extends infinitely in one direction' }, hints: ['Think of a ray as a line that starts somewhere but never ends'], points: 10 },
        { difficulty: 'Medium', problem: 'Ray AB starts at A and passes through B. Which point is the endpoint?', options: ['A. B', 'B. A', 'C. Both A and B', 'D. Neither'], correctAnswer: 'B. A', explanation: 'In ray AB, the endpoint is A (the first letter), and it extends through B infinitely.', solution: { steps: ['A ray is named with its endpoint first', 'Ray AB has endpoint A'], finalAnswer: 'B. A' }, hints: ['The first letter in a ray name is always the endpoint'], points: 15 },
        { difficulty: 'Hard', problem: 'Ray OA and ray OB are opposite rays. If ∠AOC = 35°, what is ∠BOC?', options: ['A. 35°', 'B. 55°', 'C. 145°', 'D. 180°'], correctAnswer: 'C. 145°', explanation: 'Opposite rays form a straight line (180°). ∠AOC + ∠BOC = 180°, so ∠BOC = 180° - 35° = 145°', solution: { steps: ['Opposite rays form a straight angle (180°)', '∠AOC + ∠BOC = 180°', '∠BOC = 180° - 35° = 145°'], finalAnswer: 'C. 145°' }, hints: ['Opposite rays form a 180° angle together'], points: 20 },
      ],
      'Angles': [
        { difficulty: 'Easy', problem: 'What is an angle that measures exactly 90° called?', options: ['A. Acute angle', 'B. Obtuse angle', 'C. Right angle', 'D. Straight angle'], correctAnswer: 'C. Right angle', explanation: 'A right angle measures exactly 90°.', solution: { steps: ['Acute: less than 90°', 'Right: exactly 90°', 'Obtuse: between 90° and 180°', 'Straight: exactly 180°'], finalAnswer: 'C. Right angle' }, hints: ['A right angle forms a square corner'], points: 10 },
        { difficulty: 'Medium', problem: 'Two angles are complementary. If one angle measures 35°, what is the other?', options: ['A. 55°', 'B. 145°', 'C. 65°', 'D. 35°'], correctAnswer: 'A. 55°', explanation: 'Complementary angles add up to 90°. So the other angle is 90° - 35° = 55°.', solution: { steps: ['Complementary angles sum to 90°', 'Other angle = 90° - 35° = 55°'], finalAnswer: 'A. 55°' }, hints: ['Complementary angles add to 90 degrees'], points: 15 },
        { difficulty: 'Hard', problem: 'Three angles in a triangle are in the ratio 2:3:4. What is the measure of the largest angle?', options: ['A. 80°', 'B. 60°', 'C. 40°', 'D. 100°'], correctAnswer: 'A. 80°', explanation: 'The angles sum to 180°. 2x + 3x + 4x = 180°, 9x = 180°, x = 20°. Largest = 4x = 80°.', solution: { steps: ['Let angles be 2x, 3x, 4x', 'Sum: 2x + 3x + 4x = 9x = 180°', 'x = 20°', 'Largest angle: 4 × 20° = 80°'], finalAnswer: 'A. 80°' }, hints: ['Triangle angles sum to 180°, use the ratio to set up an equation'], points: 20 },
      ],
      'Measuring Angles': [
        { difficulty: 'Easy', problem: 'Using a protractor, an angle measures 75°. What type of angle is this?', options: ['A. Obtuse', 'B. Right', 'C. Acute', 'D. Straight'], correctAnswer: 'C. Acute', explanation: 'An acute angle measures less than 90°. 75° < 90°, so it is acute.', solution: { steps: ['Acute: less than 90°', '75° < 90°, so it is acute'], finalAnswer: 'C. Acute' }, hints: ['Acute angles are less than 90 degrees'], points: 10 },
        { difficulty: 'Medium', problem: 'If ∠A = 42° and ∠B is supplementary to ∠A, what is ∠B?', options: ['A. 48°', 'B. 138°', 'C. 42°', 'D. 148°'], correctAnswer: 'B. 138°', explanation: 'Supplementary angles sum to 180°. ∠B = 180° - 42° = 138°.', solution: { steps: ['Supplementary angles add to 180°', '∠B = 180° - 42° = 138°'], finalAnswer: 'B. 138°' }, hints: ['Supplementary angles sum to 180 degrees'], points: 15 },
        { difficulty: 'Hard', problem: 'In the diagram, ∠1 and ∠2 are vertical angles. If ∠1 = (3x + 10)° and ∠2 = (5x - 30)°, find x.', options: ['A. 10', 'B. 20', 'C. 15', 'D. 25'], correctAnswer: 'B. 20', explanation: 'Vertical angles are equal. 3x + 10 = 5x - 30, 40 = 2x, x = 20.', solution: { steps: ['Vertical angles are equal', '3x + 10 = 5x - 30', '40 = 2x', 'x = 20'], finalAnswer: 'B. 20' }, hints: ['Vertical angles have equal measures'], points: 20 },
      ],
      // Trigonometry
      'Angle Measurement': [
        { difficulty: 'Easy', problem: 'What is the unit used to measure angles?', options: ['A. Radian', 'B. Degree', 'C. Meter', 'D. Gram'], correctAnswer: 'B. Degree', explanation: 'Angles are commonly measured in degrees (°).', solution: { steps: ['The most common unit for measuring angles is the degree'], finalAnswer: 'B. Degree' }, hints: ['Think about the protractor'], points: 10 },
        { difficulty: 'Medium', problem: 'Convert 120° to radians.', options: ['A. π/3', 'B. 2π/3', 'C. 3π/4', 'D. 5π/6'], correctAnswer: 'B. 2π/3', explanation: '120° × (π/180) = 120π/180 = 2π/3 radians.', solution: { steps: ['Use conversion: radians = degrees × π/180', '120 × π/180 = 2π/3'], finalAnswer: 'B. 2π/3' }, hints: ['Multiply by π/180 to convert degrees to radians'], points: 15 },
        { difficulty: 'Hard', problem: 'A clock hand moves from 3 to 7. Through how many degrees does it rotate?', options: ['A. 90°', 'B. 120°', 'C. 150°', 'D. 180°'], correctAnswer: 'B. 120°', explanation: 'Each hour mark is 30° (360°/12). From 3 to 7 is 4 hours: 4 × 30° = 120°.', solution: { steps: ['Each hour = 360°/12 = 30°', 'From 3 to 7 = 4 hours', '4 × 30° = 120°'], finalAnswer: 'B. 120°' }, hints: ['A clock has 12 hours, each spanning 30 degrees'], points: 20 },
      ],
      'Degrees and Radians': [
        { difficulty: 'Easy', problem: 'Convert 45° to radians.', options: ['A. π/6', 'B. π/4', 'C. π/3', 'D. π/2'], correctAnswer: 'B. π/4', explanation: '45° × (π/180) = 45π/180 = π/4 radians.', solution: { steps: ['45 × π/180 = 45π/180', 'Simplify: π/4'], finalAnswer: 'B. π/4' }, hints: ['Multiply degrees by π/180'], points: 10 },
        { difficulty: 'Medium', problem: 'Convert 5π/6 radians to degrees.', options: ['A. 120°', 'B. 150°', 'C. 135°', 'D. 180°'], correctAnswer: 'B. 150°', explanation: '5π/6 × (180/π) = 5 × 30 = 150°.', solution: { steps: ['Multiply by 180/π', '5π/6 × 180/π = 5 × 30 = 150°'], finalAnswer: 'B. 150°' }, hints: ['Multiply radians by 180/π to get degrees'], points: 15 },
        { difficulty: 'Hard', problem: 'An arc of a circle with radius 12 has a length of 8π. What is the central angle in radians?', options: ['A. π/3', 'B. 2π/3', 'C. π/2', 'D. 3π/4'], correctAnswer: 'B. 2π/3', explanation: 'Arc length = rθ. So 8π = 12θ, θ = 8π/12 = 2π/3 radians.', solution: { steps: ['Arc length formula: s = rθ', '8π = 12θ', 'θ = 8π/12 = 2π/3'], finalAnswer: 'B. 2π/3' }, hints: ['Use the arc length formula s = rθ'], points: 20 },
      ],
      'Coterminal Angles': [
        { difficulty: 'Easy', problem: 'Which angle is coterminal with 30°?', options: ['A. 390°', 'B. 330°', 'C. 150°', 'D. 60°'], correctAnswer: 'A. 390°', explanation: 'Coterminal angles differ by 360°. 30° + 360° = 390°.', solution: { steps: ['Coterminal angles differ by multiples of 360°', '30° + 360° = 390°'], finalAnswer: 'A. 390°' }, hints: ['Add or subtract 360° to find coterminal angles'], points: 10 },
        { difficulty: 'Medium', problem: 'Find a positive coterminal angle for -45°.', options: ['A. 315°', 'B. 45°', 'C. 135°', 'D. 225°'], correctAnswer: 'A. 315°', explanation: 'Add 360° to -45°: -45° + 360° = 315°.', solution: { steps: ['Add 360° to get a positive coterminal angle', '-45° + 360° = 315°'], finalAnswer: 'A. 315°' }, hints: ['Add 360 degrees to negative angles'], points: 15 },
        { difficulty: 'Hard', problem: 'What is the reference angle for 210°?', options: ['A. 30°', 'B. 60°', 'C. 45°', 'D. 15°'], correctAnswer: 'A. 30°', explanation: '210° is in QIII. Reference angle = 210° - 180° = 30°.', solution: { steps: ['210° is in the third quadrant', 'Reference angle = 210° - 180° = 30°'], finalAnswer: 'A. 30°' }, hints: ['For QIII, subtract 180° from the angle'], points: 20 },
      ],
      'Sine': [
        { difficulty: 'Easy', problem: 'In a right triangle, sin(θ) equals:', options: ['A. Adjacent/Hypotenuse', 'B. Opposite/Hypotenuse', 'C. Opposite/Adjacent', 'D. Hypotenuse/Opposite'], correctAnswer: 'B. Opposite/Hypotenuse', explanation: 'SOH: Sine = Opposite / Hypotenuse', solution: { steps: ['SOH-CAH-TOA: Sine = Opposite / Hypotenuse'], finalAnswer: 'B. Opposite/Hypotenuse' }, hints: ['Remember SOH: Sine = Opposite/Hypotenuse'], points: 10 },
        { difficulty: 'Medium', problem: 'In a right triangle, the hypotenuse is 10 and the opposite side is 6. Find sin(θ).', options: ['A. 0.6', 'B. 0.8', 'C. 0.36', 'D. 1.67'], correctAnswer: 'A. 0.6', explanation: 'sin(θ) = opposite/hypotenuse = 6/10 = 0.6', solution: { steps: ['sin(θ) = opposite / hypotenuse', 'sin(θ) = 6/10 = 0.6'], finalAnswer: 'A. 0.6' }, hints: ['Use the definition of sine'], points: 15 },
        { difficulty: 'Hard', problem: 'If sin(θ) = 0.8 and the hypotenuse is 15, what is the length of the opposite side?', options: ['A. 12', 'B. 9', 'C. 10', 'D. 15'], correctAnswer: 'A. 12', explanation: 'sin(θ) = opposite/hypotenuse, so 0.8 = opposite/15, opposite = 12.', solution: { steps: ['sin(θ) = opposite / hypotenuse', '0.8 = opposite / 15', 'opposite = 0.8 × 15 = 12'], finalAnswer: 'A. 12' }, hints: ['Multiply sin(θ) by the hypotenuse'], points: 20 },
      ],
      'Cosine': [
        { difficulty: 'Easy', problem: 'In a right triangle, cos(θ) equals:', options: ['A. Opposite/Hypotenuse', 'B. Adjacent/Hypotenuse', 'C. Opposite/Adjacent', 'D. Hypotenuse/Adjacent'], correctAnswer: 'B. Adjacent/Hypotenuse', explanation: 'CAH: Cosine = Adjacent / Hypotenuse', solution: { steps: ['SOH-CAH-TOA: Cosine = Adjacent / Hypotenuse'], finalAnswer: 'B. Adjacent/Hypotenuse' }, hints: ['Remember CAH: Cosine = Adjacent/Hypotenuse'], points: 10 },
        { difficulty: 'Medium', problem: 'In a right triangle, the hypotenuse is 13 and the adjacent side is 12. Find cos(θ).', options: ['A. 12/13', 'B. 5/13', 'C. 13/12', 'D. 5/12'], correctAnswer: 'A. 12/13', explanation: 'cos(θ) = adjacent/hypotenuse = 12/13', solution: { steps: ['cos(θ) = adjacent / hypotenuse', 'cos(θ) = 12/13'], finalAnswer: 'A. 12/13' }, hints: ['Use the definition of cosine'], points: 15 },
        { difficulty: 'Hard', problem: 'If cos(θ) = 0.75 and the adjacent side is 9, find the hypotenuse.', options: ['A. 12', 'B. 6.75', 'C. 16', 'D. 9'], correctAnswer: 'A. 12', explanation: 'cos(θ) = adjacent/hypotenuse, so 0.75 = 9/hypotenuse, hypotenuse = 9/0.75 = 12.', solution: { steps: ['cos(θ) = adjacent / hypotenuse', '0.75 = 9 / hypotenuse', 'hypotenuse = 9 / 0.75 = 12'], finalAnswer: 'A. 12' }, hints: ['Divide the adjacent side by cos(θ)'], points: 20 },
      ],
    };

    // Helper to create problems from question bank
    const createProblemsForLesson = (lesson, count = 3) => {
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const questions = questionBank[lesson.title];
      
      if (questions && questions.length > 0) {
        // Use real questions from the bank, picking by difficulty
        return questions.map(q => ({
          topic: lesson.topic,
          subtopic: lesson.subtopic,
          lessonId: lesson._id,
          difficulty: q.difficulty,
          type: 'multiple-choice',
          problem: {
            text: q.problem,
            latex: null
          },
          options: q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: opt === q.correctAnswer
          })),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solution: q.solution,
          hints: q.hints,
          points: q.difficulty === 'Easy' ? 10 : q.difficulty === 'Medium' ? 15 : 20,
          learningObjective: lesson.learningObjectives[0]
        }));
      }
      
      // Fallback for lessons not in the bank
      return difficulties.map((diff, i) => ({
        topic: lesson.topic,
        subtopic: lesson.subtopic,
        lessonId: lesson._id,
        difficulty: diff,
        type: 'multiple-choice',
        problem: {
          text: `${diff} problem for ${lesson.title}`,
          latex: null
        },
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false }
        ],
        correctAnswer: 'Option A',
        explanation: `This problem tests: ${lesson.learningObjectives[0]}`,
        solution: {
          steps: ['Solve the problem step by step'],
          finalAnswer: 'Option A'
        },
        hints: ['Review the lesson material', 'Apply the relevant formula', 'Check your work'],
        points: diff === 'Easy' ? 10 : diff === 'Medium' ? 15 : 20,
        learningObjective: lesson.learningObjectives[0]
      }));
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
