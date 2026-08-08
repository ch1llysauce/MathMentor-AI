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
            choices: mc(`${n}/${d}`, [
                `${n + 1}/${d}`,
                `${n}/${d + 1}`,
                `${n * 2 - 1}/${d * 2}`
            ]),
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
            choices: mc(
                `x = ${p} or x = ${q}`,
                [
                    `x = ${-p} or x = ${-q}`,
                    `x = ${p}`,
                    `x = ${q}`
                ]
            ),
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
            choices: mc(
                `x = ${-p} or x = ${-q}`,
                [
                    `x = ${p} or x = ${q}`,
                    `x = ${-p}`,
                    `No real solutions`
                ]
            ),
            explanation: `(x + ${p})(x + ${q}) = 0 → x = ${-p} or x = ${-q}.`,
            hints: ["Numbers that multiply to the constant and add to the x coefficient."],
        };
    },
    () => {
        const base = randChoice([2, 3, 4]),
            exp = randInt(2, 5),
            result = Math.pow(base, exp);

        return {
            subtopic: "Factoring",
            question: `Solve for x:  ${base}^x = ${result}`,
            correctAnswer: `x = ${exp}`,
            choices: mc(
                `x = ${exp}`,
                [
                    `x = ${exp + 1}`,
                    `x = ${exp - 1}`,
                    `x = ${result}`
                ]
            ),
            explanation: `${result} = ${base}^${exp}, so x = ${exp}.`,
            hints: ["Express the right side as a power of the base on the left."],
        };
    },
    () => {
        const k = randInt(1, 4),
            X = randInt(2, 10),
            a = randInt(3, 7),
            b = randInt(1, 6);

        const rhs = b + k * X;
        const lhsCoef = a,
            rhsCoef = a - k;

        return {
            subtopic: "Linear Equations",
            question: `Solve:  ${lhsCoef}x + ${b} = ${rhsCoef}x + ${rhs}`,
            correctAnswer: `x = ${X}`,
            choices: mc(
                `x = ${X}`,
                [
                    `x = ${X + 2}`,
                    `x = ${X - 1}`,
                    `x = ${-X}`
                ]
            ),
            explanation: `Move x terms: ${k}x = ${k * X}. Divide: x = ${X}.`,
            hints: ["Collect all x terms on one side and constants on the other."],
        };
    },
];

// ─── Geometry Templates ───────────────────────────────────────────────────────

const Geometry_Easy = [
    () => {
        const a1 = randInt(20, 80),
            a2 = 180 - a1;

        return {
            subtopic: "Angles",
            question: `Two angles are supplementary. One measures ${a1}°. What is the other?`,
            correctAnswer: `${a2}°`,
            choices: mc(
                `${a2}°`,
                [
                    `${90 - a1}°`,
                    `${a2 + 5}°`,
                    `${a2 - 5}°`
                ]
            ),
            explanation: `Supplementary angles add to 180°. 180 − ${a1} = ${a2}°.`,
            hints: ["Supplementary angles sum to 180°."],
        };
    },
    () => {
        const a = randInt(30, 80),
            b = randInt(20, 60),
            c = 180 - a - b;

        return {
            subtopic: "Triangles",
            question: `A triangle has two angles of ${a}° and ${b}°. What is the third angle?`,
            correctAnswer: `${c}°`,
            choices: mc(
                `${c}°`,
                [
                    `${c + 5}°`,
                    `${c - 5}°`,
                    `${180 - a}°`
                ]
            ),
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
            choices: mc(
                `${v}°`,
                [
                    `${180 - v}°`,
                    `${90 - v}°`,
                    `${v + 10}°`
                ]
            ),
            explanation: `Vertical angles are equal, so the opposite angle is also ${v}°.`,
            hints: ["Vertical angles are always equal."],
        };
    },
];

const Geometry_Medium = [
    () => {
        const l = randInt(5, 20),
            w = randInt(3, 15);

        return {
            subtopic: "Area",
            question: `Find the area of a rectangle: length ${l} cm, width ${w} cm.`,
            correctAnswer: `${l * w} cm²`,
            choices: mc(
                `${l * w} cm²`,
                [
                    `${2 * (l + w)} cm²`,
                    `${l * w + 5} cm²`,
                    `${l * w - 3} cm²`
                ]
            ),
            explanation: `Area = l × w = ${l} × ${w} = ${l * w} cm².`,
            hints: ["Area of rectangle = length × width."],
        };
    },
    () => {
        const triples = [
            [3, 4, 5],
            [5, 12, 13],
            [8, 15, 17],
            [6, 8, 10]
        ];

        const [a, b, c] = randChoice(triples);

        return {
            subtopic: "Triangles",
            question: `A right triangle has legs ${a} cm and ${b} cm. Find the hypotenuse.`,
            correctAnswer: `${c} cm`,
            choices: mc(
                `${c} cm`,
                [
                    `${c + 2} cm`,
                    `${c - 1} cm`,
                    `${a + b} cm`
                ]
            ),
            explanation: `c² = ${a}² + ${b}² = ${a * a + b * b}, so c = ${c} cm.`,
            hints: ["Use the Pythagorean theorem: a² + b² = c²."],
        };
    },
    () => {
        const b = randInt(4, 20),
            h = randInt(3, 15),
            area = (b * h) / 2;

        return {
            subtopic: "Area",
            question: `Find the area of a triangle: base ${b} m, height ${h} m.`,
            correctAnswer: `${area} m²`,
            choices: mc(
                `${area} m²`,
                [
                    `${b * h} m²`,
                    `${area + 4} m²`,
                    `${area - 2} m²`
                ]
            ),
            explanation: `Area = ½ × ${b} × ${h} = ${area} m².`,
            hints: ["Area of triangle = ½ × base × height."],
        };
    },
];

const Geometry_Hard = [
    () => {
        const r = randInt(3, 12),
            area = parseFloat((3.14 * r * r).toFixed(1));

        return {
            subtopic: "Basic Circles",
            question: `Find the area of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${area} cm²`,
            choices: mc(
                `${area} cm²`,
                [
                    `${parseFloat((2 * 3.14 * r).toFixed(1))} cm²`,
                    `${area + 6} cm²`,
                    `${parseFloat((3.14 * (r + 1) * (r + 1)).toFixed(1))} cm²`
                ]
            ),
            explanation: `Area = πr² = 3.14 × ${r}² = ${area} cm².`,
            hints: ["Area of circle = π × r²."],
        };
    },
    () => {
        const b1 = randInt(4, 12),
            b2 = randInt(8, 18),
            h = randInt(3, 10),
            area = ((b1 + b2) * h) / 2;

        return {
            subtopic: "Area",
            question: `Trapezoid with parallel sides ${b1} m and ${b2} m, height ${h} m. Find the area.`,
            correctAnswer: `${area} m²`,
            choices: mc(
                `${area} m²`,
                [
                    `${(b1 + b2) * h} m²`,
                    `${area + 5} m²`,
                    `${area - 4} m²`
                ]
            ),
            explanation: `Area = ½(${b1} + ${b2}) × ${h} = ${area} m².`,
            hints: ["Trapezoid area = ½ × (sum of parallel sides) × height."],
        };
    },
    () => {
        const r = randInt(3, 10),
            circ = parseFloat((2 * 3.14 * r).toFixed(1));

        return {
            subtopic: "Basic Circles",
            question: `Find the circumference of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${circ} cm`,
            choices: mc(
                `${circ} cm`,
                [
                    `${parseFloat((3.14 * r * r).toFixed(1))} cm²`,
                    `${circ + 3} cm`,
                    `${circ - 2} cm`
                ]
            ),
            explanation: `Circumference = 2πr = 2 × 3.14 × ${r} = ${circ} cm.`,
            hints: ["Circumference = 2πr."],
        };
    },
];

// ─── Trigonometry Templates ───────────────────────────────────────────────────

const Trigonometry_Easy = [
    () => {
        const pairs = [
            {
                angle: 0,
                ratio: "sin",
                answer: "0",
                wrongs: ["1", "1/2", "√2/2"]
            },
            {
                angle: 90,
                ratio: "sin",
                answer: "1",
                wrongs: ["0", "1/2", "√3/2"]
            },
            {
                angle: 0,
                ratio: "cos",
                answer: "1",
                wrongs: ["0", "1/2", "√2/2"]
            },
            {
                angle: 90,
                ratio: "cos",
                answer: "0",
                wrongs: ["1", "1/2", "√3/2"]
            },
            {
                angle: 30,
                ratio: "sin",
                answer: "1/2",
                wrongs: ["√3/2", "√2/2", "1"]
            },
            {
                angle: 60,
                ratio: "cos",
                answer: "1/2",
                wrongs: ["√3/2", "√2/2", "0"]
            },
            {
                angle: 45,
                ratio: "sin",
                answer: "√2/2",
                wrongs: ["1/2", "√3/2", "1"]
            }
        ];

        const p = randChoice(pairs);

        return {
            subtopic: "Basic Trig Ratios",
            question: `What is ${p.ratio}(${p.angle}°)?`,
            correctAnswer: p.answer,
            choices: mc(p.answer, p.wrongs),
            explanation: `${p.ratio}(${p.angle}°) = ${p.answer}. Standard unit circle value.`,
            hints: [
                "Memorise: sin(0°)=0, sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1."
            ],
        };
    },

    () => {
        const defs = [
            {
                ratio: "sin(θ)",
                answer: "Opposite / Hypotenuse",
                wrongs: [
                    "Adjacent / Hypotenuse",
                    "Opposite / Adjacent",
                    "Hypotenuse / Opposite"
                ]
            },
            {
                ratio: "cos(θ)",
                answer: "Adjacent / Hypotenuse",
                wrongs: [
                    "Opposite / Hypotenuse",
                    "Opposite / Adjacent",
                    "Hypotenuse / Adjacent"
                ]
            },
            {
                ratio: "tan(θ)",
                answer: "Opposite / Adjacent",
                wrongs: [
                    "Adjacent / Hypotenuse",
                    "Opposite / Hypotenuse",
                    "Adjacent / Opposite"
                ]
            }
        ];

        const d = randChoice(defs);

        return {
            subtopic: "SOH-CAH-TOA",
            question: `In a right triangle, ${d.ratio} is defined as:`,
            correctAnswer: d.answer,
            choices: mc(d.answer, d.wrongs),
            explanation: `${d.ratio} = ${d.answer}. Remember SOH-CAH-TOA.`,
            hints: [
                "SOH = Sin/Opp/Hyp, CAH = Cos/Adj/Hyp, TOA = Tan/Opp/Adj."
            ],
        };
    },

    () => {
        const hyp = randInt(8, 20);

        const angData = [
            {
                angle: 30,
                sin: 0.5,
                opp: parseFloat((hyp * 0.5).toFixed(1))
            },
            {
                angle: 45,
                sin: 0.707,
                opp: parseFloat((hyp * 0.707).toFixed(1))
            },
            {
                angle: 60,
                sin: 0.866,
                opp: parseFloat((hyp * 0.866).toFixed(1))
            }
        ];

        const d = randChoice(angData);

        return {
            subtopic: "SOH-CAH-TOA",
            question:
                `Right triangle: hypotenuse = ${hyp} cm, angle = ${d.angle}°. ` +
                `Find the opposite side. (sin ${d.angle}° ≈ ${d.sin})`,
            correctAnswer: `${d.opp} cm`,
            choices: mc(
                `${d.opp} cm`,
                [
                    `${d.opp + 2} cm`,
                    `${d.opp - 2} cm`,
                    `${parseFloat((hyp - d.opp).toFixed(1))} cm`
                ]
            ),
            explanation:
                `Opposite = hypotenuse × sin(${d.angle}°) = ` +
                `${hyp} × ${d.sin} ≈ ${d.opp} cm.`,
            hints: [
                "SOH: sin = opp / hyp, so opp = hyp × sin(angle)."
            ],
        };
    },
];

const Trigonometry_Medium = [
    () => {
        const triples = [
            [3, 4, 5],
            [5, 12, 13],
            [8, 15, 17],
            [6, 8, 10]
        ];

        const [o, a, h] = randChoice(triples);

        return {
            subtopic: "Basic Trig Ratios",
            question:
                `Right triangle: opposite = ${o}, adjacent = ${a}, ` +
                `hypotenuse = ${h}. What is sin(θ)?`,
            correctAnswer: `${o}/${h}`,
            choices: mc(
                `${o}/${h}`,
                [
                    `${a}/${h}`,
                    `${o}/${a}`,
                    `${h}/${o}`
                ]
            ),
            explanation:
                `sin(θ) = opposite / hypotenuse = ${o}/${h}.`,
            hints: [
                "SOH: sin = Opposite / Hypotenuse."
            ],
        };
    },

    () => {
        const cliff = randInt(20, 60);

        const angData = [
            {
                angle: 30,
                tan: 0.577,
                dist: parseFloat((cliff / 0.577).toFixed(1))
            },
            {
                angle: 45,
                tan: 1,
                dist: cliff
            },
            {
                angle: 60,
                tan: 1.732,
                dist: parseFloat((cliff / 1.732).toFixed(1))
            }
        ];

        const d = randChoice(angData);

        return {
            subtopic: "SOH-CAH-TOA",
            question:
                `From the top of a ${cliff} m cliff, the angle of depression ` +
                `to a boat is ${d.angle}°. How far is the boat from the base? ` +
                `(tan ${d.angle}° ≈ ${d.tan})`,
            correctAnswer: `${d.dist} m`,
            choices: mc(
                `${d.dist} m`,
                [
                    `${d.dist + 10} m`,
                    `${parseFloat((d.dist / 2).toFixed(1))} m`,
                    `${cliff} m`
                ]
            ),
            explanation:
                `tan(${d.angle}°) = ${cliff}/distance → ` +
                `distance = ${cliff}/${d.tan} ≈ ${d.dist} m.`,
            hints: [
                "The cliff height is the opposite side; the horizontal distance is adjacent."
            ],
        };
    },

    () => {
        const angle = randChoice([
            10,
            20,
            30,
            40,
            50,
            60,
            70,
            80
        ]);

        const comp = 90 - angle;

        return {
            subtopic: "Basic Trig Ratios",
            question: `What is the complement of ${angle}°?`,
            correctAnswer: `${comp}°`,
            choices: mc(
                `${comp}°`,
                [
                    `${180 - angle}°`,
                    `${comp + 10}°`,
                    `${comp - 10}°`
                ]
            ),
            explanation:
                `Complementary angles sum to 90°. 90 − ${angle} = ${comp}°.`,
            hints: [
                "Complementary angles add up to 90°."
            ],
        };
    },
];

const Trigonometry_Hard = [
    () => {
        const a = randInt(6, 12);
        const b = randInt(8, 15);

        const angData = [
            {
                C: 60,
                cosC: 0.5,
                c: parseFloat(
                    Math.sqrt(
                        a * a +
                        b * b -
                        2 * a * b * 0.5
                    ).toFixed(1)
                )
            },
            {
                C: 90,
                cosC: 0,
                c: parseFloat(
                    Math.sqrt(
                        a * a +
                        b * b
                    ).toFixed(1)
                )
            },
            {
                C: 120,
                cosC: -0.5,
                c: parseFloat(
                    Math.sqrt(
                        a * a +
                        b * b +
                        a * b
                    ).toFixed(1)
                )
            }
        ];

        const d = randChoice(angData);

        return {
            subtopic: "Simple Applications",
            question:
                `Law of Cosines: a = ${a}, b = ${b}, C = ${d.C}°. ` +
                `Find side c.`,
            correctAnswer: `${d.c} cm`,
            choices: mc(
                `${d.c} cm`,
                [
                    `${d.c + 2} cm`,
                    `${d.c - 2} cm`,
                    `${a + b} cm`
                ]
            ),
            explanation:
                `c² = ${a}² + ${b}² − 2(${a})(${b})cos(${d.C}°) ` +
                `→ c ≈ ${d.c} cm.`,
            hints: [
                "Law of Cosines: c² = a² + b² − 2ab·cos(C)."
            ],
        };
    },

    () => {
        const knownData = [
            {
                angle: 30,
                cos: "√3/2",
                wrongs: ["1/2", "√2/2", "1"]
            },
            {
                angle: 45,
                cos: "√2/2",
                wrongs: ["1/2", "√3/2", "0"]
            },
            {
                angle: 60,
                cos: "1/2",
                wrongs: ["√3/2", "√2/2", "0"]
            }
        ];

        const d = randChoice(knownData);

        return {
            subtopic: "Basic Trig Ratios",
            question: `What is the exact value of cos(${d.angle}°)?`,
            correctAnswer: d.cos,
            choices: mc(d.cos, d.wrongs),
            explanation:
                `cos(${d.angle}°) = ${d.cos}. Standard unit circle exact value.`,
            hints: [
                "Exact values: cos(30°)=√3/2, cos(45°)=√2/2, cos(60°)=1/2."
            ],
        };
    },

    () => {
        const angle = randChoice([
            15,
            30,
            45,
            60,
            75
        ]);

        const suppAngle = 180 - angle;

        return {
            subtopic: "Simple Applications",
            question:
                `An angle in standard position is ${suppAngle}°. ` +
                `What is its reference angle?`,
            correctAnswer: `${angle}°`,
            choices: mc(
                `${angle}°`,
                [
                    `${suppAngle}°`,
                    `${90 - angle}°`,
                    `${angle + 10}°`
                ]
            ),
            explanation:
                `${suppAngle}° is in Q2. Reference angle = ` +
                `180° − ${suppAngle}° = ${angle}°.`,
            hints: [
                "In quadrant 2, reference angle = 180° − angle."
            ],
        };
    },
];


// ─── Expanded Curriculum Coverage ─────────────────────────────────────────────
//
// Additional diagnostic questions are organized by curriculum subtopic.
// These are appended to the existing difficulty pools without removing
// the original question templates.
//

const CURRICULUM_DIAGNOSTIC_ADDITIONS = {

    // ═══════════════════════════════════════════════════════════════════════════
    // ALGEBRA
    // ═══════════════════════════════════════════════════════════════════════════

    Algebra_Easy: [

        // Foundations
        () => {
            const values = [
                {
                    q: "Which number is irrational?",
                    a: "√2",
                    w: ["4", "0.5", "3/4"]
                },
                {
                    q: "Which number is rational?",
                    a: "3/4",
                    w: ["√2", "π", "√5"]
                },
                {
                    q: "Which number is a whole number?",
                    a: "7",
                    w: ["−3", "1/2", "√2"]
                }
            ];

            const d = randChoice(values);

            return {
                subtopic: "Real Numbers",
                question: d.q,
                correctAnswer: d.a,
                choices: mc(d.a, d.w),
                explanation: `${d.a} satisfies the requested number classification.`,
                hints: [
                    "Recall the classifications of real, rational, irrational, integer, and whole numbers."
                ],
            };
        },

        () => {
            const a = randInt(2, 8);
            const b = randInt(2, 6);
            const c = randInt(1, 5);
            const result = a + b * c;

            return {
                subtopic: "Order of Operations (PEMDAS)",
                question: `Evaluate: ${a} + ${b} × ${c}`,
                correctAnswer: `${result}`,
                choices: mc(
                    `${result}`,
                    [
                        `${(a + b) * c}`,
                        `${a * b + c}`,
                        `${a + b + c}`
                    ]
                ),
                explanation:
                    `Multiply first: ${b} × ${c} = ${b * c}. ` +
                    `Then add ${a}: ${result}.`,
                hints: [
                    "Multiplication is performed before addition."
                ],
            };
        },

        () => {
            const denominator = randChoice([2, 4, 5, 10]);
            const numerator = randInt(1, denominator - 1);

            const decimal = numerator / denominator;
            const percent = decimal * 100;

            return {
                subtopic: "Fractions, Decimals, and Percentages",
                question:
                    `What percentage is equivalent to ${numerator}/${denominator}?`,
                correctAnswer: `${percent}%`,
                choices: mc(
                    `${percent}%`,
                    [
                        `${percent + 10}%`,
                        `${percent - 10}%`,
                        `${percent * 2}%`
                    ]
                ),
                explanation:
                    `${numerator}/${denominator} = ${decimal} = ${percent}%.`,
                hints: [
                    "Convert the fraction to a decimal, then multiply by 100."
                ],
            };
        },

        () => {
            const base = randInt(2, 8);
            const exponent = randInt(2, 4);
            const result = Math.pow(base, exponent);

            return {
                subtopic: "Exponents and Radicals",
                question: `Evaluate: ${base}^${exponent}`,
                correctAnswer: `${result}`,
                choices: mc(
                    `${result}`,
                    [
                        `${base * exponent}`,
                        `${result + base}`,
                        `${result - base}`
                    ]
                ),
                explanation:
                    `${base}^${exponent} = ${Array(exponent).fill(base).join(" × ")} = ${result}.`,
                hints: [
                    "An exponent tells how many times the base is multiplied by itself."
                ],
            };
        },

        () => {
            const coefficient = randInt(1, 9);
            const exponent = randInt(2, 5);

            return {
                subtopic: "Scientific Notation",
                question:
                    `Which is the correct scientific notation for ${coefficient} × 10^${exponent}?`,
                correctAnswer: `${coefficient} × 10^${exponent}`,
                choices: mc(
                    `${coefficient} × 10^${exponent}`,
                    [
                        `${coefficient + 1} × 10^${exponent}`,
                        `${coefficient} × 10^${exponent + 1}`,
                        `${coefficient} × 10^${exponent - 1}`
                    ]
                ),
                explanation:
                    `Scientific notation has a coefficient between 1 and 10 multiplied by a power of 10.`,
                hints: [
                    "Look for the coefficient and the power of ten."
                ],
            };
        },

        // Algebraic Expressions
        () => {
            const coefficient = randInt(2, 9);
            const constant = randInt(1, 10);

            return {
                subtopic: "Variables and Constants",
                question:
                    `In the expression ${coefficient}x + ${constant}, what is the constant?`,
                correctAnswer: `${constant}`,
                choices: mc(
                    `${constant}`,
                    [
                        `${coefficient}`,
                        "x",
                        `${coefficient + constant}`
                    ]
                ),
                explanation:
                    `The constant is the number that does not contain a variable: ${constant}.`,
                hints: [
                    "A constant has no variable attached to it."
                ],
            };
        },

        () => {
            const n = randInt(2, 10);

            return {
                subtopic: "Algebraic Expressions",
                question:
                    `Which expression represents "a number x increased by ${n}"?`,
                correctAnswer: `x + ${n}`,
                choices: mc(
                    `x + ${n}`,
                    [
                        `${n}x`,
                        `x - ${n}`,
                        `x / ${n}`
                    ]
                ),
                explanation:
                    `"Increased by" indicates addition, so the expression is x + ${n}.`,
                hints: [
                    "Translate the words into an algebraic operation."
                ],
            };
        },

        () => {
            const a = randInt(2, 9);
            const b = randInt(2, 9);

            return {
                subtopic: "Combining Like Terms",
                question:
                    `Simplify: ${a}x + ${b}x`,
                correctAnswer: `${a + b}x`,
                choices: mc(
                    `${a + b}x`,
                    [
                        `${a * b}x`,
                        `${a + b}`,
                        `${a - b}x`
                    ]
                ),
                explanation:
                    `Combine the coefficients: ${a}x + ${b}x = ${a + b}x.`,
                hints: [
                    "Only coefficients of like terms are combined."
                ],
            };
        },

        () => {
            const a = randInt(2, 8);
            const b = randInt(1, 8);

            return {
                subtopic: "Distributive Property",
                question:
                    `Expand: ${a}(x + ${b})`,
                correctAnswer: `${a}x + ${a * b}`,
                choices: mc(
                    `${a}x + ${a * b}`,
                    [
                        `${a}x + ${b}`,
                        `${a + b}x`,
                        `${a}x - ${a * b}`
                    ]
                ),
                explanation:
                    `Multiply ${a} by both terms: ${a}x + ${a * b}.`,
                hints: [
                    "Distribute the outside factor to every term inside the parentheses."
                ],
            };
        },

        () => {
            const x = randInt(1, 10);
            const a = randInt(2, 6);
            const b = randInt(1, 8);
            const result = a * x + b;

            return {
                subtopic: "Evaluating Expressions",
                question:
                    `Evaluate ${a}x + ${b} when x = ${x}.`,
                correctAnswer: `${result}`,
                choices: mc(
                    `${result}`,
                    [
                        `${result + a}`,
                        `${result - b}`,
                        `${a * b + x}`
                    ]
                ),
                explanation:
                    `Substitute x = ${x}: ${a}(${x}) + ${b} = ${result}.`,
                hints: [
                    "Replace x with its given value before calculating."
                ],
            };
        },

        // Linear Equations
        () => {
            const x = randInt(2, 15);
            const a = randInt(1, 10);
            const b = x + a;

            return {
                subtopic: "One-Step Equations",
                question: `Solve: x + ${a} = ${b}`,
                correctAnswer: `${x}`,
                choices: mc(
                    `${x}`,
                    [
                        `${x + 1}`,
                        `${x - 1}`,
                        `${b}`
                    ]
                ),
                explanation:
                    `Subtract ${a} from both sides to obtain x = ${x}.`,
                hints: [
                    "Use the inverse operation to isolate x."
                ],
            };
        },

        () => {
            const a = randInt(2, 8);
            const x = randInt(2, 12);
            const b = randInt(1, 8);
            const c = a * x + b;

            return {
                subtopic: "Two-Step Equations",
                question:
                    `Solve: ${a}x + ${b} = ${c}`,
                correctAnswer: `${x}`,
                choices: mc(
                    `${x}`,
                    [
                        `${x + 1}`,
                        `${x - 1}`,
                        `${a + x}`
                    ]
                ),
                explanation:
                    `Subtract ${b}, then divide by ${a}: x = ${x}.`,
                hints: [
                    "Undo addition/subtraction first, then multiplication/division."
                ],
            };
        },

        () => {
            const x = randInt(2, 10);
            const a = randInt(2, 6);
            const b = randInt(1, 8);
            const c = randInt(1, 5);
            const d = a * x + b - c;

            return {
                subtopic: "Multi-Step Equations",
                question:
                    `Solve: ${a}x + ${b} − ${c} = ${d}`,
                correctAnswer: `${x}`,
                choices: mc(
                    `${x}`,
                    [
                        `${x + 1}`,
                        `${x - 2}`,
                        `${a + x}`
                    ]
                ),
                explanation:
                    `Combine constants: ${b} − ${c}. Then isolate x to obtain x = ${x}.`,
                hints: [
                    "Simplify the constants before isolating x."
                ],
            };
        },

        () => {
            const denominator = randChoice([2, 3, 4]);
            const x = randInt(2, 10);
            const b = randInt(1, 5);
            const rhs = x / denominator + b;

            return {
                subtopic: "Equations with Fractions",
                question:
                    `Solve: x/${denominator} + ${b} = ${rhs}`,
                correctAnswer: `${x}`,
                choices: mc(
                    `${x}`,
                    [
                        `${x + 1}`,
                        `${x - 1}`,
                        `${Math.round(rhs)}`
                    ]
                ),
                explanation:
                    `Subtract ${b}, then multiply by ${denominator} to get x = ${x}.`,
                hints: [
                    "Remove the constant first, then clear the denominator."
                ],
            };
        },

        () => {
            const a = randInt(2, 8);
            const b = randInt(2, 10);
            const c = randInt(2, 10);

            return {
                subtopic: "Literal Equations",
                question:
                    `Solve ${a}x = ${b}y for x.`,
                correctAnswer: `x = ${b}y/${a}`,
                choices: mc(
                    `x = ${b}y/${a}`,
                    [
                        `x = ${a}y/${b}`,
                        `x = ${a}b/y`,
                        `x = ${b}/${a} + y`
                    ]
                ),
                explanation:
                    `Divide both sides by ${a}: x = ${b}y/${a}.`,
                hints: [
                    "Treat y as a variable and divide both sides by the coefficient of x."
                ],
            };
        },
],


// ═══════════════════════════════════════════════════════════════════════════════
// ALGEBRA — CONTINUED
// ═══════════════════════════════════════════════════════════════════════════════

 Algebra_Medium_Expanded: [

    // ─── Linear Inequalities ───────────────────────────────────────────────────

    () => {
        const x = randInt(2, 12);
        const a = randInt(1, 8);
        const b = x + a;

        return {
            subtopic: "One-Variable Inequalities",
            question: `Solve: x + ${a} > ${b}`,
            correctAnswer: `x > ${x}`,
            choices: mc(
                `x > ${x}`,
                [
                    `x < ${x}`,
                    `x > ${b}`,
                    `x < ${b}`
                ]
            ),
            explanation:
                `Subtract ${a} from both sides: x > ${b} − ${a}, so x > ${x}.`,
            hints: [
                "Use the same inverse operation on both sides."
            ],
        };
    },

    () => {
        const a = randInt(2, 8);
        const x = randInt(2, 10);
        const b = a * x;

        return {
            subtopic: "Compound Inequalities",
            question: `${x - 2} < x < ${x + 2}. Which statement is true?`,
            correctAnswer: `${x - 1} is a solution`,
            choices: mc(
                `${x - 1} is a solution`,
                [
                    `${x - 3} is a solution`,
                    `${x + 3} is a solution`,
                    `${x + 3} is not greater than ${x}`
                ]
            ),
            explanation:
                `${x - 1} lies between ${x - 2} and ${x + 2}, so it satisfies the compound inequality.`,
            hints: [
                "A compound inequality requires the value to satisfy both bounds."
            ],
        };
    },

    () => {
        const a = randInt(2, 6);
        const x = randInt(2, 8);
        const b = a * x;

        return {
            subtopic: "Graphing Inequalities",
            question:
                `For x ≥ ${x}, which endpoint should be used on a number line?`,
            correctAnswer: "A closed circle at the endpoint",
            choices: mc(
                "A closed circle at the endpoint",
                [
                    "An open circle at the endpoint",
                    "No endpoint",
                    "A closed circle at zero"
                ]
            ),
            explanation:
                `The symbol ≥ includes the endpoint, so a closed circle is used.`,
            hints: [
                "Closed circles represent values included in the solution."
            ],
        };
    },

    // ─── Systems of Equations ─────────────────────────────────────────────────

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Systems of Equations",
            question:
                `If x = ${x} and y = ${y}, which ordered pair solves the system?`,
            correctAnswer: `(${x}, ${y})`,
            choices: mc(
                `(${x}, ${y})`,
                [
                    `(${y}, ${x})`,
                    `(${x + 1}, ${y})`,
                    `(${x}, ${y + 1})`
                ]
            ),
            explanation:
                `The ordered pair is written as (x, y), giving (${x}, ${y}).`,
            hints: [
                "Remember that the first coordinate is x and the second is y."
            ],
        };
    },

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Substitution Method",
            question:
                `If y = ${x} + ${y - x}, what is y when x = ${x}?`,
            correctAnswer: `${y}`,
            choices: mc(
                `${y}`,
                [
                    `${x}`,
                    `${y + 1}`,
                    `${y - 1}`
                ]
            ),
            explanation:
                `Substitute x = ${x}: y = ${x} + ${y - x} = ${y}.`,
            hints: [
                "Replace x with the given value."
            ],
        };
    },

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Elimination Method",
            question:
                `If adding two equations eliminates y and leaves ${x}x = ${x * x}, what is x?`,
            correctAnswer: `${x}`,
            choices: mc(
                `${x}`,
                [
                    `${x + 1}`,
                    `${x - 1}`,
                    `${x * x}`
                ]
            ),
            explanation:
                `Divide ${x * x} by ${x}: x = ${x}.`,
            hints: [
                "After elimination, solve the remaining one-variable equation."
            ],
        };
    },

    // ─── Functions ─────────────────────────────────────────────────────────────

    () => {
        const x = randInt(1, 8);
        const a = randInt(2, 5);
        const b = randInt(1, 8);
        const result = a * x + b;

        return {
            subtopic: "Introduction to Functions",
            question:
                `If f(x) = ${a}x + ${b}, find f(${x}).`,
            correctAnswer: `${result}`,
            choices: mc(
                `${result}`,
                [
                    `${result + a}`,
                    `${result - b}`,
                    `${a + b + x}`
                ]
            ),
            explanation:
                `f(${x}) = ${a}(${x}) + ${b} = ${result}.`,
            hints: [
                "Substitute the input value for x."
            ],
        };
    },

    () => {
        const m = randInt(1, 6);
        const b = randInt(1, 8);

        return {
            subtopic: "Function Notation",
            question:
                `For f(x) = ${m}x + ${b}, what is f(0)?`,
            correctAnswer: `${b}`,
            choices: mc(
                `${b}`,
                [
                    `${m}`,
                    "0",
                    `${m + b}`
                ]
            ),
            explanation:
                `f(0) = ${m}(0) + ${b} = ${b}.`,
            hints: [
                "Replace x with zero."
            ],
        };
    },

    () => {
        const m = randInt(1, 5);
        const b = randInt(1, 9);

        return {
            subtopic: "Domain and Range",
            question:
                `For f(x) = ${m}x + ${b}, which variable represents the input?`,
            correctAnswer: "x",
            choices: mc(
                "x",
                [
                    "f(x)",
                    `${m}`,
                    `${b}`
                ]
            ),
            explanation:
                `In function notation, x is normally the input variable.`,
            hints: [
                "The domain contains possible input values."
            ],
        };
    },

    // ─── Linear Functions ──────────────────────────────────────────────────────

    () => {
        const m = randInt(1, 8);
        const b = randInt(1, 10);

        return {
            subtopic: "Slope and Rate of Change",
            question:
                `In y = ${m}x + ${b}, what is the slope?`,
            correctAnswer: `${m}`,
            choices: mc(
                `${m}`,
                [
                    `${b}`,
                    `${m + b}`,
                    `${m - 1}`
                ]
            ),
            explanation:
                `In slope-intercept form y = mx + b, m is the slope.`,
            hints: [
                "The coefficient of x in y = mx + b is the slope."
            ],
        };
    },

    () => {
        const m = randInt(1, 6);
        const b = randInt(1, 8);

        return {
            subtopic: "Slope-Intercept Form",
            question:
                `Which is slope-intercept form?`,
            correctAnswer: "y = mx + b",
            choices: mc(
                "y = mx + b",
                [
                    "y = ax² + bx + c",
                    "Ax + By = C",
                    "x² + y² = r²"
                ]
            ),
            explanation:
                `Slope-intercept form is y = mx + b.`,
            hints: [
                "Look for the form containing slope m and y-intercept b."
            ],
        };
    },

    () => {
        const x1 = randInt(1, 5);
        const x2 = x1 + randInt(1, 5);
        const y1 = randInt(1, 5);
        const m = randInt(1, 5);
        const y2 = y1 + m * (x2 - x1);

        return {
            subtopic: "Point-Slope Form",
            question:
                `A line has slope ${m} and passes through (${x1}, ${y1}). ` +
                `Which equation represents the line?`,
            correctAnswer: `y − ${y1} = ${m}(x − ${x1})`,
            choices: mc(
                `y − ${y1} = ${m}(x − ${x1})`,
                [
                    `y + ${y1} = ${m}(x + ${x1})`,
                    `y − ${x1} = ${m}(x − ${y1})`,
                    `y = ${m}x + ${x1}`
                ]
            ),
            explanation:
                `Point-slope form is y − y₁ = m(x − x₁).`,
            hints: [
                "Use y − y₁ = m(x − x₁)."
            ],
        };
    },

    // ─── Polynomials ───────────────────────────────────────────────────────────

    () => {
        const a = randInt(1, 8);
        const b = randInt(1, 8);

        return {
            subtopic: "Polynomials",
            question:
                `What is the degree of ${a}x² + ${b}x + 1?`,
            correctAnswer: "2",
            choices: mc(
                "2",
                [
                    "1",
                    "3",
                    "0"
                ]
            ),
            explanation:
                `The highest exponent of x is 2, so the polynomial has degree 2.`,
            hints: [
                "The degree is the largest exponent."
            ],
        };
    },

    () => {
        const a = randInt(1, 8);
        const b = randInt(1, 8);

        return {
            subtopic: "Adding and Subtracting Polynomials",
            question:
                `Simplify: ${a}x + ${b}x.`,
            correctAnswer: `${a + b}x`,
            choices: mc(
                `${a + b}x`,
                [
                    `${a * b}x`,
                    `${a + b}`,
                    `${a - b}x`
                ]
            ),
            explanation:
                `Combine the like terms: ${a}x + ${b}x = ${a + b}x.`,
            hints: [
                "Combine terms with the same variable and exponent."
            ],
        };
    },

    () => {
        const a = randInt(2, 6);
        const b = randInt(2, 6);

        return {
            subtopic: "Multiplying Polynomials",
            question:
                `What is the coefficient of x in (${a}x + 1)(${b}x + 1)?`,
            correctAnswer: `${a + b}`,
            choices: mc(
                `${a + b}`,
                [
                    `${a * b}`,
                    `${a - b}`,
                    `${a + b + 1}`
                ]
            ),
            explanation:
                `The x terms are ${a}x and ${b}x, which combine to ${a + b}x.`,
            hints: [
                "Use distribution and collect the x terms."
            ],
        };
    },

    // ─── Quadratics ────────────────────────────────────────────────────────────

    () => {
        const r1 = randInt(1, 6);
        const r2 = randInt(1, 6);
        const sum = r1 + r2;
        const product = r1 * r2;

        return {
            subtopic: "Quadratic Equations",
            question:
                `Which are the solutions of (x − ${r1})(x − ${r2}) = 0?`,
            correctAnswer: `x = ${r1} or x = ${r2}`,
            choices: mc(
                `x = ${r1} or x = ${r2}`,
                [
                    `x = ${-r1} or x = ${-r2}`,
                    `x = ${sum}`,
                    `x = ${product}`
                ]
            ),
            explanation:
                `Set each factor equal to zero.`,
            hints: [
                "Use the zero-product property."
            ],
        };
    },

    () => {
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        const c = randInt(1, 5);

        return {
            subtopic: "Quadratic Formula",
            question:
                `Which formula can be used to solve ax² + bx + c = 0?`,
            correctAnswer:
                "x = (−b ± √(b² − 4ac)) / 2a",
            choices: mc(
                "x = (−b ± √(b² − 4ac)) / 2a",
                [
                    "x = −b / a",
                    "x = b² − 4ac",
                    "x = (b ± √(b² + 4ac)) / a"
                ]
            ),
            explanation:
                "The quadratic formula solves equations in standard quadratic form.",
            hints: [
                "Recall the standard quadratic formula."
            ],
        };
    },

    () => {
        const d = randChoice([
            {
                discriminant: 0,
                result: "one real solution"
            },
            {
                discriminant: 9,
                result: "two real solutions"
            },
            {
                discriminant: -4,
                result: "no real solutions"
            }
        ]);

        return {
            subtopic: "Discriminant",
            question:
                `If the discriminant is ${d.discriminant}, how many real solutions does the quadratic have?`,
            correctAnswer: d.result,
            choices: mc(
                d.result,
                [
                    "two complex solutions",
                    "three real solutions",
                    "infinitely many solutions"
                ]
            ),
            explanation:
                `The discriminant determines the number and type of roots.`,
            hints: [
                "Positive → two real roots, zero → one real root, negative → no real roots."
            ],
        };
    },

    // ─── Exponential and Logarithmic Functions ─────────────────────────────────

    () => {
        const base = randChoice([2, 3, 5]);
        const exponent = randInt(2, 5);
        const result = Math.pow(base, exponent);

        return {
            subtopic: "Exponential Functions",
            question:
                `Evaluate ${base}^${exponent}.`,
            correctAnswer: `${result}`,
            choices: mc(
                `${result}`,
                [
                    `${base * exponent}`,
                    `${result + base}`,
                    `${result - base}`
                ]
            ),
            explanation:
                `${base}^${exponent} = ${result}.`,
            hints: [
                "Multiply the base by itself the number of times given by the exponent."
            ],
        };
    },

    () => {
        const base = randChoice([2, 3, 5]);
        const exponent = randInt(2, 5);
        const result = Math.pow(base, exponent);

        return {
            subtopic: "Logarithms",
            question:
                `What is log_${base}(${result})?`,
            correctAnswer: `${exponent}`,
            choices: mc(
                `${exponent}`,
                [
                    `${base}`,
                    `${result}`,
                    `${exponent + 1}`
                ]
            ),
            explanation:
                `Because ${base}^${exponent} = ${result}, log_${base}(${result}) = ${exponent}.`,
            hints: [
                "A logarithm asks what exponent produces the given number."
            ],
        };
    },

    () => {
        const base = randChoice([2, 3, 5]);
        const exponent = randInt(2, 4);

        return {
            subtopic: "Properties of Exponents",
            question:
                `Simplify: x^${exponent} × x².`,
            correctAnswer: `x^${exponent + 2}`,
            choices: mc(
                `x^${exponent + 2}`,
                [
                    `x^${exponent}`,
                    `x^${exponent * 2}`,
                    `x²`
                ]
            ),
            explanation:
                `When multiplying powers with the same base, add the exponents.`,
            hints: [
                "xᵃ × xᵇ = xᵃ⁺ᵇ."
            ],
        };
    },

    // ─── Sequences ─────────────────────────────────────────────────────────────

    () => {
        const first = randInt(1, 10);
        const difference = randInt(2, 8);
        const second = first + difference;

        return {
            subtopic: "Arithmetic Sequences",
            question:
                `What is the common difference of ${first}, ${second}, ${second + difference}?`,
            correctAnswer: `${difference}`,
            choices: mc(
                `${difference}`,
                [
                    `${first}`,
                    `${second}`,
                    `${difference + 1}`
                ]
            ),
            explanation:
                `Subtract consecutive terms: ${second} − ${first} = ${difference}.`,
            hints: [
                "Find how much the sequence increases or decreases each time."
            ],
        };
    },

    () => {
        const first = randChoice([1, 2, 3]);
        const ratio = randChoice([2, 3, 4]);

        return {
            subtopic: "Geometric Sequences",
            question:
                `What is the common ratio of ${first}, ${first * ratio}, ${first * ratio * ratio}?`,
            correctAnswer: `${ratio}`,
            choices: mc(
                `${ratio}`,
                [
                    `${first}`,
                    `${ratio + 1}`,
                    `${first * ratio}`
                ]
            ),
            explanation:
                `Divide consecutive terms: ${first * ratio} ÷ ${first} = ${ratio}.`,
            hints: [
                "For geometric sequences, divide a term by the previous term."
            ],
        };
    },

    // ─── Variation ─────────────────────────────────────────────────────────────

    () => {
        const k = randInt(2, 8);
        const x = randInt(2, 8);
        const y = k * x;

        return {
            subtopic: "Direct Variation",
            question:
                `If y = ${k}x, what is y when x = ${x}?`,
            correctAnswer: `${y}`,
            choices: mc(
                `${y}`,
                [
                    `${x}`,
                    `${k}`,
                    `${y + k}`
                ]
            ),
            explanation:
                `Substitute x = ${x}: y = ${k}(${x}) = ${y}.`,
            hints: [
                "Direct variation has the form y = kx."
            ],
        };
    },

    () => {
        const k = randInt(2, 8);
        const x = randInt(2, 8);
        const y = k / x;

        return {
            subtopic: "Inverse Variation",
            question:
                `If xy = ${k * x}, what is y when x = ${x}?`,
            correctAnswer: `${k}`,
            choices: mc(
                `${k}`,
                [
                    `${x}`,
                    `${k * x}`,
                    `${x + k}`
                ]
            ),
            explanation:
                `Divide both sides by x: y = ${k}.`,
            hints: [
                "Inverse variation can be written xy = k."
            ],
        };
    },
],


// ═══════════════════════════════════════════════════════════════════════════════
// GEOMETRY — EXPANDED COVERAGE
// ═══════════════════════════════════════════════════════════════════════════════

 Geometry_Easy_Expanded: [

    // ─── Foundations ───────────────────────────────────────────────────────────

    () => {
        const angle = randInt(20, 80);

        return {
            subtopic: "Points, Lines, and Planes",
            question:
                `Which geometric object has no length, width, or thickness?`,
            correctAnswer: "Point",
            choices: mc(
                "Point",
                [
                    "Line",
                    "Plane",
                    "Ray"
                ]
            ),
            explanation:
                "A point represents an exact location and has no dimensions.",
            hints: [
                "Think of the smallest possible geometric location."
            ],
        };
    },

    () => {
        const angle = randInt(1, 89);

        return {
            subtopic: "Angles and Angle Relationships",
            question:
                `What type of angle measures ${angle}°?`,
            correctAnswer:
                angle < 90 ? "Acute angle" : "Right angle",
            choices: mc(
                angle < 90 ? "Acute angle" : "Right angle",
                [
                    "Obtuse angle",
                    "Straight angle",
                    "Reflex angle"
                ]
            ),
            explanation:
                `An angle less than 90° is acute.`,
            hints: [
                "Acute angles are less than 90°."
            ],
        };
    },

    () => {
        const a = randInt(30, 80);
        const b = 180 - a;

        return {
            subtopic: "Parallel and Perpendicular Lines",
            question:
                `Two angles form a linear pair. One is ${a}°. What is the other?`,
            correctAnswer: `${b}°`,
            choices: mc(
                `${b}°`,
                [
                    `${90 - a}°`,
                    `${a}°`,
                    `${180 + a}°`
                ]
            ),
            explanation:
                `A linear pair sums to 180°, so ${180} − ${a} = ${b}°.`,
            hints: [
                "Angles forming a straight line sum to 180°."
            ],
        };
    },

    // ─── Triangles ─────────────────────────────────────────────────────────────

    () => {
        const a = randInt(30, 70);
        const b = randInt(30, 70);

        return {
            subtopic: "Triangle Classification",
            question:
                `A triangle has three equal sides. What type of triangle is it?`,
            correctAnswer: "Equilateral",
            choices: mc(
                "Equilateral",
                [
                    "Scalene",
                    "Isosceles",
                    "Right"
                ]
            ),
            explanation:
                "An equilateral triangle has three congruent sides.",
            hints: [
                "Look at the number of equal sides."
            ],
        };
    },

    () => {
        const base = randInt(4, 12);
        const height = randInt(3, 10);
        const area = base * height / 2;

        return {
            subtopic: "Triangle Properties",
            question:
                `A triangle has base ${base} cm and height ${height} cm. ` +
                `What is its area?`,
            correctAnswer: `${area} cm²`,
            choices: mc(
                `${area} cm²`,
                [
                    `${base * height} cm²`,
                    `${area + 5} cm²`,
                    `${area - 3} cm²`
                ]
            ),
            explanation:
                `Area = ½bh = ½(${base})(${height}) = ${area} cm².`,
            hints: [
                "Use A = ½bh."
            ],
        };
    },

    // ─── Quadrilaterals ────────────────────────────────────────────────────────

    () => {
        const side = randInt(3, 12);

        return {
            subtopic: "Quadrilateral Properties",
            question:
                `What is the sum of the interior angles of a quadrilateral?`,
            correctAnswer: "360°",
            choices: mc(
                "360°",
                [
                    "180°",
                    "270°",
                    "540°"
                ]
            ),
            explanation:
                "Every quadrilateral has four interior angles totaling 360°.",
            hints: [
                "A quadrilateral can be divided into two triangles."
            ],
        };
    },

    () => {
        const l = randInt(4, 15);
        const w = randInt(3, 10);
        const area = l * w;

        return {
            subtopic: "Parallelograms",
            question:
                `Find the area of a parallelogram with base ${l} cm ` +
                `and height ${w} cm.`,
            correctAnswer: `${area} cm²`,
            choices: mc(
                `${area} cm²`,
                [
                    `${2 * (l + w)} cm²`,
                    `${area / 2} cm²`,
                    `${area + l} cm²`
                ]
            ),
            explanation:
                `Area = base × height = ${l} × ${w} = ${area} cm².`,
            hints: [
                "The area formula is A = bh."
            ],
        };
    },

    // ─── Coordinate Geometry ───────────────────────────────────────────────────

    () => {
        const x = randInt(-8, 8);
        const y = randInt(-8, 8);

        let quadrant;

        if (x > 0 && y > 0) quadrant = "I";
        else if (x < 0 && y > 0) quadrant = "II";
        else if (x < 0 && y < 0) quadrant = "III";
        else if (x > 0 && y < 0) quadrant = "IV";
        else quadrant = "an axis";

        return {
            subtopic: "Coordinate Plane",
            question:
                `In which quadrant is the point (${x}, ${y})?`,
            correctAnswer:
                `Quadrant ${quadrant}`,
            choices: mc(
                `Quadrant ${quadrant}`,
                [
                    "Quadrant I",
                    "Quadrant II",
                    "Quadrant III"
                ].filter(v => v !== `Quadrant ${quadrant}`)
            ),
            explanation:
                `The signs of x and y determine the quadrant.`,
            hints: [
                "Positive x/right, negative x/left, positive y/up, negative y/down."
            ],
        };
    },

    () => {
        const x1 = randInt(1, 5);
        const y1 = randInt(1, 5);
        const dx = randInt(2, 6);
        const dy = randInt(2, 6);

        const x2 = x1 + dx;
        const y2 = y1 + dy;

        const midpointX = (x1 + x2) / 2;
        const midpointY = (y1 + y2) / 2;

        return {
            subtopic: "Distance and Midpoint",
            question:
                `Find the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`,
            correctAnswer:
                `(${midpointX}, ${midpointY})`,
            choices: mc(
                `(${midpointX}, ${midpointY})`,
                [
                    `(${x2}, ${y2})`,
                    `(${x1}, ${y1})`,
                    `(${midpointX + 1}, ${midpointY + 1})`
                ]
            ),
            explanation:
                `Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2).`,
            hints: [
                "Average the two x-coordinates and the two y-coordinates."
            ],
        };
    },

    // ─── Transformations ───────────────────────────────────────────────────────

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Translations",
            question:
                `What happens to (${x}, ${y}) when translated 3 units right?`,
            correctAnswer: `(${x + 3}, ${y})`,
            choices: mc(
                `(${x + 3}, ${y})`,
                [
                    `(${x}, ${y + 3})`,
                    `(${x - 3}, ${y})`,
                    `(${x}, ${y - 3})`
                ]
            ),
            explanation:
                "Moving right increases the x-coordinate.",
            hints: [
                "Horizontal movement changes x."
            ],
        };
    },

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Reflections",
            question:
                `What is the reflection of (${x}, ${y}) across the x-axis?`,
            correctAnswer: `(${x}, ${-y})`,
            choices: mc(
                `(${x}, ${-y})`,
                [
                    `(${-x}, ${y})`,
                    `(${-x}, ${-y})`,
                    `(${y}, ${x})`
                ]
            ),
            explanation:
                "Reflection across the x-axis changes the sign of y.",
            hints: [
                "Across the x-axis: (x, y) → (x, −y)."
            ],
        };
    },

    () => {
        const x = randInt(1, 8);
        const y = randInt(1, 8);

        return {
            subtopic: "Rotations",
            question:
                `What is the image of (${x}, ${y}) after a 90° counterclockwise rotation about the origin?`,
            correctAnswer: `(${-y}, ${x})`,
            choices: mc(
                `(${-y}, ${x})`,
                [
                    `(${y}, ${-x})`,
                    `(${x}, ${-y})`,
                    `(${-x}, ${-y})`
                ]
            ),
            explanation:
                "A 90° counterclockwise rotation maps (x, y) to (−y, x).",
            hints: [
                "Use the coordinate rule (x, y) → (−y, x)."
            ],
        };
    },

    // ─── Similarity and Congruence ─────────────────────────────────────────────

    () => {
        const scale = randInt(2, 5);
        const side = randInt(2, 8);

        return {
            subtopic: "Similarity",
            question:
                `Two similar figures have a scale factor of ${scale}. ` +
                `If a side of the smaller figure is ${side}, what is the corresponding side?`,
            correctAnswer: `${side * scale}`,
            choices: mc(
                `${side * scale}`,
                [
                    `${side + scale}`,
                    `${side * scale + 1}`,
                    `${side}`
                ]
            ),
            explanation:
                `Multiply the smaller side by the scale factor.`,
            hints: [
                "Corresponding sides of similar figures are proportional."
            ],
        };
    },

    () => {
        const side = randInt(3, 10);

        return {
            subtopic: "Congruence",
            question:
                `If two triangles are congruent, what can be said about their corresponding sides?`,
            correctAnswer: "They have equal lengths",
            choices: mc(
                "They have equal lengths",
                [
                    "They are always parallel",
                    "They are always perpendicular",
                    "They have different lengths"
                ]
            ),
            explanation:
                "Congruent figures have the same size and shape.",
            hints: [
                "Congruent means identical in size and shape."
            ],
        };
    },

    // ─── Circles ───────────────────────────────────────────────────────────────

    () => {
        const r = randInt(2, 10);

        return {
            subtopic: "Circle Parts",
            question:
                `A circle has radius ${r} cm. What is its diameter?`,
            correctAnswer: `${2 * r} cm`,
            choices: mc(
                `${2 * r} cm`,
                [
                    `${r} cm`,
                    `${r + 1} cm`,
                    `${r * r} cm`
                ]
            ),
            explanation:
                `Diameter = 2r = ${2 * r} cm.`,
            hints: [
                "The diameter is twice the radius."
            ],
        };
    },

    () => {
        const r = randInt(3, 10);
        const circumference = parseFloat((2 * 3.14 * r).toFixed(1));

        return {
            subtopic: "Circle Measurements",
            question:
                `Find the circumference of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${circumference} cm`,
            choices: mc(
                `${circumference} cm`,
                [
                    `${parseFloat((3.14 * r * r).toFixed(1))} cm`,
                    `${circumference + 5} cm`,
                    `${circumference - 5} cm`
                ]
            ),
            explanation:
                `C = 2πr = 2(3.14)(${r}) = ${circumference} cm.`,
            hints: [
                "Use C = 2πr."
            ],
        };
    },

    // ─── Area and Volume ───────────────────────────────────────────────────────

    () => {
        const l = randInt(3, 10);
        const w = randInt(3, 10);
        const h = randInt(2, 8);
        const volume = l * w * h;

        return {
            subtopic: "Surface Area",
            question:
                `What is the volume of a rectangular prism with dimensions ` +
                `${l} × ${w} × ${h}?`,
            correctAnswer: `${volume} cubic units`,
            choices: mc(
                `${volume} cubic units`,
                [
                    `${l * w} cubic units`,
                    `${2 * (l + w + h)} cubic units`,
                    `${volume + 10} cubic units`
                ]
            ),
            explanation:
                `Volume = lwh = ${l} × ${w} × ${h} = ${volume}.`,
            hints: [
                "For a rectangular prism, V = lwh."
            ],
        };
    },

    () => {
        const side = randInt(2, 8);
        const volume = side * side * side;

        return {
            subtopic: "Volume",
            question:
                `Find the volume of a cube with side length ${side} cm.`,
            correctAnswer: `${volume} cm³`,
            choices: mc(
                `${volume} cm³`,
                [
                    `${side * side} cm³`,
                    `${6 * side * side} cm³`,
                    `${volume + side} cm³`
                ]
            ),
            explanation:
                `V = s³ = ${side}³ = ${volume} cm³.`,
            hints: [
                "Cube volume is side × side × side."
            ],
        };
    },

    // ─── Pythagorean Theorem ────────────────────────────────────────────────────

    () => {
        const triples = [
            [3, 4, 5],
            [5, 12, 13],
            [6, 8, 10],
            [8, 15, 17]
        ];

        const [a, b, c] = randChoice(triples);

        return {
            subtopic: "Pythagorean Theorem",
            question:
                `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
            correctAnswer: `${c}`,
            choices: mc(
                `${c}`,
                [
                    `${a + b}`,
                    `${c + 1}`,
                    `${c - 2}`
                ]
            ),
            explanation:
                `a² + b² = c², so the hypotenuse is ${c}.`,
            hints: [
                "Use a² + b² = c²."
            ],
        };
    },

    // ─── Proof and Reasoning ───────────────────────────────────────────────────

    () => {
        return {
            subtopic: "Geometric Proofs",
            question:
                `What is the main purpose of a geometric proof?`,
            correctAnswer: "To logically justify a geometric statement",
            choices: mc(
                "To logically justify a geometric statement",
                [
                    "To measure every angle",
                    "To draw a random figure",
                    "To calculate only area"
                ]
            ),
            explanation:
                "A proof uses definitions, properties, and logical reasoning to establish a conclusion.",
            hints: [
                "A proof explains why a statement must be true."
            ],
        };
    },

    () => {
        return {
            subtopic: "Postulates and Theorems",
            question:
                `What is a theorem?`,
            correctAnswer: "A statement proven to be true",
            choices: mc(
                "A statement proven to be true",
                [
                    "An untested guess",
                    "A measurement tool",
                    "A random diagram"
                ]
            ),
            explanation:
                "A theorem is a mathematical statement that has been proven.",
            hints: [
                "Theorems require logical proof."
            ],
        };
    },
],


// ═══════════════════════════════════════════════════════════════════════════════
// GEOMETRY — MEDIUM/HARD EXPANDED QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

Geometry_Medium_Expanded: [

    () => {
        const base = randInt(5, 15);
        const height = randInt(4, 12);
        const area = base * height / 2;

        return {
            subtopic: "Triangle Area",
            question:
                `A triangle has base ${base} cm and height ${height} cm. ` +
                `Find its area.`,
            correctAnswer: `${area} cm²`,
            choices: mc(
                `${area} cm²`,
                [
                    `${base * height} cm²`,
                    `${area + 10} cm²`,
                    `${area - 5} cm²`
                ]
            ),
            explanation:
                `A = ½bh = ½(${base})(${height}) = ${area} cm².`,
            hints: [
                "Multiply base and height, then divide by 2."
            ],
        };
    },

    () => {
        const l = randInt(5, 20);
        const w = randInt(3, 15);
        const perimeter = 2 * (l + w);

        return {
            subtopic: "Rectangle Properties",
            question:
                `Find the perimeter of a rectangle with length ${l} ` +
                `and width ${w}.`,
            correctAnswer: `${perimeter}`,
            choices: mc(
                `${perimeter}`,
                [
                    `${l * w}`,
                    `${perimeter + 5}`,
                    `${perimeter - 4}`
                ]
            ),
            explanation:
                `P = 2(l + w) = 2(${l} + ${w}) = ${perimeter}.`,
            hints: [
                "Perimeter is the total distance around the figure."
            ],
        };
    },

    () => {
        const r = randInt(3, 10);
        const area = parseFloat((3.14 * r * r).toFixed(1));

        return {
            subtopic: "Circle Area",
            question:
                `Find the area of a circle with radius ${r} cm. (π ≈ 3.14)`,
            correctAnswer: `${area} cm²`,
            choices: mc(
                `${area} cm²`,
                [
                    `${parseFloat((2 * 3.14 * r).toFixed(1))} cm²`,
                    `${area + 5} cm²`,
                    `${area - 5} cm²`
                ]
            ),
            explanation:
                `A = πr² = 3.14(${r})² = ${area} cm².`,
            hints: [
                "Use A = πr²."
            ],
        };
    },

    () => {
        const a = randInt(30, 70);
        const b = randInt(30, 70);
        const c = 180 - a - b;

        return {
            subtopic: "Triangle Angle Sum",
            question:
                `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`,
            correctAnswer: `${c}°`,
            choices: mc(
                `${c}°`,
                [
                    `${c + 10}°`,
                    `${c - 10}°`,
                    `${180 - a}°`
                ]
            ),
            explanation:
                `The angles of a triangle sum to 180°.`,
            hints: [
                "Subtract the two known angles from 180°."
            ],
        };
    },

    () => {
        const x1 = randInt(1, 5);
        const y1 = randInt(1, 5);
        const dx = randInt(2, 5);
        const dy = randInt(2, 5);

        const x2 = x1 + dx;
        const y2 = y1 + dy;

        const slope = dy / dx;

        return {
            subtopic: "Slope Between Two Points",
            question:
                `Find the slope between (${x1}, ${y1}) and (${x2}, ${y2}).`,
            correctAnswer: `${slope}`,
            choices: mc(
                `${slope}`,
                [
                    `${dx}/${dy}`,
                    `${x2}/${y2}`,
                    `${slope + 1}`
                ]
            ),
            explanation:
                `m = (y₂ − y₁)/(x₂ − x₁) = ${dy}/${dx} = ${slope}.`,
            hints: [
                "Use rise over run."
            ],
        };
    },
],


Geometry_Hard_Expanded: [

    () => {
        const a = randInt(3, 8);
        const b = randInt(4, 10);
        const c = Math.sqrt(a * a + b * b).toFixed(2);

        return {
            subtopic: "Pythagorean Applications",
            question:
                `A right triangle has legs ${a} and ${b}. ` +
                `Approximately what is its hypotenuse?`,
            correctAnswer: `${c}`,
            choices: mc(
                `${c}`,
                [
                    `${a + b}`,
                    `${Math.abs(a - b)}`,
                    `${(a * b).toFixed(2)}`
                ]
            ),
            explanation:
                `c = √(${a}² + ${b}²) ≈ ${c}.`,
            hints: [
                "Square both legs, add them, then take the square root."
            ],
        };
    },

    () => {
        const r = randInt(3, 8);
        const h = randInt(5, 12);
        const volume = parseFloat((3.14 * r * r * h).toFixed(1));

        return {
            subtopic: "Cylinder Volume",
            question:
                `Find the volume of a cylinder with radius ${r} cm ` +
                `and height ${h} cm. (π ≈ 3.14)`,
            correctAnswer: `${volume} cm³`,
            choices: mc(
                `${volume} cm³`,
                [
                    `${parseFloat((3.14 * r * r).toFixed(1))} cm³`,
                    `${parseFloat((2 * 3.14 * r * h).toFixed(1))} cm³`,
                    `${volume + 10} cm³`
                ]
            ),
            explanation:
                `V = πr²h = 3.14(${r})²(${h}) = ${volume} cm³.`,
            hints: [
                "Cylinder volume is πr²h."
            ],
        };
    },

    () => {
        const scale = randChoice([2, 3, 4]);
        const area = randInt(10, 30);
        const newArea = area * scale * scale;

        return {
            subtopic: "Scale Factor and Area",
            question:
                `A figure is enlarged by a scale factor of ${scale}. ` +
                `If its original area is ${area}, what is the new area?`,
            correctAnswer: `${newArea}`,
            choices: mc(
                `${newArea}`,
                [
                    `${area * scale}`,
                    `${area + scale}`,
                    `${area * scale + area}`
                ]
            ),
            explanation:
                `Area changes by the square of the scale factor: ` +
                `${area} × ${scale}² = ${newArea}.`,
            hints: [
                "Area scales by k², not just k."
            ],
        };
    },
], 
};