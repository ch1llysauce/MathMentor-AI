/**
 * Diagnostic Question Generator
 * Generates fresh multiple-choice questions with random numbers on every call.
 * Mirrors the pattern of clientProblemGenerator.ts on the frontend.
 * No DB queries needed — 9 buckets (3 topics × 3 difficulties), 1 question per bucket.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = arr => arr[Math.floor(Math.random() * arr.length)];

const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Build shuffled choices array from a correct answer + up to 3 wrong answers
const mc = (correct, wrongs) => shuffle([correct, ...wrongs.slice(0, 3)]);

// ─── Algebra Templates ────────────────────────────────────────────────────────

const Algebra_Easy = [
    () => {
        const a = randInt(1, 12), x = randInt(1, 20), b = x + a;
        return {
            subtopic: "Linear Equations",
            question: `Solve for x:  x + ${a} = ${b}`,
            correctAnswer: `${x}`,
            choices: mc(`${x}`, [`${x + 1}`, `${x - 1}`, `${b}`]),
            explanation: `Subtract ${a} from both sides: x = ${b} − ${a} = ${x}.`,
            hints: ["Isolate x by subtracting the same number from both sides."],
        };
    },
    () => {
        const a = randInt(2, 9), x = randInt(2, 12), b = a * x;
        return {
            subtopic: "Linear Equations",
            question: `Solve for x:  ${a}x = ${b}`,
            correctAnswer: `${x}`,
            choices: mc(`${x}`, [`${x + 2}`, `${x - 1}`, `${a + x}`]),
            explanation: `Divide both sides by ${a}: x = ${b} ÷ ${a} = ${x}.`,
            hints: ["Divide both sides by the coefficient of x."],
        };
    },
    () => {
        const n = randInt(2, 9), d = randInt(2, 9);
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const g = gcd(n, d);
        return {
            subtopic: "Fractions",
            question: `Simplify the fraction ${n * 2}/${d * 2}.`,
            correctAnswer: `${n}/${d}`,
            choices: mc(`${n}/${d}`, [`${n + 1}/${d}`, `${n}/${d + 1}`, `${n * 2 - 1}/${d * 2}`]),
            explanation: `Divide numerator and denominator by ${2}: ${n * 2}/${d * 2} = ${n}/${d}.`,
            hints: ["Find the greatest common divisor of both numbers."],
        };
    },
];

const Algebra_Medium = [
    () => {
        const a = randInt(2, 7), b = randInt(1, 8), x = randInt(1, 10), c = a * x + b;
        return {
            subtopic: "Linear Equations",
            question: `Solve for x:  ${a}x + ${b} = ${c}`,
            correctAnswer: `${x}`,
            choices: mc(`${x}`, [`${x + 1}`, `${x - 1}`, `${x + 3}`]),
            explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${x}.`,
            hints: ["Move the constant to the right side first, then divide."],
        };
    },
    () => {
        const p = randInt(1, 6), q = randInt(1, 6);
        const B = -(p + q), C = p * q;
        const bs = B >= 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
        const cs = C >= 0 ? `+ ${C}` : `− ${Math.abs(C)}`;
        return {
            subtopic: "Factoring",
            question: `Solve:  x² ${bs}x ${cs} = 0`,
            correctAnswer: `x = ${p} or x = ${q}`,
            choices: mc(`x = ${p} or x = ${q}`, [`x = ${-p} or x = ${-q}`, `x = ${p}`, `x = ${q}`]),
            explanation: `Factor: (x − ${p})(x − ${q}) = 0, so x = ${p} or x = ${q}.`,
            hints: ["Find two numbers that multiply to the constant and add to the x coefficient."],
        };
    },
    () => {
        const a = randInt(2, 6), b = randInt(1, 8), x = randInt(1, 8), rhs = a * (x + b);
        return {
            subtopic: "Linear Equations",
            question: `Solve for x:  ${a}(x + ${b}) = ${rhs}`,
            correctAnswer: `${x}`,
            choices: mc(`${x}`, [`${x + 2}`, `${x - 2}`, `${rhs}`]),
            explanation: `Distribute: ${a}x + ${a * b} = ${rhs}. Subtract ${a * b}: x = ${x}.`,
            hints: ["Expand the brackets first, then solve."],
        };
    },
];

const Algebra_Hard = [
    () => {
        const p = randInt(1, 6), q = randInt(1, 6);
        const B = p + q, C = p * q;
        const bs = B > 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
        const cs = C > 0 ? `+ ${C}` : `− ${Math.abs(C)}`;
        return {
            subtopic: "Factoring",
            question: `Factor and solve:  x² ${bs}x ${cs} = 0`,
            correctAnswer: `x = ${-p} or x = ${-q}`,
            choices: mc(`x = ${-p} or x = ${-q}`, [`x = ${p} or x = ${q}`, `x = ${-p}`, `No real solutions`]),
            explanation: `(x + ${p})(x + ${q}) = 0 → x = ${-p} or x = ${-q}.`,
            hints: ["Numbers that multiply to the constant and add to the x coefficient."],
        };
    },
    () => {
        const base = randChoice([2, 3, 4]), exp = randInt(2, 5), result = Math.pow(base, exp);
        return {
            subtopic: "Factoring",
            question: `Solve for x:  ${base}^x = ${result}`,
            correctAnswer: `x = ${exp}`,
            choices: mc(`x = ${exp}`, [`x = ${exp + 1}`, `x = ${exp - 1}`, `x = ${result}`]),
            explanation: `${result} = ${base}^${exp}, so x = ${exp}.`,
            hints: ["Express the right side as a power of the base on the left."],
        };
    },
    () => {
        const k = randInt(1, 4), X = randInt(2, 10), a = randInt(3, 7), b = randInt(1, 6);
        const rhs = b + k * X;
        const lhsCoef = a, rhsCoef = a - k;
        return {
            subtopic: "Linear Equations",
            question: `Solve:  ${lhsCoef}x + ${b} = ${rhsCoef}x + ${rhs}`,
            correctAnswer: `x = ${X}`,
            choices: mc(`x = ${X}`, [`x = ${X + 2}`, `x = ${X - 1}`, `x = ${-X}`]),
            explanation: `Move x terms: ${k}x = ${k * X}. Divide: x = ${X}.`,
            hints: ["Collect all x terms on one side and constants on the other."],
        };
    },
];

// ─── Geometry Templates ───────────────────────────────────────────────────────

const Geometry_Easy = [
    () => {
        const a1 = randInt(20, 80), a2 = 180 - a1;
        return {
            subtopic: "Angles",
            question: `Two angles are supplementary. One measures ${a1}°. What is the other?`,
            correctAnswer: `${a2}°`,
            choices: mc(`${a2}°`, [`${90 - a1}°`, `${a2 + 5}°`, `${a2 - 5}°`]),
            explanation: `Supplementary angles add to 180°. 180 − ${a1} = ${a2}°.`,
            hints: ["Supplementary angles sum to 180°."],
        };
    },
    () => {
        const a = randInt(30, 80), b = randInt(20, 60), c = 180 - a - b;
        return {
            subtopic: "Triangles",
            question: `A triangle has two angles of ${a}° and ${b}°. What is the third angle?`,
            correctAnswer: `${c}°`,
            choices: mc(`${c}°`, [`${c + 5}°`, `${c - 5}°`, `${180 - a}°`]),
            explanation: `Triangle angles sum to 180°. Third = 180 − ${a} − ${b} = ${c}°.`,
            hints: ["All three angles of a triangle add up to 180°."],
        };
    },
    () => {
        const v = randInt(15, 75);
        return {
            subtopic: "Angles",
            question: `Two lines intersect. One vertical angle is ${v}°. What is the opposite vertical angle?`,
            correctAnswer: `${v}°`,
            choices: mc(`${v}°`, [`${180 - v}°`, `${90 - v}°`, `${v + 10}°`]),
            explanation: `Vertical angles are equal, so the opposite angle is also ${v}°.`,
            hints: ["Vertical angles are always equal."],
        };
    },
];

const Geometry_Medium = [
    () => {
        const l = randInt(5, 20), w = randInt(3, 15);
        return {
            subtopic: "Area",
            question: `Find the area of a rectangle: length ${l} cm, width ${w} cm.`,
            correctAnswer: `${l * w} cm²`,
            choices: mc(`${l * w} cm²`, [`${2 * (l + w)} cm²`, `${l * w + 5} cm²`, `${l * w - 3} cm²`]),
            explanation: `Area = l × w = ${l} × ${w} = ${l * w} cm².`,
            hints: ["Area of rectangle = length × width."],
        };
    },
    () => {
        const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
        const [a, b, c] = randChoice(triples);
        return {
            subtopic: "Triangles",
            question: `A right triangle has legs ${a} cm and ${b} cm. Find the hypotenuse.`,
            correctAnswer: `${c} cm`,
            choices: mc(`${c} cm`, [`${c + 2} cm`, `${c - 1} cm`, `${a + b} cm`]),
            explanation: `c² = ${a}² + ${b}² = ${a*a + b*b}, so c = ${c} cm.`,
            hints: ["Use the Pythagorean theorem: a² + b² = c²."],
        };
    },
    () => {
        const b = randInt(4, 20), h = randInt(3, 15), area = (b * h) / 2;
        return {
            subtopic: "Area",
            question: `Find the area of a triangle: base ${b} m, height ${h} m.`,
            correctAnswer: `${area} m²`,
            choices: mc(`${area} m²`, [`${b * h} m²`, `${area + 4} m²`, `${area - 2} m²`]),
            explanation: `Area = ½ × ${b} × ${h} = ${area} m².`,
            hints: ["Area of triangle = ½ × base × height."],
        };
    },
];

const Geometry_Hard = [
    () => {
        const r = randInt(3, 12), area = parseFloat((3.14 * r * r).toFixed(1));
        return {
            subtopic: "Basic Circles",
            question: `Find the area of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${area} cm²`,
            choices: mc(`${area} cm²`, [`${parseFloat((2*3.14*r).toFixed(1))} cm²`, `${area + 6} cm²`, `${parseFloat((3.14*(r+1)*(r+1)).toFixed(1))} cm²`]),
            explanation: `Area = πr² = 3.14 × ${r}² = ${area} cm².`,
            hints: ["Area of circle = π × r²."],
        };
    },
    () => {
        const b1 = randInt(4, 12), b2 = randInt(8, 18), h = randInt(3, 10), area = ((b1+b2)*h)/2;
        return {
            subtopic: "Area",
            question: `Trapezoid with parallel sides ${b1} m and ${b2} m, height ${h} m. Find the area.`,
            correctAnswer: `${area} m²`,
            choices: mc(`${area} m²`, [`${(b1+b2)*h} m²`, `${area + 5} m²`, `${area - 4} m²`]),
            explanation: `Area = ½(${b1} + ${b2}) × ${h} = ${area} m².`,
            hints: ["Trapezoid area = ½ × (sum of parallel sides) × height."],
        };
    },
    () => {
        const r = randInt(3, 10), circ = parseFloat((2*3.14*r).toFixed(1));
        return {
            subtopic: "Basic Circles",
            question: `Find the circumference of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${circ} cm`,
            choices: mc(`${circ} cm`, [`${parseFloat((3.14*r*r).toFixed(1))} cm²`, `${circ + 3} cm`, `${circ - 2} cm`]),
            explanation: `Circumference = 2πr = 2 × 3.14 × ${r} = ${circ} cm.`,
            hints: ["Circumference = 2πr."],
        };
    },
];

// ─── Trigonometry Templates ───────────────────────────────────────────────────

const Trigonometry_Easy = [
    () => {
        const pairs = [
            { angle: 0,  ratio: "sin", answer: "0",    wrongs: ["1", "1/2", "√2/2"] },
            { angle: 90, ratio: "sin", answer: "1",    wrongs: ["0", "1/2", "√3/2"] },
            { angle: 0,  ratio: "cos", answer: "1",    wrongs: ["0", "1/2", "√2/2"] },
            { angle: 90, ratio: "cos", answer: "0",    wrongs: ["1", "1/2", "√3/2"] },
            { angle: 30, ratio: "sin", answer: "1/2",  wrongs: ["√3/2", "√2/2", "1"] },
            { angle: 60, ratio: "cos", answer: "1/2",  wrongs: ["√3/2", "√2/2", "0"] },
            { angle: 45, ratio: "sin", answer: "√2/2", wrongs: ["1/2", "√3/2", "1"] },
        ];
        const p = randChoice(pairs);
        return {
            subtopic: "Basic Trig Ratios",
            question: `What is ${p.ratio}(${p.angle}°)?`,
            correctAnswer: p.answer,
            choices: mc(p.answer, p.wrongs),
            explanation: `${p.ratio}(${p.angle}°) = ${p.answer}. Standard unit circle value.`,
            hints: ["Memorise: sin(0°)=0, sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1."],
        };
    },
    () => {
        const defs = [
            { ratio: "sin(θ)", answer: "Opposite / Hypotenuse", wrongs: ["Adjacent / Hypotenuse", "Opposite / Adjacent", "Hypotenuse / Opposite"] },
            { ratio: "cos(θ)", answer: "Adjacent / Hypotenuse", wrongs: ["Opposite / Hypotenuse", "Opposite / Adjacent", "Hypotenuse / Adjacent"] },
            { ratio: "tan(θ)", answer: "Opposite / Adjacent",   wrongs: ["Adjacent / Hypotenuse", "Opposite / Hypotenuse", "Adjacent / Opposite"] },
        ];
        const d = randChoice(defs);
        return {
            subtopic: "SOH-CAH-TOA",
            question: `In a right triangle, ${d.ratio} is defined as:`,
            correctAnswer: d.answer,
            choices: mc(d.answer, d.wrongs),
            explanation: `${d.ratio} = ${d.answer}. Remember SOH-CAH-TOA.`,
            hints: ["SOH = Sin/Opp/Hyp, CAH = Cos/Adj/Hyp, TOA = Tan/Opp/Adj."],
        };
    },
    () => {
        const hyp = randInt(8, 20);
        const angData = [
            { angle: 30, sin: 0.5,   opp: parseFloat((hyp * 0.5).toFixed(1)) },
            { angle: 45, sin: 0.707, opp: parseFloat((hyp * 0.707).toFixed(1)) },
            { angle: 60, sin: 0.866, opp: parseFloat((hyp * 0.866).toFixed(1)) },
        ];
        const d = randChoice(angData);
        return {
            subtopic: "SOH-CAH-TOA",
            question: `Right triangle: hypotenuse = ${hyp} cm, angle = ${d.angle}°. Find the opposite side. (sin ${d.angle}° ≈ ${d.sin})`,
            correctAnswer: `${d.opp} cm`,
            choices: mc(`${d.opp} cm`, [`${d.opp + 2} cm`, `${d.opp - 2} cm`, `${parseFloat((hyp - d.opp).toFixed(1))} cm`]),
            explanation: `Opposite = hypotenuse × sin(${d.angle}°) = ${hyp} × ${d.sin} ≈ ${d.opp} cm.`,
            hints: ["SOH: sin = opp / hyp, so opp = hyp × sin(angle)."],
        };
    },
];

const Trigonometry_Medium = [
    () => {
        const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
        const [o, a, h] = randChoice(triples);
        return {
            subtopic: "Basic Trig Ratios",
            question: `Right triangle: opposite = ${o}, adjacent = ${a}, hypotenuse = ${h}. What is sin(θ)?`,
            correctAnswer: `${o}/${h}`,
            choices: mc(`${o}/${h}`, [`${a}/${h}`, `${o}/${a}`, `${h}/${o}`]),
            explanation: `sin(θ) = opposite / hypotenuse = ${o}/${h}.`,
            hints: ["SOH: sin = Opposite / Hypotenuse."],
        };
    },
    () => {
        const cliff = randInt(20, 60);
        const angData = [
            { angle: 30, tan: 0.577, dist: parseFloat((cliff / 0.577).toFixed(1)) },
            { angle: 45, tan: 1,     dist: cliff },
            { angle: 60, tan: 1.732, dist: parseFloat((cliff / 1.732).toFixed(1)) },
        ];
        const d = randChoice(angData);
        return {
            subtopic: "SOH-CAH-TOA",
            question: `From the top of a ${cliff} m cliff, the angle of depression to a boat is ${d.angle}°. How far is the boat from the base? (tan ${d.angle}° ≈ ${d.tan})`,
            correctAnswer: `${d.dist} m`,
            choices: mc(`${d.dist} m`, [`${d.dist + 10} m`, `${parseFloat((d.dist / 2).toFixed(1))} m`, `${cliff} m`]),
            explanation: `tan(${d.angle}°) = ${cliff}/distance → distance = ${cliff}/${d.tan} ≈ ${d.dist} m.`,
            hints: ["The cliff height is the opposite side; the horizontal distance is adjacent."],
        };
    },
    () => {
        const angle = randChoice([10, 20, 30, 40, 50, 60, 70, 80]);
        const comp = 90 - angle;
        return {
            subtopic: "Basic Trig Ratios",
            question: `What is the complement of ${angle}°?`,
            correctAnswer: `${comp}°`,
            choices: mc(`${comp}°`, [`${180 - angle}°`, `${comp + 10}°`, `${comp - 10}°`]),
            explanation: `Complementary angles sum to 90°. 90 − ${angle} = ${comp}°.`,
            hints: ["Complementary angles add up to 90°."],
        };
    },
];

const Trigonometry_Hard = [
    () => {
        const a = randInt(6, 12), b = randInt(8, 15);
        const angData = [
            { C: 60,  cosC: 0.5,  c: parseFloat(Math.sqrt(a*a + b*b - 2*a*b*0.5).toFixed(1)) },
            { C: 90,  cosC: 0,    c: parseFloat(Math.sqrt(a*a + b*b).toFixed(1)) },
            { C: 120, cosC: -0.5, c: parseFloat(Math.sqrt(a*a + b*b + a*b).toFixed(1)) },
        ];
        const d = randChoice(angData);
        return {
            subtopic: "Simple Applications",
            question: `Law of Cosines: a = ${a}, b = ${b}, C = ${d.C}°. Find side c.`,
            correctAnswer: `${d.c} cm`,
            choices: mc(`${d.c} cm`, [`${d.c + 2} cm`, `${d.c - 2} cm`, `${a + b} cm`]),
            explanation: `c² = ${a}² + ${b}² − 2(${a})(${b})cos(${d.C}°) → c ≈ ${d.c} cm.`,
            hints: ["Law of Cosines: c² = a² + b² − 2ab·cos(C)."],
        };
    },
    () => {
        const knownData = [
            { angle: 30, cos: "√3/2", wrongs: ["1/2", "√2/2", "1"] },
            { angle: 45, cos: "√2/2", wrongs: ["1/2", "√3/2", "0"] },
            { angle: 60, cos: "1/2",  wrongs: ["√3/2", "√2/2", "0"] },
        ];
        const d = randChoice(knownData);
        return {
            subtopic: "Basic Trig Ratios",
            question: `What is the exact value of cos(${d.angle}°)?`,
            correctAnswer: d.cos,
            choices: mc(d.cos, d.wrongs),
            explanation: `cos(${d.angle}°) = ${d.cos}. Standard unit circle exact value.`,
            hints: ["Exact values: cos(30°)=√3/2, cos(45°)=√2/2, cos(60°)=1/2."],
        };
    },
    () => {
        const angle = randChoice([15, 30, 45, 60, 75]);
        const suppAngle = 180 - angle;
        return {
            subtopic: "Simple Applications",
            question: `An angle in standard position is ${suppAngle}°. What is its reference angle?`,
            correctAnswer: `${angle}°`,
            choices: mc(`${angle}°`, [`${suppAngle}°`, `${90 - angle}°`, `${angle + 10}°`]),
            explanation: `${suppAngle}° is in Q2. Reference angle = 180° − ${suppAngle}° = ${angle}°.`,
            hints: ["In quadrant 2, reference angle = 180° − angle."],
        };
    },
];

// ─── Generator ────────────────────────────────────────────────────────────────

const BUCKETS = {
    Algebra_Easy,      Algebra_Medium,      Algebra_Hard,
    Geometry_Easy,     Geometry_Medium,     Geometry_Hard,
    Trigonometry_Easy, Trigonometry_Medium, Trigonometry_Hard,
};

/**
 * Returns 9 freshly generated questions — one per topic/difficulty bucket —
 * shuffled into a random order so topics don't appear in blocks.
 * Every number in every question is different each call.
 */
export const generateDiagnosticQuestions = () => {
    const questions = Object.entries(BUCKETS).map(([key, templates]) => {
        const [topic, difficulty] = key.split("_");
        const q = randChoice(templates)();
        return {
            _id: `diag-${key}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            topic,
            subtopic: q.subtopic,
            difficulty,
            questionType: "Multiple Choice",
            question: q.question,
            choices: q.choices,   // already shuffled inside mc()
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            hints: q.hints,
            isDiagnostic: true,
            source: "System",
        };
    });

    // Shuffle final order so Algebra/Geometry/Trig aren't all grouped together
    return shuffle(questions);
};
