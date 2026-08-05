/**
 * Client-side Problem Generator
 * Produces multiple-choice, true/false, and free-response problems.
 */

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = <T,>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionType = 'multiple-choice' | 'true-false' | 'free-response';

export interface GeneratedProblem {
  _id: string;
  topic: string;
  subtopic: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: QuestionType;
  problem: { text: string; latex: null };
  options: { text: string; isCorrect: boolean }[];
  correctAnswer: string;
  explanation: string;
  solution: { steps: string[]; finalAnswer: string };
  hints: string[];
  points: number;
  previousAttempts: never[];
}

// ─── Helper: build MC options from correct + wrong answers ────────────────────

function mcOptions(correct: string, wrongs: string[]) {
  return shuffle([
    { text: correct, isCorrect: true },
    ...wrongs.slice(0, 3).map(w => ({ text: w, isCorrect: false })),
  ]);
}

function tfOptions(correct: boolean) {
  return [
    { text: 'True',  isCorrect:  correct },
    { text: 'False', isCorrect: !correct },
  ];
}

// ─── Raw template type ────────────────────────────────────────────────────────

interface RawProblem {
  question: string;
  answer: string;
  solution: string;
  type: QuestionType;
  options: { text: string; isCorrect: boolean }[];
}

type Template = { generate: () => RawProblem };

// ─── ALGEBRA ──────────────────────────────────────────────────────────────────

const algebraBasic: Template[] = [
  // free-response
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x+a; return { type:'free-response', question:`Solve for x:  x + ${a} = ${b}`, answer:`${x}`, solution:`Subtract ${a}: x = ${b} − ${a} = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),x=randInt(1,15),b=a*x; return { type:'free-response', question:`Solve for x:  ${a}x = ${b}`, answer:`${x}`, solution:`Divide both sides by ${a}: x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),b=randInt(1,15),x=a*b; return { type:'free-response', question:`Solve for x:  x / ${a} = ${b}`, answer:`${x}`, solution:`Multiply by ${a}: x = ${x}`, options:[] }; } },
  // multiple-choice
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,10),c=a*x+b; const s=b>=0?'+':''; return { type:'multiple-choice', question:`Solve for x:  ${a}x ${s}${b} = ${c}`, answer:`${x}`, solution:`Subtract ${b}, divide by ${a}: x = ${x}`, options: mcOptions(`${x}`, [`${x+1}`,`${x-1}`,`${x+2}`]) }; } },
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x-a; return { type:'multiple-choice', question:`Solve for x:  x − ${a} = ${b}`, answer:`${x}`, solution:`Add ${a} to both sides: x = ${x}`, options: mcOptions(`${x}`, [`${x+2}`,`${x-2}`,`${b}`]) }; } },
  // true/false
  { generate: () => { const a=randInt(2,9),x=randInt(1,12),b=a*x; const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`If ${a}x = ${b}, then x = ${shown}. True or False?`, answer:claim?'True':'False', solution:`${a}x = ${b} → x = ${b/a}. The statement is ${claim?'true':'false'}.`, options: tfOptions(claim) }; } },
];

const algebraIntermediate: Template[] = [
  // free-response
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,12),c=a*(x+b); return { type:'free-response', question:`Solve for x:  ${a}(x + ${b}) = ${c}`, answer:`${x}`, solution:`Distribute: ${a}x + ${a*b} = ${c}. x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),c=randInt(5,20),x=a*(c-b); return { type:'free-response', question:`Solve:  x / ${a} + ${b} = ${c}`, answer:`${x}`, solution:`x/${a} = ${c-b}, x = ${x}`, options:[] }; } },
  // multiple-choice
  { generate: () => { const p=randInt(-7,7),q=randInt(-7,7),B=p+q,C=p*q,s1=B>=0?'+':'',s2=C>=0?'+':''; return { type:'multiple-choice', question:`Solve:  x² ${s1}${B}x ${s2}${C} = 0`, answer:`x = ${-p} or x = ${-q}`, solution:`Factor: (x${p>=0?'-':'+'}${Math.abs(p)})(x${q>=0?'-':'+'}${Math.abs(q)}) = 0`, options: mcOptions(`x = ${-p} or x = ${-q}`, [`x = ${p} or x = ${q}`,`x = ${-p}`,`x = ${-q}`]) }; } },
  { generate: () => { const a=randInt(2,5),b=randInt(1,5),c=randInt(1,5),x=randInt(1,8),y=a*x,d=b*x+c*y; return { type:'multiple-choice', question:`Solve the system:  y = ${a}x,  ${b}x + ${c}y = ${d}`, answer:`x = ${x}, y = ${y}`, solution:`Sub y = ${a}x: ${b+c*a}x = ${d}, x = ${x}, y = ${y}`, options: mcOptions(`x = ${x}, y = ${y}`, [`x = ${x+1}, y = ${y}`,`x = ${x}, y = ${y+1}`,`x = ${x-1}, y = ${y-1}`]) }; } },
  // true/false
  { generate: () => { const a=randInt(2,6),b=randInt(1,8),x=randInt(1,8),c=a*(x+b); const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`${a}(x + ${b}) = ${c}. Is x = ${shown} the solution? True or False?`, answer:claim?'True':'False', solution:`Distribute: ${a}x + ${a*b} = ${c} → x = ${x}. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const algebraAdvanced: Template[] = [
  // free-response
  { generate: () => { const base=randChoice([2,3,4,5]),x=randInt(2,5),result=Math.pow(base,x); return { type:'free-response', question:`Solve for x:  ${base}^x = ${result}`, answer:`${x}`, solution:`${result} = ${base}^${x}, so x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,6),b=randInt(-10,10),c=randInt(5,20),x1=((c-b)/a).toFixed(2),x2=((-c-b)/a).toFixed(2),s=b>=0?'+':''; return { type:'free-response', question:`Solve:  |${a}x ${s}${b}| = ${c}`, answer:`x = ${x1} or x = ${x2}`, solution:`Case 1: x = ${x1}. Case 2: x = ${x2}`, options:[] }; } },
  // multiple-choice
  { generate: () => { const p=randInt(-8,8),q=randInt(-8,8),B=p+q,C=p*q,s1=B>=0?'+':'',s2=C>=0?'+':''; return { type:'multiple-choice', question:`Factor and solve:  x² ${s1}${B}x ${s2}${C} = 0`, answer:`x = ${-p} or x = ${-q}`, solution:`(x${p>=0?'−':'+'}${Math.abs(p)})(x${q>=0?'−':'+'}${Math.abs(q)}) = 0`, options: mcOptions(`x = ${-p} or x = ${-q}`, [`x = ${p} or x = ${q}`,`x = ${-p}`,`No real solutions`]) }; } },
  { generate: () => { const a=randInt(5,25),b=randInt(2,8),c=b+randInt(1,5); const x=Math.round(a/(c-b)); return { type:'multiple-choice', question:`Solve:  ${a}/x + ${b} = ${c}`, answer:`x = ${x}`, solution:`${a}/x = ${c-b}, x = ${a}/${c-b} = ${x}`, options: mcOptions(`x = ${x}`, [`x = ${x+1}`,`x = ${x-1}`,`x = ${-x}`]) }; } },
  // true/false
  { generate: () => { const b=randChoice([2,3]),x=randInt(2,4),result=Math.pow(b,x); const claim=randChoice([true,false]); const shown=claim?x:x+1; return { type:'true-false', question:`${b}^${shown} = ${result}. True or False?`, answer:claim?'True':'False', solution:`${b}^${x} = ${result}. The statement is ${claim?'true':'false'}.`, options: tfOptions(claim) }; } },
];

// ─── GEOMETRY ─────────────────────────────────────────────────────────────────

const geometryBasic: Template[] = [
  // free-response
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the area of a rectangle: length ${l} cm, width ${w} cm.`, answer:`${l*w}`, solution:`A = l × w = ${l} × ${w} = ${l*w} cm²`, options:[] }; } },
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the perimeter of a rectangle: length ${l} m, width ${w} m.`, answer:`${2*(l+w)}`, solution:`P = 2(l+w) = 2(${l}+${w}) = ${2*(l+w)} m`, options:[] }; } },
  // multiple-choice
  { generate: () => { const b=randInt(4,20),h=randInt(3,18),a=(b*h)/2; return { type:'multiple-choice', question:`Area of a triangle: base ${b} cm, height ${h} cm?`, answer:`${a} cm²`, solution:`A = ½bh = ½×${b}×${h} = ${a} cm²`, options: mcOptions(`${a} cm²`, [`${a+5} cm²`,`${b*h} cm²`,`${a-3} cm²`]) }; } },
  { generate: () => { const r=randInt(3,12),a=(Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Area of a circle with radius ${r} cm? (π ≈ 3.14)`, answer:`${a} cm²`, solution:`A = πr² = 3.14×${r}² ≈ ${a} cm²`, options: mcOptions(`${a} cm²`, [`${(Math.PI*r*r+5).toFixed(1)} cm²`,`${(2*Math.PI*r).toFixed(1)} cm²`,`${(Math.PI*(r+1)*(r+1)).toFixed(1)} cm²`]) }; } },
  // true/false
  { generate: () => { const l=randInt(4,15),w=randInt(3,12),claim=randChoice([true,false]); const shown=claim?2*(l+w):2*(l+w)+randInt(2,6); return { type:'true-false', question:`A rectangle ${l}m × ${w}m has perimeter ${shown} m. True or False?`, answer:claim?'True':'False', solution:`P = 2(${l}+${w}) = ${2*(l+w)} m. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const geometryIntermediate: Template[] = [
  // free-response
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=Math.sqrt(a*a+b*b).toFixed(2); return { type:'free-response', question:`Right triangle with legs ${a} cm and ${b} cm. Find the hypotenuse.`, answer:c, solution:`c = √(${a}²+${b}²) = √${a*a+b*b} ≈ ${c} cm`, options:[] }; } },
  { generate: () => { const l=randInt(4,12),w=randInt(3,10),h=randInt(5,15); return { type:'free-response', question:`Volume of a rectangular prism: ${l}×${w}×${h} cm.`, answer:`${l*w*h}`, solution:`V = l×w×h = ${l*w*h} cm³`, options:[] }; } },
  // multiple-choice
  { generate: () => { const b1=randInt(5,15),b2=randInt(8,20),h=randInt(4,12),a=(b1+b2)*h/2; return { type:'multiple-choice', question:`Area of trapezoid: bases ${b1} m and ${b2} m, height ${h} m?`, answer:`${a} m²`, solution:`A = ½(b₁+b₂)h = ${a} m²`, options: mcOptions(`${a} m²`, [`${a+8} m²`,`${(b1+b2)*h} m²`,`${a-5} m²`]) }; } },
  { generate: () => { const s=randInt(3,12),sa=6*s*s; return { type:'multiple-choice', question:`Surface area of a cube with side ${s} cm?`, answer:`${sa} cm²`, solution:`SA = 6s² = 6×${s}² = ${sa} cm²`, options: mcOptions(`${sa} cm²`, [`${sa+12} cm²`,`${s*s*s} cm³`,`${4*s*s} cm²`]) }; } },
  // true/false
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=parseFloat(Math.sqrt(a*a+b*b).toFixed(2)),claim=randChoice([true,false]); const shown=claim?c:parseFloat((c+randInt(1,3)).toFixed(2)); return { type:'true-false', question:`In a right triangle with legs ${a} and ${b}, the hypotenuse is ${shown} cm. True or False?`, answer:claim?'True':'False', solution:`c = √(${a*a}+${b*b}) = ${c} cm. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const geometryAdvanced: Template[] = [
  // free-response
  { generate: () => { const r=randInt(3,10),h=randInt(5,15),v=(Math.PI*r*r*h).toFixed(1); return { type:'free-response', question:`Volume of a cylinder: radius ${r} cm, height ${h} cm. (π≈3.14)`, answer:v, solution:`V = πr²h = 3.14×${r}²×${h} ≈ ${v} cm³`, options:[] }; } },
  // multiple-choice
  { generate: () => { const r=randInt(3,10),sa=(4*Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Surface area of a sphere: radius ${r} cm? (π≈3.14)`, answer:`${sa} cm²`, solution:`SA = 4πr² ≈ ${sa} cm²`, options: mcOptions(`${sa} cm²`, [`${(4*Math.PI*r*r+10).toFixed(1)} cm²`,`${(2*Math.PI*r*r).toFixed(1)} cm²`,`${(4*Math.PI*(r+1)*(r+1)).toFixed(1)} cm²`]) }; } },
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'multiple-choice', question:`Two supplementary angles. One is ${a1}°. Find the other.`, answer:`${a2}°`, solution:`180° − ${a1}° = ${a2}°`, options: mcOptions(`${a2}°`, [`${a2+5}°`,`${90-a1}°`,`${a2-5}°`]) }; } },
  { generate: () => { const a1=randInt(20,70),a2=90-a1; return { type:'multiple-choice', question:`Two complementary angles. One is ${a1}°. Find the other.`, answer:`${a2}°`, solution:`90° − ${a1}° = ${a2}°`, options: mcOptions(`${a2}°`, [`${a2+5}°`,`${180-a1}°`,`${a2-5}°`]) }; } },
  // true/false
  { generate: () => { const r=randInt(3,10),v=parseFloat(((Math.PI*r*r*r*4)/3).toFixed(1)),claim=randChoice([true,false]); const shown=claim?v:parseFloat((v+randInt(5,15)).toFixed(1)); return { type:'true-false', question:`Volume of a sphere with radius ${r} cm is ${shown} cm³. True or False?`, answer:claim?'True':'False', solution:`V = (4/3)πr³ ≈ ${v} cm³. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

// ─── TRIGONOMETRY ─────────────────────────────────────────────────────────────

const commonAngles = [
  { angle:0,  sin:0,     cos:1,     sinStr:'0',    cosStr:'1'   },
  { angle:30, sin:0.5,   cos:0.866, sinStr:'1/2',  cosStr:'√3/2'},
  { angle:45, sin:0.707, cos:0.707, sinStr:'√2/2', cosStr:'√2/2'},
  { angle:60, sin:0.866, cos:0.5,   sinStr:'√3/2', cosStr:'1/2' },
  { angle:90, sin:1,     cos:0,     sinStr:'1',    cosStr:'0'   },
];
const radMap: Record<number,string> = {30:'π/6',45:'π/4',60:'π/3',90:'π/2',120:'2π/3',135:'3π/4',150:'5π/6',180:'π'};

const trigBasic: Template[] = [
  // multiple-choice — sin values
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is sin(${a.angle}°)?`, answer:a.sinStr, solution:`sin(${a.angle}°) = ${a.sinStr}`, options: mcOptions(a.sinStr, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>x.sinStr)) }; } },
  // multiple-choice — cos values
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is cos(${a.angle}°)?`, answer:a.cosStr, solution:`cos(${a.angle}°) = ${a.cosStr}`, options: mcOptions(a.cosStr, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>x.cosStr)) }; } },
  // free-response — degrees to radians
  { generate: () => { const deg=randChoice([30,45,60,90,120,180]); return { type:'free-response', question:`Convert ${deg}° to radians.`, answer:radMap[deg], solution:`${deg}° × (π/180) = ${radMap[deg]}`, options:[] }; } },
  // multiple-choice — SOH-CAH-TOA
  { generate: () => { const hyp=randInt(10,30),angle=randChoice([30,45,60]); const sinV=angle===30?0.5:angle===45?0.707:0.866; const opp=(hyp*sinV).toFixed(1); return { type:'multiple-choice', question:`Right triangle: hypotenuse = ${hyp} cm, angle = ${angle}°. Find the opposite side.`, answer:`${opp} cm`, solution:`sin(${angle}°) × ${hyp} = ${opp} cm`, options: mcOptions(`${opp} cm`, [`${(hyp*sinV+2).toFixed(1)} cm`,`${(hyp*sinV-2).toFixed(1)} cm`,`${(hyp*(1-sinV)).toFixed(1)} cm`]) }; } },
  // true/false
  { generate: () => { const a=randChoice(commonAngles.slice(0,4)); const claim=randChoice([true,false]); const shownSin=claim?a.sinStr:commonAngles.find(x=>x.angle!==a.angle)!.sinStr; return { type:'true-false', question:`sin(${a.angle}°) = ${shownSin}. True or False?`, answer:claim?'True':'False', solution:`sin(${a.angle}°) = ${a.sinStr}. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const trigIntermediate: Template[] = [
  // multiple-choice — Pythagorean identity
  { generate: () => { const sv=(randInt(3,9)/10).toFixed(1); const cv=Math.sqrt(1-parseFloat(sv)**2).toFixed(3); return { type:'multiple-choice', question:`If sin(x) = ${sv}, find cos(x). (First quadrant)`, answer:cv, solution:`cos²x = 1 − ${sv}² = ${(1-parseFloat(sv)**2).toFixed(3)}, cos(x) ≈ ${cv}`, options: mcOptions(cv, [(parseFloat(cv)+0.1).toFixed(3),(parseFloat(cv)-0.1).toFixed(3),sv]) }; } },
  // free-response — find angle
  { generate: () => { const opp=randInt(3,10),adj=randInt(4,12),angle=(Math.atan(opp/adj)*180/Math.PI).toFixed(1); return { type:'free-response', question:`Right triangle: opposite = ${opp}, adjacent = ${adj}. Find angle θ (degrees).`, answer:angle, solution:`θ = arctan(${opp}/${adj}) ≈ ${angle}°`, options:[] }; } },
  // multiple-choice — amplitude/period
  { generate: () => { const A=randInt(2,8),period=randChoice([2,3,4,6]),B=(2*Math.PI/period).toFixed(3); return { type:'multiple-choice', question:`For f(x) = ${A}sin(${B}x), what is the amplitude?`, answer:`${A}`, solution:`Amplitude = |A| = ${A}`, options: mcOptions(`${A}`, [`${A+1}`,`${A-1}`,`${B}`]) }; } },
  // true/false — Law of Sines setup
  { generate: () => { const claim=randChoice([true,false]); return { type:'true-false', question:`In a triangle, the Law of Sines states that a/sin(A) = b/sin(B). True or False?`, answer:'True', solution:`This is always true — it's the definition of the Law of Sines.`, options: tfOptions(true) }; } },
  // free-response — solve trig equation
  { generate: () => { const k=randInt(2,4),angle=30*k; return { type:'free-response', question:`Solve for x in [0°, 180°]:  sin(x) = sin(${angle}°).\nGive all solutions.`, answer:`${angle}° and ${180-angle}°`, solution:`sin equals the same value at ${angle}° and ${180-angle}°`, options:[] }; } },
];

const trigAdvanced: Template[] = [
  // multiple-choice — Law of Cosines
  { generate: () => { const a=randInt(8,15),b=randInt(10,18),angC=randChoice([60,90,120]); const c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angC*Math.PI/180)).toFixed(1); return { type:'multiple-choice', question:`Law of Cosines: a=${a}, b=${b}, C=${angC}°. Find c.`, answer:`${c} cm`, solution:`c² = ${a}²+${b}²−2(${a})(${b})cos(${angC}°) → c ≈ ${c} cm`, options: mcOptions(`${c} cm`, [`${(parseFloat(c)+2).toFixed(1)} cm`,`${(parseFloat(c)-2).toFixed(1)} cm`,`${Math.abs(a-b)} cm`]) }; } },
  // free-response — double angle
  { generate: () => { const angle=randChoice([30,45,60]),double=angle*2,sinD=Math.sin(double*Math.PI/180).toFixed(3); return { type:'free-response', question:`Use sin(2x) = 2sin(x)cos(x) to find sin(${double}°).`, answer:sinD, solution:`sin(${double}°) = 2×sin(${angle}°)×cos(${angle}°) ≈ ${sinD}`, options:[] }; } },
  // true/false — reference angles
  { generate: () => { const angle=randChoice([120,135,150,210,225,240,300,315,330]); const ref=angle<=180?180-angle:angle<=270?angle-180:360-angle; const claim=randChoice([true,false]); const shown=claim?ref:ref+randInt(5,15); return { type:'true-false', question:`The reference angle for ${angle}° is ${shown}°. True or False?`, answer:claim?'True':'False', solution:`Reference angle for ${angle}° is ${ref}°. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
  // multiple-choice — unit circle
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`On the unit circle, what are the coordinates at ${a.angle}°?`, answer:`(${a.cosStr}, ${a.sinStr})`, solution:`x = cos(${a.angle}°) = ${a.cosStr},  y = sin(${a.angle}°) = ${a.sinStr}`, options: mcOptions(`(${a.cosStr}, ${a.sinStr})`, [`(${a.sinStr}, ${a.cosStr})`,`(${a.cosStr}, 0)`,`(0, ${a.sinStr})`]) }; } },
  // free-response
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'free-response', question:`Two supplementary angles. One is ${a1}°. Find the other in degrees.`, answer:`${a2}`, solution:`180° − ${a1}° = ${a2}°`, options:[] }; } },
];

// ─── Generator ────────────────────────────────────────────────────────────────

const templateMap: Record<string, Record<string, Template[]>> = {
  algebra:      { basic: algebraBasic,      intermediate: algebraIntermediate,      advanced: algebraAdvanced },
  geometry:     { basic: geometryBasic,     intermediate: geometryIntermediate,     advanced: geometryAdvanced },
  trigonometry: { basic: trigBasic,         intermediate: trigIntermediate,         advanced: trigAdvanced },
};

function pickDifficulty(category: string): 'Easy' | 'Medium' | 'Hard' {
  if (category === 'basic')        return 'Easy';
  if (category === 'intermediate') return 'Medium';
  if (category === 'advanced')     return 'Hard';
  return randChoice(['Easy', 'Medium', 'Hard']);
}

export function generateProblems(
  topic: string,
  category: string = 'mixed',
  count: number = 5,
): GeneratedProblem[] {
  const topicKey = topic.toLowerCase();
  const catKey   = category.toLowerCase();
  const topicTemplates = templateMap[topicKey] ?? templateMap['algebra'];

  let pool: Template[];
  if (catKey === 'mixed') {
    pool = [
      ...topicTemplates.basic,
      ...topicTemplates.intermediate,
      ...topicTemplates.advanced,
    ];
  } else {
    pool = topicTemplates[catKey] ?? topicTemplates.basic;
  }

  const problems: GeneratedProblem[] = [];
  for (let i = 0; i < count; i++) {
    const template = randChoice(pool);
    const raw      = template.generate();
    const difficulty = pickDifficulty(catKey);

    problems.push({
      _id:          `${topicKey}-${catKey}-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      topic:        topicKey,
      subtopic:     topicKey,
      category:     catKey,
      difficulty,
      type:         raw.type,
      problem:      { text: raw.question, latex: null },
      options:      raw.options,
      correctAnswer: raw.answer,
      explanation:  raw.solution,
      solution:     { steps: [raw.solution], finalAnswer: raw.answer },
      hints:        ['Read the question carefully', 'Write down what you know', 'Work step by step'],
      points:       difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 15 : 20,
      previousAttempts: [],
    });
  }
  return problems;
}
