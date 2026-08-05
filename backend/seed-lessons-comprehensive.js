import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lesson, PracticeProblem } from './models/index.js';

dotenv.config();

// ─── Lesson content ───────────────────────────────────────────────────────────

const lessons = [

  // ══════════════════════════════════════════════════════
  // ALGEBRA
  // ══════════════════════════════════════════════════════

  {
    topic: 'Algebra', subtopic: 'Fractions', order: 1, difficulty: 'Beginner',
    title: 'Understanding Fractions',
    description: 'Build a solid foundation with fractions — simplifying, comparing, and converting them.',
    estimatedTime: 20,
    content: {
      introduction: 'A fraction represents a part of a whole. It consists of a numerator (top) and a denominator (bottom). Fractions appear everywhere in real life: half a pizza, three-quarters of a tank of gas, or two-thirds of a class passing an exam.',
      sections: [
        {
          title: 'Parts of a Fraction',
          content: 'The numerator tells you how many parts you have. The denominator tells you how many equal parts the whole is divided into. For example, 3/4 means "3 out of 4 equal parts".',
          examples: [
            {
              problem: 'A pizza is cut into 8 equal slices. You eat 3 slices. What fraction did you eat?',
              solution: '3/8',
              steps: ['Total slices = 8 (denominator)', 'Slices eaten = 3 (numerator)', 'Fraction = 3/8']
            }
          ]
        },
        {
          title: 'Simplifying Fractions',
          content: 'A fraction is in simplest form when the numerator and denominator share no common factors other than 1. To simplify, divide both by their Greatest Common Divisor (GCD).',
          examples: [
            {
              problem: 'Simplify 12/18.',
              solution: '2/3',
              steps: ['Find GCD of 12 and 18', 'Factors of 12: 1,2,3,4,6,12', 'Factors of 18: 1,2,3,6,9,18', 'GCD = 6', 'Divide both by 6: 12÷6 = 2, 18÷6 = 3', 'Simplified: 2/3']
            },
            {
              problem: 'Simplify 24/36.',
              solution: '2/3',
              steps: ['GCD of 24 and 36 is 12', '24÷12 = 2, 36÷12 = 3', 'Simplified: 2/3']
            }
          ]
        },
        {
          title: 'Adding and Subtracting Fractions',
          content: 'To add or subtract fractions, they must have the same denominator (a common denominator). If they do not, find the Least Common Denominator (LCD) first.',
          examples: [
            {
              problem: 'Calculate 1/3 + 1/4.',
              solution: '7/12',
              steps: ['LCD of 3 and 4 is 12', 'Convert: 1/3 = 4/12, 1/4 = 3/12', 'Add numerators: 4/12 + 3/12 = 7/12', 'Check if simplified: 7 and 12 share no factors — done']
            },
            {
              problem: 'Calculate 5/6 − 1/4.',
              solution: '7/12',
              steps: ['LCD of 6 and 4 is 12', 'Convert: 5/6 = 10/12, 1/4 = 3/12', 'Subtract: 10/12 − 3/12 = 7/12']
            }
          ]
        }
      ],
      summary: 'Fractions represent parts of a whole. Always simplify by dividing by the GCD, and find a common denominator before adding or subtracting.',
      keyTakeaways: [
        'Numerator = parts you have; Denominator = total equal parts',
        'Simplify by dividing by the GCD',
        'Find LCD before adding or subtracting fractions',
        'Always check if the result can be simplified further'
      ]
    }
  },

  {
    topic: 'Algebra', subtopic: 'Fractions', order: 2, difficulty: 'Intermediate',
    title: 'Multiplying and Dividing Fractions',
    description: 'Learn to multiply and divide fractions efficiently, including mixed numbers.',
    estimatedTime: 20,
    content: {
      introduction: 'Multiplying fractions is actually simpler than adding them — you do not need a common denominator. Division is just multiplication by the reciprocal.',
      sections: [
        {
          title: 'Multiplying Fractions',
          content: 'Multiply numerator × numerator and denominator × denominator. Then simplify. You can also cross-cancel before multiplying to keep numbers small.',
          examples: [
            {
              problem: 'Calculate 2/3 × 4/5.',
              solution: '8/15',
              steps: ['Multiply numerators: 2 × 4 = 8', 'Multiply denominators: 3 × 5 = 15', 'Result: 8/15 (already simplified)']
            },
            {
              problem: 'Calculate 3/4 × 8/9.',
              solution: '2/3',
              steps: ['Cross-cancel: 3 and 9 share factor 3 → 1 and 3', 'Cross-cancel: 4 and 8 share factor 4 → 1 and 2', 'Multiply: 1×2 / 1×3 = 2/3']
            }
          ]
        },
        {
          title: 'Dividing Fractions',
          content: 'To divide by a fraction, multiply by its reciprocal (flip the second fraction). The phrase "Keep-Change-Flip" is a helpful mnemonic.',
          examples: [
            {
              problem: 'Calculate 3/4 ÷ 2/5.',
              solution: '15/8',
              steps: ['Keep 3/4, Change ÷ to ×, Flip 2/5 to 5/2', 'Multiply: 3/4 × 5/2', 'Result: 15/8']
            }
          ]
        }
      ],
      summary: 'Multiply fractions straight across. Divide by flipping the second fraction and multiplying. Cross-cancel to simplify early.',
      keyTakeaways: [
        'Multiply: numerator × numerator, denominator × denominator',
        'Divide: Keep-Change-Flip then multiply',
        'Cross-cancel before multiplying to simplify work',
        'Mixed numbers must be converted to improper fractions first'
      ]
    }
  },

  {
    topic: 'Algebra', subtopic: 'Linear Equations', order: 3, difficulty: 'Beginner',
    title: 'Introduction to Linear Equations',
    description: 'Understand what linear equations are and how to solve one-step equations.',
    estimatedTime: 18,
    content: {
      introduction: 'A linear equation is an equation where the highest power of the variable is 1. The goal when solving is to isolate the variable on one side by performing the same operation on both sides — keeping the equation balanced like a scale.',
      sections: [
        {
          title: 'The Balance Principle',
          content: 'An equation is like a balance scale — both sides must remain equal. Whatever you do to one side, you must do to the other. The four operations are: addition, subtraction, multiplication, and division.',
          examples: [
            {
              problem: 'Solve for x: x + 7 = 15',
              solution: 'x = 8',
              steps: ['Goal: get x alone', 'Subtract 7 from both sides: x + 7 − 7 = 15 − 7', 'Simplify: x = 8', 'Check: 8 + 7 = 15 ✓']
            },
            {
              problem: 'Solve for x: x − 4 = 11',
              solution: 'x = 15',
              steps: ['Add 4 to both sides: x − 4 + 4 = 11 + 4', 'x = 15', 'Check: 15 − 4 = 11 ✓']
            }
          ]
        },
        {
          title: 'One-Step Multiplication and Division',
          content: 'When a variable is multiplied by a number, divide both sides. When divided, multiply both sides.',
          examples: [
            {
              problem: 'Solve for x: 5x = 35',
              solution: 'x = 7',
              steps: ['Divide both sides by 5: 5x/5 = 35/5', 'x = 7', 'Check: 5 × 7 = 35 ✓']
            },
            {
              problem: 'Solve for x: x/3 = 9',
              solution: 'x = 27',
              steps: ['Multiply both sides by 3: x/3 × 3 = 9 × 3', 'x = 27', 'Check: 27/3 = 9 ✓']
            }
          ]
        }
      ],
      summary: 'Linear equations are solved by isolating the variable using inverse operations on both sides.',
      keyTakeaways: [
        'Keep the equation balanced — same operation on both sides',
        'Inverse of addition is subtraction (and vice versa)',
        'Inverse of multiplication is division (and vice versa)',
        'Always check your answer by substituting back'
      ]
    }
  },

  {
    topic: 'Algebra', subtopic: 'Linear Equations', order: 4, difficulty: 'Intermediate',
    title: 'Multi-Step Linear Equations',
    description: 'Solve equations requiring multiple steps including combining like terms and the distributive property.',
    estimatedTime: 22,
    content: {
      introduction: 'Most real-world equations require more than one step to solve. The strategy is: simplify each side first, then isolate the variable.',
      sections: [
        {
          title: 'Combining Like Terms',
          content: 'Like terms have the same variable raised to the same power. Combine them before solving. Constants are also like terms with each other.',
          examples: [
            {
              problem: 'Solve: 3x + 2x − 4 = 21',
              solution: 'x = 5',
              steps: ['Combine like terms: 5x − 4 = 21', 'Add 4: 5x = 25', 'Divide by 5: x = 5', 'Check: 3(5) + 2(5) − 4 = 15 + 10 − 4 = 21 ✓']
            }
          ]
        },
        {
          title: 'The Distributive Property',
          content: 'a(b + c) = ab + ac. Expand brackets before combining terms.',
          examples: [
            {
              problem: 'Solve: 2(x + 3) = 16',
              solution: 'x = 5',
              steps: ['Distribute: 2x + 6 = 16', 'Subtract 6: 2x = 10', 'Divide by 2: x = 5', 'Check: 2(5 + 3) = 2(8) = 16 ✓']
            },
            {
              problem: 'Solve: 3(x − 2) + x = 22',
              solution: 'x = 7',
              steps: ['Distribute: 3x − 6 + x = 22', 'Combine: 4x − 6 = 22', 'Add 6: 4x = 28', 'Divide: x = 7']
            }
          ]
        },
        {
          title: 'Variables on Both Sides',
          content: 'Move all variable terms to one side and constants to the other.',
          examples: [
            {
              problem: 'Solve: 5x + 3 = 2x + 15',
              solution: 'x = 4',
              steps: ['Subtract 2x from both sides: 3x + 3 = 15', 'Subtract 3: 3x = 12', 'Divide by 3: x = 4', 'Check: 5(4)+3 = 23, 2(4)+15 = 23 ✓']
            }
          ]
        }
      ],
      summary: 'Simplify by distributing and combining like terms, then isolate the variable. When variables appear on both sides, move them all to one side first.',
      keyTakeaways: [
        'Distribute before combining like terms',
        'Combine all like terms on each side first',
        'Move variable terms to one side, constants to the other',
        'Check your answer by substituting back into the original equation'
      ]
    }
  },

  {
    topic: 'Algebra', subtopic: 'Factoring', order: 5, difficulty: 'Intermediate',
    title: 'Factoring Basics',
    description: 'Learn to factor expressions by finding common factors and recognising special patterns.',
    estimatedTime: 25,
    content: {
      introduction: 'Factoring is the reverse of expanding. Instead of multiplying out brackets, you find what multiplied together gives you the expression. It is a crucial skill for solving quadratic equations and simplifying rational expressions.',
      sections: [
        {
          title: 'Greatest Common Factor (GCF)',
          content: 'The first step in any factoring problem is to look for a GCF. Factor it out of every term.',
          examples: [
            {
              problem: 'Factor: 6x² + 9x',
              solution: '3x(2x + 3)',
              steps: ['Find GCF of 6x² and 9x: 3x', 'Divide each term by 3x: 6x²/3x = 2x, 9x/3x = 3', 'Write as: 3x(2x + 3)', 'Check: 3x × 2x + 3x × 3 = 6x² + 9x ✓']
            }
          ]
        },
        {
          title: 'Factoring Trinomials (x² + bx + c)',
          content: 'Find two numbers that multiply to c and add to b. Write as (x + p)(x + q).',
          examples: [
            {
              problem: 'Factor: x² + 7x + 12',
              solution: '(x + 3)(x + 4)',
              steps: ['Need two numbers that multiply to 12 and add to 7', 'Try: 3 × 4 = 12, 3 + 4 = 7 ✓', 'Write: (x + 3)(x + 4)', 'Verify: x² + 4x + 3x + 12 = x² + 7x + 12 ✓']
            },
            {
              problem: 'Factor: x² − 5x + 6',
              solution: '(x − 2)(x − 3)',
              steps: ['Need two numbers that multiply to 6 and add to −5', '−2 × −3 = 6, −2 + (−3) = −5 ✓', 'Write: (x − 2)(x − 3)']
            }
          ]
        },
        {
          title: 'Difference of Two Squares',
          content: 'a² − b² = (a + b)(a − b). Recognise perfect squares!',
          examples: [
            {
              problem: 'Factor: x² − 25',
              solution: '(x + 5)(x − 5)',
              steps: ['Recognise: x² − 25 = x² − 5²', 'Apply difference of squares: (x + 5)(x − 5)', 'Verify: x² − 5x + 5x − 25 = x² − 25 ✓']
            }
          ]
        }
      ],
      summary: 'Always look for a GCF first. Then recognise trinomials (find two numbers that multiply and add correctly) or special patterns like difference of squares.',
      keyTakeaways: [
        'Always check for a GCF first',
        'Trinomial: find two numbers that multiply to c and add to b',
        'Difference of squares: a² − b² = (a+b)(a−b)',
        'Always verify by expanding back out'
      ]
    }
  },
];

// Append remaining lessons to the array above — Geometry and Trigonometry
lessons.push(

  // ══════════════════════════════════════════════════════
  // GEOMETRY
  // ══════════════════════════════════════════════════════

  {
    topic: 'Geometry', subtopic: 'Angles', order: 1, difficulty: 'Beginner',
    title: 'Understanding Angles',
    description: 'Learn to classify, measure, and work with angles including complementary, supplementary, and vertical angles.',
    estimatedTime: 18,
    content: {
      introduction: 'An angle is formed when two rays share a common endpoint (the vertex). Angles are measured in degrees (°). They appear everywhere in architecture, art, sports, and navigation.',
      sections: [
        {
          title: 'Types of Angles',
          content: 'Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: exactly 180°. Reflex: greater than 180°.',
          examples: [
            {
              problem: 'Classify an angle of 135°.',
              solution: 'Obtuse',
              steps: ['90° < 135° < 180°', 'Therefore it is an obtuse angle']
            }
          ]
        },
        {
          title: 'Complementary and Supplementary Angles',
          content: 'Complementary angles sum to 90°. Supplementary angles sum to 180°. These pairs are common in geometry problems.',
          examples: [
            {
              problem: 'Two angles are supplementary. One is 72°. Find the other.',
              solution: '108°',
              steps: ['Supplementary means sum = 180°', '180° − 72° = 108°', 'The other angle is 108°']
            },
            {
              problem: 'Two angles are complementary. One is 35°. Find the other.',
              solution: '55°',
              steps: ['Complementary means sum = 90°', '90° − 35° = 55°']
            }
          ]
        },
        {
          title: 'Vertical Angles',
          content: 'When two lines intersect, they form two pairs of vertical angles. Vertical angles are always equal.',
          examples: [
            {
              problem: 'Two lines intersect. One angle is 48°. Find the other three angles.',
              solution: '48°, 132°, 132°',
              steps: ['Vertical angle opposite 48° is also 48°', 'The other two are supplementary to 48°: 180° − 48° = 132°', 'So the four angles are: 48°, 132°, 48°, 132°']
            }
          ]
        }
      ],
      summary: 'Angles are classified by size. Complementary pairs sum to 90°, supplementary to 180°, and vertical angles are equal.',
      keyTakeaways: [
        'Acute < 90° < Obtuse < 180° = Straight',
        'Complementary angles sum to 90°',
        'Supplementary angles sum to 180°',
        'Vertical angles (formed by intersecting lines) are always equal'
      ]
    }
  },

  {
    topic: 'Geometry', subtopic: 'Triangles', order: 2, difficulty: 'Beginner',
    title: 'Triangle Properties',
    description: 'Explore types of triangles, angle relationships, and the Pythagorean theorem.',
    estimatedTime: 22,
    content: {
      introduction: 'A triangle is a three-sided polygon. It is the simplest and most rigid shape in geometry, making it the foundation of structures like bridges and roof trusses.',
      sections: [
        {
          title: 'Angle Sum Property',
          content: 'The three interior angles of any triangle always add up to exactly 180°. This is one of the most fundamental rules in geometry.',
          examples: [
            {
              problem: 'A triangle has angles 55° and 80°. Find the third angle.',
              solution: '45°',
              steps: ['All angles sum to 180°', '55° + 80° + x = 180°', '135° + x = 180°', 'x = 45°']
            }
          ]
        },
        {
          title: 'Types of Triangles',
          content: 'By sides: Equilateral (all sides equal), Isosceles (two sides equal), Scalene (no sides equal). By angles: Acute (all angles < 90°), Right (one angle = 90°), Obtuse (one angle > 90°).',
          examples: [
            {
              problem: 'A triangle has sides 7 cm, 7 cm, 10 cm. What type is it?',
              solution: 'Isosceles',
              steps: ['Two sides are equal (7 = 7)', 'Two equal sides → Isosceles triangle']
            }
          ]
        },
        {
          title: 'The Pythagorean Theorem',
          content: 'In a right triangle: a² + b² = c², where c is the hypotenuse (the side opposite the right angle, always the longest).',
          examples: [
            {
              problem: 'Find the hypotenuse of a right triangle with legs 5 cm and 12 cm.',
              solution: '13 cm',
              steps: ['c² = a² + b²', 'c² = 5² + 12²', 'c² = 25 + 144 = 169', 'c = √169 = 13 cm']
            },
            {
              problem: 'A right triangle has hypotenuse 10 m and one leg 6 m. Find the other leg.',
              solution: '8 m',
              steps: ['a² + b² = c²', '6² + b² = 10²', '36 + b² = 100', 'b² = 64', 'b = 8 m']
            }
          ]
        }
      ],
      summary: 'Triangle angles always sum to 180°. Triangles are classified by sides and angles. The Pythagorean theorem relates the sides of right triangles.',
      keyTakeaways: [
        'All triangle angles sum to 180°',
        'Equilateral: 3 equal sides; Isosceles: 2 equal sides; Scalene: no equal sides',
        'Pythagorean theorem: a² + b² = c² (right triangles only)',
        'Common triples: 3-4-5, 5-12-13, 8-15-17'
      ]
    }
  },

  {
    topic: 'Geometry', subtopic: 'Area', order: 3, difficulty: 'Intermediate',
    title: 'Area of Plane Figures',
    description: 'Calculate areas of rectangles, triangles, parallelograms, and trapezoids.',
    estimatedTime: 25,
    content: {
      introduction: 'Area measures the amount of space inside a two-dimensional shape. It is always expressed in square units (cm², m², km²). Knowing area formulas is essential for everything from tiling floors to designing gardens.',
      sections: [
        {
          title: 'Rectangle and Square',
          content: 'Rectangle: A = l × w. Square: A = s². The area of a rectangle is the product of its length and width.',
          examples: [
            {
              problem: 'Find the area of a rectangle 14 m long and 6 m wide.',
              solution: '84 m²',
              steps: ['A = l × w', 'A = 14 × 6', 'A = 84 m²']
            }
          ]
        },
        {
          title: 'Triangle',
          content: 'A = ½ × base × height. The height must be perpendicular to the base.',
          examples: [
            {
              problem: 'Find the area of a triangle with base 10 cm and height 7 cm.',
              solution: '35 cm²',
              steps: ['A = ½ × b × h', 'A = ½ × 10 × 7', 'A = ½ × 70 = 35 cm²']
            }
          ]
        },
        {
          title: 'Parallelogram and Trapezoid',
          content: 'Parallelogram: A = b × h. Trapezoid: A = ½(b₁ + b₂) × h, where b₁ and b₂ are the two parallel sides.',
          examples: [
            {
              problem: 'Find the area of a trapezoid with parallel sides 8 m and 12 m, and height 5 m.',
              solution: '50 m²',
              steps: ['A = ½(b₁ + b₂) × h', 'A = ½(8 + 12) × 5', 'A = ½ × 20 × 5 = 50 m²']
            }
          ]
        }
      ],
      summary: 'Each shape has its own area formula. Always check that height is perpendicular to the base, and express your answer in square units.',
      keyTakeaways: [
        'Rectangle: A = l × w',
        'Triangle: A = ½ × b × h',
        'Parallelogram: A = b × h',
        'Trapezoid: A = ½(b₁ + b₂) × h',
        'Area is always in square units'
      ]
    }
  },

  {
    topic: 'Geometry', subtopic: 'Basic Circles', order: 4, difficulty: 'Intermediate',
    title: 'Circles: Circumference and Area',
    description: 'Understand circle properties and calculate circumference and area using π.',
    estimatedTime: 20,
    content: {
      introduction: 'A circle is the set of all points equidistant from a central point. The fixed distance is the radius (r). The diameter (d) is twice the radius. π (pi) ≈ 3.14159 is the ratio of circumference to diameter for any circle.',
      sections: [
        {
          title: 'Key Measurements',
          content: 'Radius (r): distance from centre to edge. Diameter (d = 2r): distance across the circle through the centre. Circumference (C): the perimeter of the circle. Area (A): space enclosed.',
          examples: [
            {
              problem: 'A circle has radius 5 cm. Find the diameter.',
              solution: '10 cm',
              steps: ['d = 2r', 'd = 2 × 5 = 10 cm']
            }
          ]
        },
        {
          title: 'Circumference',
          content: 'C = 2πr or C = πd. The circumference is the distance around the circle.',
          examples: [
            {
              problem: 'Find the circumference of a circle with radius 7 cm. (π ≈ 3.14)',
              solution: '43.96 cm',
              steps: ['C = 2πr', 'C = 2 × 3.14 × 7', 'C = 43.96 cm']
            }
          ]
        },
        {
          title: 'Area',
          content: 'A = πr². Square the radius first, then multiply by π.',
          examples: [
            {
              problem: 'Find the area of a circle with radius 6 cm. (π ≈ 3.14)',
              solution: '113.04 cm²',
              steps: ['A = πr²', 'A = 3.14 × 6²', 'A = 3.14 × 36', 'A = 113.04 cm²']
            },
            {
              problem: 'A circular garden has diameter 10 m. Find its area. (π ≈ 3.14)',
              solution: '78.5 m²',
              steps: ['r = d/2 = 10/2 = 5 m', 'A = πr² = 3.14 × 25 = 78.5 m²']
            }
          ]
        }
      ],
      summary: 'Circumference uses the radius (or diameter) linearly; area squares the radius. Always find the radius first if only the diameter is given.',
      keyTakeaways: [
        'd = 2r (always find radius first if given diameter)',
        'Circumference: C = 2πr',
        'Area: A = πr²',
        'π ≈ 3.14 or 22/7 for calculations'
      ]
    }
  },

  // ══════════════════════════════════════════════════════
  // TRIGONOMETRY
  // ══════════════════════════════════════════════════════

  {
    topic: 'Trigonometry', subtopic: 'SOH-CAH-TOA', order: 1, difficulty: 'Beginner',
    title: 'SOH-CAH-TOA',
    description: 'Master the three primary trigonometric ratios using the SOH-CAH-TOA memory aid.',
    estimatedTime: 20,
    content: {
      introduction: 'Trigonometry connects angles to the sides of right triangles. The three basic ratios — sine, cosine, and tangent — can be remembered with SOH-CAH-TOA. They are used in engineering, physics, architecture, and navigation.',
      sections: [
        {
          title: 'Labelling the Sides',
          content: 'In a right triangle, the sides are named relative to the angle you are working with. Hypotenuse: always opposite the right angle (longest side). Opposite: the side directly across from your angle. Adjacent: the side next to your angle (not the hypotenuse).',
          examples: [
            {
              problem: 'In a right triangle, angle θ is at vertex A. The side across from θ has length 4, the hypotenuse is 5, and the remaining side is 3. Label each side relative to θ.',
              solution: 'Opposite = 4, Hypotenuse = 5, Adjacent = 3',
              steps: ['Hypotenuse is always opposite the 90° angle = 5', 'Opposite is across from θ = 4', 'Adjacent is next to θ = 3']
            }
          ]
        },
        {
          title: 'The Three Ratios',
          content: 'sin(θ) = Opposite/Hypotenuse (SOH). cos(θ) = Adjacent/Hypotenuse (CAH). tan(θ) = Opposite/Adjacent (TOA).',
          examples: [
            {
              problem: 'A right triangle has opposite = 8 and hypotenuse = 10. Find sin(θ), cos(θ), and tan(θ). (Adjacent = 6)',
              solution: 'sin = 4/5, cos = 3/5, tan = 4/3',
              steps: ['sin(θ) = 8/10 = 4/5 = 0.8', 'cos(θ) = 6/10 = 3/5 = 0.6', 'tan(θ) = 8/6 = 4/3 ≈ 1.333']
            }
          ]
        },
        {
          title: 'Finding a Missing Side',
          content: 'Choose the ratio that connects the known side, the unknown side, and the angle. Then solve for the unknown.',
          examples: [
            {
              problem: 'A right triangle has hypotenuse 15 m and angle 30°. Find the opposite side. (sin 30° = 0.5)',
              solution: '7.5 m',
              steps: ['We know angle and hypotenuse, want opposite → use sin', 'sin(30°) = opposite/15', '0.5 = opposite/15', 'opposite = 0.5 × 15 = 7.5 m']
            },
            {
              problem: 'Angle is 45°, adjacent side = 10. Find the hypotenuse. (cos 45° ≈ 0.707)',
              solution: '≈ 14.14',
              steps: ['Know angle and adjacent, want hypotenuse → use cos', 'cos(45°) = 10/hyp', '0.707 = 10/hyp', 'hyp = 10/0.707 ≈ 14.14']
            }
          ]
        }
      ],
      summary: 'Label sides as Opposite, Adjacent, and Hypotenuse relative to the angle. Use SOH-CAH-TOA to set up the equation, then solve.',
      keyTakeaways: [
        'SOH: sin = Opposite / Hypotenuse',
        'CAH: cos = Adjacent / Hypotenuse',
        'TOA: tan = Opposite / Adjacent',
        'Label sides relative to the given angle, not the right angle',
        'To find a side: rearrange the trig equation and solve'
      ]
    }
  },

  {
    topic: 'Trigonometry', subtopic: 'Basic Trig Ratios', order: 2, difficulty: 'Intermediate',
    title: 'Exact Values and the Unit Circle',
    description: 'Learn exact trigonometric values at 0°, 30°, 45°, 60°, and 90°, and understand the unit circle.',
    estimatedTime: 22,
    content: {
      introduction: 'Certain angles have exact trigonometric values that you should know without a calculator. These arise from equilateral and isosceles right triangles and are used throughout advanced mathematics and physics.',
      sections: [
        {
          title: 'Key Exact Values',
          content: 'These values come from two special right triangles: 30-60-90 and 45-45-90.',
          examples: [
            {
              problem: 'Without a calculator, find sin(30°) and cos(60°).',
              solution: 'sin(30°) = 1/2, cos(60°) = 1/2',
              steps: ['From the 30-60-90 triangle: sides are in ratio 1 : √3 : 2', 'sin(30°) = opposite/hyp = 1/2', 'cos(60°) = adjacent/hyp = 1/2', 'Note: sin(30°) = cos(60°) — complementary angles']
            },
            {
              problem: 'Find sin(45°) and cos(45°).',
              solution: '√2/2 ≈ 0.707',
              steps: ['45-45-90 triangle has sides 1 : 1 : √2', 'sin(45°) = 1/√2 = √2/2', 'cos(45°) = 1/√2 = √2/2']
            }
          ]
        },
        {
          title: 'The Pythagorean Identity',
          content: 'For any angle θ: sin²(θ) + cos²(θ) = 1. This is derived from the Pythagorean theorem applied to the unit circle.',
          examples: [
            {
              problem: 'If sin(θ) = 3/5, find cos(θ). (First quadrant)',
              solution: 'cos(θ) = 4/5',
              steps: ['Use sin²(θ) + cos²(θ) = 1', '(3/5)² + cos²(θ) = 1', '9/25 + cos²(θ) = 1', 'cos²(θ) = 16/25', 'cos(θ) = 4/5 (positive in Q1)']
            }
          ]
        }
      ],
      summary: 'Memorise exact values at 0°, 30°, 45°, 60°, 90°. Use the Pythagorean identity sin²+cos²=1 to find one ratio given the other.',
      keyTakeaways: [
        'sin(0°)=0, sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1',
        'cos values are sin values in reverse order for 0° to 90°',
        'Pythagorean identity: sin²θ + cos²θ = 1',
        'Complementary angles: sin(θ) = cos(90°−θ)'
      ]
    }
  },

  {
    topic: 'Trigonometry', subtopic: 'Simple Applications', order: 3, difficulty: 'Advanced',
    title: 'Applying Trigonometry',
    description: 'Apply trigonometry to solve real-world problems involving angles of elevation, depression, and the Law of Cosines.',
    estimatedTime: 25,
    content: {
      introduction: 'Trigonometry is not just about triangles on paper. It is used to calculate heights of buildings, distances across rivers, angles of ramps, and positions of ships. This lesson applies SOH-CAH-TOA and the Law of Cosines to practical problems.',
      sections: [
        {
          title: 'Angles of Elevation and Depression',
          content: 'The angle of elevation is measured upward from the horizontal. The angle of depression is measured downward. Both are measured from a horizontal line.',
          examples: [
            {
              problem: 'From a point 50 m from the base of a tree, the angle of elevation to the top is 35°. Find the tree\'s height. (tan 35° ≈ 0.700)',
              solution: '35 m',
              steps: ['Draw a right triangle', 'Adjacent = 50 m (horizontal distance), angle = 35°', 'tan(35°) = opposite/adjacent = height/50', 'height = 50 × 0.700 = 35 m']
            },
            {
              problem: 'From the top of a 30 m lighthouse, the angle of depression to a boat is 20°. How far is the boat from the base? (tan 20° ≈ 0.364)',
              solution: '≈ 82.4 m',
              steps: ['The lighthouse height = 30 m = opposite side', 'tan(20°) = opposite/adjacent = 30/distance', 'distance = 30/0.364 ≈ 82.4 m']
            }
          ]
        },
        {
          title: 'Law of Cosines',
          content: 'For non-right triangles: c² = a² + b² − 2ab·cos(C). This is a generalisation of the Pythagorean theorem.',
          examples: [
            {
              problem: 'A triangle has sides a=7, b=10, and angle C=60°. Find side c. (cos 60° = 0.5)',
              solution: '≈ 9.0',
              steps: ['c² = a² + b² − 2ab·cos(C)', 'c² = 49 + 100 − 2(7)(10)(0.5)', 'c² = 149 − 70 = 79', 'c = √79 ≈ 8.9']
            }
          ]
        }
      ],
      summary: 'Identify the angle type (elevation or depression), set up the correct trig ratio, and solve. Use the Law of Cosines for non-right triangles.',
      keyTakeaways: [
        'Angle of elevation: measured upward from horizontal',
        'Angle of depression: measured downward from horizontal',
        'Always draw a diagram and label sides and angles',
        'Law of Cosines: c² = a² + b² − 2ab·cos(C)',
        'When angle C = 90°, the Law of Cosines becomes the Pythagorean theorem'
      ]
    }
  }
);

// ─── Seed runner ──────────────────────────────────────────────────────────────

const seedLessons = async () => {
  try {
    console.log('🌐 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Lesson.deleteMany({});
    await PracticeProblem.deleteMany({});
    console.log('🗑️  Cleared existing lessons and problems');

    const created = await Lesson.insertMany(lessons);
    console.log(`✅ Created ${created.length} lessons\n`);

    console.log('📚 Lessons seeded:');
    created.forEach(l => console.log(`   ${l.topic} › ${l.subtopic} › ${l.title}`));

    console.log('\n✅ Done! Run the backend and lessons will be available immediately.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedLessons();
