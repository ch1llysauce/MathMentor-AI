// Frontend curriculum structure - mirrors backend curriculum-structure.js
import { Curriculum } from '../types/curriculum';

export const CURRICULUM: Curriculum = {
  // ============================================
  // ALGEBRA
  // ============================================
  Algebra: {
    modules: [
      {
        moduleNumber: 1,
        moduleName: 'Foundations',
        lessons: [
          { order: 1, title: 'Real Numbers', learningObjectives: ['Understand number classifications', 'Compare and order real numbers', 'Identify rational vs irrational numbers'] },
          { order: 2, title: 'Order of Operations (PEMDAS)', learningObjectives: ['Apply PEMDAS correctly', 'Evaluate nested expressions', 'Avoid common operation mistakes'] },
          { order: 3, title: 'Fractions, Decimals, and Percentages', learningObjectives: ['Convert between forms', 'Perform operations on fractions', 'Solve percentage problems'] },
          { order: 4, title: 'Exponents and Radicals', learningObjectives: ['Apply exponent rules', 'Simplify radical expressions', 'Work with negative and fractional exponents'] },
          { order: 5, title: 'Scientific Notation', learningObjectives: ['Express numbers in scientific notation', 'Perform operations in scientific notation', 'Convert standard to scientific form'] }
        ]
      },
      {
        moduleNumber: 2,
        moduleName: 'Algebraic Expressions',
        lessons: [
          { order: 1, title: 'Variables and Constants', learningObjectives: ['Distinguish variables from constants', 'Identify coefficients', 'Understand algebraic terminology'] },
          { order: 2, title: 'Algebraic Expressions', learningObjectives: ['Write algebraic expressions from words', 'Identify terms and factors', 'Translate between verbal and algebraic forms'] },
          { order: 3, title: 'Combining Like Terms', learningObjectives: ['Identify like terms', 'Simplify expressions by combining', 'Apply commutative and associative properties'] },
          { order: 4, title: 'Distributive Property', learningObjectives: ['Apply distributive property', 'Expand expressions', 'Factor using distributive property'] },
          { order: 5, title: 'Evaluating Expressions', learningObjectives: ['Substitute values for variables', 'Evaluate algebraic expressions', 'Use order of operations in evaluation'] }
        ]
      },
      {
        moduleNumber: 3,
        moduleName: 'Linear Equations',
        lessons: [
          { order: 1, title: 'One-Step Equations', learningObjectives: ['Solve equations using one operation', 'Apply inverse operations', 'Verify solutions'] },
          { order: 2, title: 'Two-Step Equations', learningObjectives: ['Solve equations requiring two operations', 'Choose appropriate order of operations', 'Check solutions'] },
          { order: 3, title: 'Multi-Step Equations', learningObjectives: ['Solve complex equations', 'Combine like terms before solving', 'Handle variables on both sides'] },
          { order: 4, title: 'Equations with Fractions', learningObjectives: ['Clear fractions by multiplying LCD', 'Solve fractional equations', 'Avoid extraneous solutions'] },
          { order: 5, title: 'Literal Equations', learningObjectives: ['Solve for specified variable', 'Rearrange formulas', 'Apply to real-world formulas'] }
        ]
      },
      {
        moduleNumber: 4,
        moduleName: 'Linear Inequalities',
        lessons: [
          { order: 1, title: 'One-Variable Inequalities', learningObjectives: ['Solve and graph inequalities', 'Understand inequality symbols', 'Reverse inequality when multiplying/dividing by negative'] },
          { order: 2, title: 'Compound Inequalities', learningObjectives: ['Solve AND/OR compound inequalities', 'Graph solution sets', 'Write solution in interval notation'] },
          { order: 3, title: 'Absolute Value Inequalities', learningObjectives: ['Solve absolute value inequalities', 'Interpret as distance', 'Graph solution sets'] }
        ]
      },
      {
        moduleNumber: 5,
        moduleName: 'Graphing',
        lessons: [
          { order: 1, title: 'Cartesian Coordinate Plane', learningObjectives: ['Plot points on coordinate plane', 'Identify quadrants', 'Understand ordered pairs'] },
          { order: 2, title: 'Slope', learningObjectives: ['Calculate slope from two points', 'Interpret slope as rate of change', 'Identify positive, negative, zero, undefined slopes'] },
          { order: 3, title: 'Slope-Intercept Form', learningObjectives: ['Identify slope and y-intercept', 'Graph using y = mx + b', 'Write equation from graph'] },
          { order: 4, title: 'Point-Slope Form', learningObjectives: ['Use point-slope formula', 'Convert between forms', 'Write equation from point and slope'] },
          { order: 5, title: 'Graphing Linear Equations', learningObjectives: ['Graph lines using various methods', 'Find intercepts', 'Graph horizontal and vertical lines'] }
        ]
      },
      {
        moduleNumber: 6,
        moduleName: 'Systems',
        lessons: [
          { order: 1, title: 'Systems of Linear Equations', learningObjectives: ['Understand what a system is', 'Identify solution types', 'Determine if point is a solution'] },
          { order: 2, title: 'Substitution Method', learningObjectives: ['Solve systems by substitution', 'Choose appropriate variable to isolate', 'Check solutions'] },
          { order: 3, title: 'Elimination Method', learningObjectives: ['Solve systems by elimination', 'Multiply to create opposites', 'Identify best method'] },
          { order: 4, title: 'Graphical Method', learningObjectives: ['Solve systems graphically', 'Identify solution as intersection point', 'Recognize parallel and coincident lines'] }
        ]
      },
      {
        moduleNumber: 7,
        moduleName: 'Polynomials',
        lessons: [
          { order: 1, title: 'Polynomial Operations', learningObjectives: ['Add and subtract polynomials', 'Multiply polynomials', 'Identify degree and leading coefficient'] },
          { order: 2, title: 'Special Products', learningObjectives: ['Apply FOIL method', 'Recognize special products', 'Square binomials'] },
          { order: 3, title: 'Factoring GCF', learningObjectives: ['Find greatest common factor', 'Factor out GCF', 'Factor by grouping'] },
          { order: 4, title: 'Factoring Trinomials', learningObjectives: ['Factor ax² + bx + c', 'Use AC method', 'Check by multiplying'] },
          { order: 5, title: 'Difference of Squares', learningObjectives: ['Recognize a² - b² pattern', 'Factor difference of squares', 'Apply to solving equations'] },
          { order: 6, title: 'Perfect Square Trinomials', learningObjectives: ['Recognize perfect square patterns', 'Factor perfect squares', 'Distinguish from general trinomials'] }
        ]
      },
      {
        moduleNumber: 8,
        moduleName: 'Quadratics',
        lessons: [
          { order: 1, title: 'Quadratic Equations', learningObjectives: ['Identify quadratic equations', 'Solve by factoring', 'Apply zero product property'] },
          { order: 2, title: 'Completing the Square', learningObjectives: ['Complete the square', 'Solve by completing the square', 'Derive quadratic formula'] },
          { order: 3, title: 'Quadratic Formula', learningObjectives: ['Apply quadratic formula', 'Calculate discriminant', 'Interpret number and type of solutions'] },
          { order: 4, title: 'Graphing Parabolas', learningObjectives: ['Graph quadratic functions', 'Find vertex and axis of symmetry', 'Identify domain and range'] },
          { order: 5, title: 'Vertex Form', learningObjectives: ['Convert to vertex form', 'Identify transformations', 'Find maximum or minimum value'] }
        ]
      },
      {
        moduleNumber: 9,
        moduleName: 'Functions',
        lessons: [
          { order: 1, title: 'Function Notation', learningObjectives: ['Understand f(x) notation', 'Evaluate functions', 'Interpret function values'] },
          { order: 2, title: 'Domain and Range', learningObjectives: ['Determine domain and range', 'Use interval notation', 'Identify restrictions'] },
          { order: 3, title: 'Function Operations', learningObjectives: ['Add, subtract, multiply functions', 'Divide functions', 'Find composite functions'] },
          { order: 4, title: 'Inverse Functions', learningObjectives: ['Find inverse functions', 'Verify inverses', 'Understand one-to-one property'] }
        ]
      },
      {
        moduleNumber: 10,
        moduleName: 'Exponential & Logarithmic',
        lessons: [
          { order: 1, title: 'Exponential Functions', learningObjectives: ['Graph exponential functions', 'Identify growth vs decay', 'Solve exponential equations'] },
          { order: 2, title: 'Logarithms', learningObjectives: ['Understand logarithm definition', 'Convert between exponential and logarithmic form', 'Evaluate logarithms'] },
          { order: 3, title: 'Logarithmic Equations', learningObjectives: ['Solve logarithmic equations', 'Apply logarithm properties', 'Check for extraneous solutions'] }
        ]
      }
    ]
  },

  // ============================================
  // GEOMETRY
  // ============================================
  Geometry: {
    modules: [
      {
        moduleNumber: 1,
        moduleName: 'Basics',
        lessons: [
          { order: 1, title: 'Points, Lines, and Planes', learningObjectives: ['Define basic geometric terms', 'Identify collinear and coplanar points', 'Name geometric figures'] },
          { order: 2, title: 'Line Segments', learningObjectives: ['Define line segments', 'Find lengths', 'Identify congruent segments'] },
          { order: 3, title: 'Rays', learningObjectives: ['Define rays', 'Name rays correctly', 'Distinguish from lines and segments'] },
          { order: 4, title: 'Angles', learningObjectives: ['Define and classify angles', 'Name angles properly', 'Identify angle relationships'] },
          { order: 5, title: 'Measuring Angles', learningObjectives: ['Use protractor', 'Find angle measures', 'Work with angle addition postulate'] }
        ]
      },
      {
        moduleNumber: 2,
        moduleName: 'Triangles',
        lessons: [
          { order: 1, title: 'Types of Triangles', learningObjectives: ['Classify by sides', 'Classify by angles', 'Identify triangle properties'] },
          { order: 2, title: 'Triangle Angle Sum', learningObjectives: ['Apply angle sum theorem', 'Find missing angles', 'Work with exterior angles'] },
          { order: 3, title: 'Congruent Triangles', learningObjectives: ['Understand congruence', 'Apply SSS, SAS, ASA, AAS, HL', 'Prove triangles congruent'] },
          { order: 4, title: 'Similar Triangles', learningObjectives: ['Understand similarity', 'Apply AA, SAS, SSS similarity', 'Solve using proportions'] },
          { order: 5, title: 'Pythagorean Theorem', learningObjectives: ['Apply Pythagorean theorem', 'Identify Pythagorean triples', 'Use in real-world problems'] }
        ]
      },
      {
        moduleNumber: 3,
        moduleName: 'Polygons',
        lessons: [
          { order: 1, title: 'Quadrilaterals', learningObjectives: ['Classify quadrilaterals', 'Identify properties of special quadrilaterals', 'Find missing measures'] },
          { order: 2, title: 'Regular Polygons', learningObjectives: ['Define regular polygons', 'Find properties', 'Calculate perimeter'] },
          { order: 3, title: 'Interior Angles', learningObjectives: ['Find sum of interior angles', 'Calculate individual angles', 'Apply to regular polygons'] },
          { order: 4, title: 'Exterior Angles', learningObjectives: ['Find sum of exterior angles', 'Calculate individual exterior angles', 'Relate to interior angles'] }
        ]
      },
      {
        moduleNumber: 4,
        moduleName: 'Circles',
        lessons: [
          { order: 1, title: 'Radius', learningObjectives: ['Define radius', 'Calculate radius from other measures', 'Apply in formulas'] },
          { order: 2, title: 'Diameter', learningObjectives: ['Define diameter', 'Relate diameter to radius', 'Use in calculations'] },
          { order: 3, title: 'Chords', learningObjectives: ['Define chords', 'Apply chord properties', 'Solve chord problems'] },
          { order: 4, title: 'Arcs', learningObjectives: ['Define and measure arcs', 'Classify as major, minor, semicircle', 'Find arc length'] },
          { order: 5, title: 'Central Angles', learningObjectives: ['Define central angles', 'Relate to arc measure', 'Solve central angle problems'] },
          { order: 6, title: 'Inscribed Angles', learningObjectives: ['Define inscribed angles', 'Apply inscribed angle theorem', 'Solve inscribed angle problems'] }
        ]
      },
      {
        moduleNumber: 5,
        moduleName: 'Perimeter & Area',
        lessons: [
          { order: 1, title: 'Perimeter', learningObjectives: ['Find perimeter of polygons', 'Apply formulas', 'Solve perimeter problems'] },
          { order: 2, title: 'Area of Triangles', learningObjectives: ['Apply triangle area formula', 'Use base and height', 'Calculate with different information'] },
          { order: 3, title: 'Area of Quadrilaterals', learningObjectives: ['Find area of rectangles, parallelograms, trapezoids', 'Apply appropriate formulas', 'Distinguish between shapes'] },
          { order: 4, title: 'Area of Circles', learningObjectives: ['Apply circle area formula', 'Find area from radius or diameter', 'Calculate sector area'] },
          { order: 5, title: 'Composite Figures', learningObjectives: ['Break down composite figures', 'Calculate total area', 'Subtract areas when needed'] }
        ]
      },
      {
        moduleNumber: 6,
        moduleName: 'Solid Geometry',
        lessons: [
          { order: 1, title: 'Prisms', learningObjectives: ['Identify prism types', 'Understand prism properties', 'Name prisms correctly'] },
          { order: 2, title: 'Cylinders', learningObjectives: ['Identify cylinders', 'Understand cylinder properties', 'Relate to prisms'] },
          { order: 3, title: 'Cones', learningObjectives: ['Identify cones', 'Understand cone properties', 'Find slant height'] },
          { order: 4, title: 'Pyramids', learningObjectives: ['Identify pyramid types', 'Understand pyramid properties', 'Find slant height'] },
          { order: 5, title: 'Spheres', learningObjectives: ['Identify spheres', 'Understand sphere properties', 'Distinguish from other solids'] }
        ]
      },
      {
        moduleNumber: 7,
        moduleName: 'Surface Area & Volume',
        lessons: [
          { order: 1, title: 'Surface Area', learningObjectives: ['Calculate surface area of solids', 'Identify all faces', 'Apply appropriate formulas'] },
          { order: 2, title: 'Volume', learningObjectives: ['Calculate volume of solids', 'Apply volume formulas', 'Understand cubic units'] },
          { order: 3, title: 'Composite Solids', learningObjectives: ['Break down composite solids', 'Calculate total volume and surface area', 'Subtract when needed'] }
        ]
      },
      {
        moduleNumber: 8,
        moduleName: 'Coordinate Geometry',
        lessons: [
          { order: 1, title: 'Distance Formula', learningObjectives: ['Apply distance formula', 'Find distance between two points', 'Derive from Pythagorean theorem'] },
          { order: 2, title: 'Midpoint Formula', learningObjectives: ['Apply midpoint formula', 'Find midpoint of segment', 'Use in coordinate proofs'] },
          { order: 3, title: 'Equation of a Circle', learningObjectives: ['Write equation in standard form', 'Identify center and radius', 'Graph circles'] }
        ]
      },
      {
        moduleNumber: 9,
        moduleName: 'Transformations',
        lessons: [
          { order: 1, title: 'Translation', learningObjectives: ['Perform translations', 'Describe translations', 'Use coordinate notation'] },
          { order: 2, title: 'Rotation', learningObjectives: ['Perform rotations', 'Identify center and angle of rotation', 'Apply rotation rules'] },
          { order: 3, title: 'Reflection', learningObjectives: ['Perform reflections', 'Reflect over x-axis, y-axis, and y=x', 'Identify line of reflection'] },
          { order: 4, title: 'Dilation', learningObjectives: ['Perform dilations', 'Identify scale factor', 'Distinguish from rigid transformations'] }
        ]
      }
    ]
  },

  // ============================================
  // TRIGONOMETRY
  // ============================================
  Trigonometry: {
    modules: [
      {
        moduleNumber: 1,
        moduleName: 'Foundations',
        lessons: [
          { order: 1, title: 'Angle Measurement', learningObjectives: ['Understand angle concepts', 'Measure angles in standard position', 'Identify initial and terminal sides'] },
          { order: 2, title: 'Degrees and Radians', learningObjectives: ['Convert between degrees and radians', 'Understand radian measure', 'Use both systems appropriately'] },
          { order: 3, title: 'Coterminal Angles', learningObjectives: ['Find coterminal angles', 'Understand periodic nature', 'Use reference angles'] }
        ]
      },
      {
        moduleNumber: 2,
        moduleName: 'Right Triangle Trigonometry',
        lessons: [
          { order: 1, title: 'Sine', learningObjectives: ['Define sine ratio', 'Calculate sine values', 'Apply to right triangles'] },
          { order: 2, title: 'Cosine', learningObjectives: ['Define cosine ratio', 'Calculate cosine values', 'Apply to right triangles'] },
          { order: 3, title: 'Tangent', learningObjectives: ['Define tangent ratio', 'Calculate tangent values', 'Apply to right triangles'] },
          { order: 4, title: 'Reciprocal Functions', learningObjectives: ['Define cosecant, secant, cotangent', 'Calculate reciprocal values', 'Relate to primary functions'] },
          { order: 5, title: 'SOHCAHTOA', learningObjectives: ['Apply SOHCAHTOA mnemonic', 'Choose appropriate ratio', 'Solve for sides and angles'] }
        ]
      },
      {
        moduleNumber: 3,
        moduleName: 'Applications',
        lessons: [
          { order: 1, title: 'Solving Right Triangles', learningObjectives: ['Find all sides and angles', 'Use Pythagorean theorem with trig', 'Apply inverse functions'] },
          { order: 2, title: 'Angle of Elevation', learningObjectives: ['Define angle of elevation', 'Set up problems correctly', 'Solve elevation problems'] },
          { order: 3, title: 'Angle of Depression', learningObjectives: ['Define angle of depression', 'Relate to angle of elevation', 'Solve depression problems'] }
        ]
      },
      {
        moduleNumber: 4,
        moduleName: 'Unit Circle',
        lessons: [
          { order: 1, title: 'Unit Circle', learningObjectives: ['Understand unit circle definition', 'Find coordinates on unit circle', 'Relate to trig functions'] },
          { order: 2, title: 'Reference Angles', learningObjectives: ['Find reference angles', 'Use reference angles to find trig values', 'Work in all four quadrants'] },
          { order: 3, title: 'Exact Values', learningObjectives: ['Memorize special angles', 'Find exact values without calculator', 'Recognize common patterns'] }
        ]
      },
      {
        moduleNumber: 5,
        moduleName: 'Graphs',
        lessons: [
          { order: 1, title: 'Graph of Sine', learningObjectives: ['Graph y = sin(x)', 'Identify key features', 'Understand periodic behavior'] },
          { order: 2, title: 'Graph of Cosine', learningObjectives: ['Graph y = cos(x)', 'Compare to sine graph', 'Identify phase shift'] },
          { order: 3, title: 'Graph of Tangent', learningObjectives: ['Graph y = tan(x)', 'Identify asymptotes', 'Understand period of tangent'] },
          { order: 4, title: 'Amplitude', learningObjectives: ['Define amplitude', 'Identify amplitude from graph or equation', 'Graph with different amplitudes'] },
          { order: 5, title: 'Period', learningObjectives: ['Define period', 'Calculate period from equation', 'Graph with different periods'] },
          { order: 6, title: 'Phase Shift', learningObjectives: ['Define phase shift', 'Identify horizontal translations', 'Graph with phase shifts'] }
        ]
      },
      {
        moduleNumber: 6,
        moduleName: 'Trigonometric Identities',
        lessons: [
          { order: 1, title: 'Pythagorean Identities', learningObjectives: ['Apply sin²θ + cos²θ = 1', 'Use derived identities', 'Simplify expressions'] },
          { order: 2, title: 'Reciprocal Identities', learningObjectives: ['Apply reciprocal relationships', 'Convert between functions', 'Simplify using reciprocals'] },
          { order: 3, title: 'Quotient Identities', learningObjectives: ['Apply tan = sin/cos', 'Apply cot = cos/sin', 'Use in simplification'] },
          { order: 4, title: 'Even-Odd Identities', learningObjectives: ['Identify even and odd functions', 'Apply negative angle identities', 'Simplify expressions'] }
        ]
      },
      {
        moduleNumber: 7,
        moduleName: 'Trigonometric Equations',
        lessons: [
          { order: 1, title: 'Basic Trigonometric Equations', learningObjectives: ['Solve equations like sin(x) = a', 'Use inverse functions', 'Find principal solutions'] },
          { order: 2, title: 'Multiple Solutions', learningObjectives: ['Find all solutions in an interval', 'Use periodicity', 'Apply general solutions'] }
        ]
      },
      {
        moduleNumber: 8,
        moduleName: 'Laws',
        lessons: [
          { order: 1, title: 'Law of Sines', learningObjectives: ['Apply law of sines', 'Solve non-right triangles', 'Handle ambiguous case'] },
          { order: 2, title: 'Law of Cosines', learningObjectives: ['Apply law of cosines', 'Choose between laws appropriately', 'Solve SSS and SAS cases'] }
        ]
      },
      {
        moduleNumber: 9,
        moduleName: 'Advanced',
        lessons: [
          { order: 1, title: 'Sum and Difference Identities', learningObjectives: ['Apply sum and difference formulas', 'Derive other identities', 'Simplify complex expressions'] },
          { order: 2, title: 'Double-Angle Identities', learningObjectives: ['Apply double-angle formulas', 'Derive from sum identities', 'Use in equations'] },
          { order: 3, title: 'Half-Angle Identities', learningObjectives: ['Apply half-angle formulas', 'Determine correct sign', 'Solve half-angle equations'] }
        ]
      }
    ]
  }
};

// Helper functions
export function getTotalLessons(subject: keyof typeof CURRICULUM): number {
  return CURRICULUM[subject].modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
}

export function getModuleByNumber(subject: keyof typeof CURRICULUM, moduleNumber: number) {
  return CURRICULUM[subject].modules.find(m => m.moduleNumber === moduleNumber);
}

export function getAllModules(subject: keyof typeof CURRICULUM) {
  return CURRICULUM[subject].modules;
}
