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
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x+a; return { type:'free-response', question:`Solve for $x$:  $x + ${a} = ${b}$`, answer:`${x}`, solution:`Subtract ${a}: $x = ${b} - ${a} = ${x}$`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),x=randInt(1,15),b=a*x; return { type:'free-response', question:`Solve for $x$:  $${a}x = ${b}$`, answer:`${x}`, solution:`Divide both sides by ${a}: $x = ${x}$`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),b=randInt(1,15),x=a*b; return { type:'free-response', question:`Solve for $x$:  $\\frac{x}{${a}} = ${b}$`, answer:`${x}`, solution:`Multiply by ${a}: $x = ${x}$`, options:[] }; } },
  // multiple-choice
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,10),c=a*x+b; const s=b>=0?'+':'-'; const bAbs=Math.abs(b); return { type:'multiple-choice', question:`Solve for $x$:  $${a}x ${s} ${bAbs} = ${c}$`, answer:`${x}`, solution:`Subtract ${b}, divide by ${a}: $x = ${x}$`, options: mcOptions(`${x}`, [`${x+1}`,`${x-1}`,`${x+2}`]) }; } },
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x-a; return { type:'multiple-choice', question:`Solve for $x$:  $x - ${a} = ${b}$`, answer:`${x}`, solution:`Add ${a} to both sides: $x = ${x}$`, options: mcOptions(`${x}`, [`${x+2}`,`${x-2}`,`${b}`]) }; } },
  // true/false
  { generate: () => { const a=randInt(2,9),x=randInt(1,12),b=a*x; const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`If $${a}x = ${b}$, then $x = ${shown}$. True or False?`, answer:claim?'True':'False', solution:`$${a}x = ${b} \\Rightarrow x = ${b/a}$. The statement is ${claim?'true':'false'}.`, options: tfOptions(claim) }; } },
];

const algebraIntermediate: Template[] = [
  // free-response
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,12),c=a*(x+b); return { type:'free-response', question:`Solve for $x$:  $${a}(x + ${b}) = ${c}$`, answer:`${x}`, solution:`Distribute: $${a}x + ${a*b} = ${c}$, so $x = ${x}$`, options:[] }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),c=randInt(5,20),x=a*(c-b); return { type:'free-response', question:`Solve:  $\\frac{x}{${a}} + ${b} = ${c}$`, answer:`${x}`, solution:`$\\frac{x}{${a}} = ${c-b}$, so $x = ${x}$`, options:[] }; } },
  // multiple-choice
  { generate: () => { const p=randInt(-7,7),q=randInt(-7,7),B=p+q,C=p*q,s1=B>=0?'+':'-',s2=C>=0?'+':'-'; const Babs=Math.abs(B),Cabs=Math.abs(C); return { type:'multiple-choice', question:`Solve:  $x^2 ${s1} ${Babs}x ${s2} ${Cabs} = 0$`, answer:`$x = ${-p}$ or $x = ${-q}$`, solution:`Factor: $(x${p>=0?'-':'+'}${Math.abs(p)})(x${q>=0?'-':'+'}${Math.abs(q)}) = 0$`, options: mcOptions(`$x = ${-p}$ or $x = ${-q}$`, [`$x = ${p}$ or $x = ${q}$`,`$x = ${-p}$`,`$x = ${-q}$`]) }; } },
  { generate: () => { const a=randInt(2,5),b=randInt(1,5),c=randInt(1,5),x=randInt(1,8),y=a*x,d=b*x+c*y; return { type:'multiple-choice', question:`Solve the system: $y = ${a}x$,  $${b}x + ${c}y = ${d}$`, answer:`$x = ${x},\\ y = ${y}$`, solution:`Sub $y = ${a}x$: $${b+c*a}x = ${d}$, so $x = ${x},\\ y = ${y}$`, options: mcOptions(`$x = ${x},\\ y = ${y}$`, [`$x = ${x+1},\\ y = ${y}$`,`$x = ${x},\\ y = ${y+1}$`,`$x = ${x-1},\\ y = ${y-1}$`]) }; } },
  // true/false
  { generate: () => { const a=randInt(2,6),b=randInt(1,8),x=randInt(1,8),c=a*(x+b); const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`$${a}(x + ${b}) = ${c}$. Is $x = ${shown}$ the solution? True or False?`, answer:claim?'True':'False', solution:`Distribute: $${a}x + ${a*b} = ${c} \\Rightarrow x = ${x}$. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const algebraAdvanced: Template[] = [
  // free-response
  { generate: () => { const base=randChoice([2,3,4,5]),x=randInt(2,5),result=Math.pow(base,x); return { type:'free-response', question:`Solve for $x$:  $${base}^x = ${result}$`, answer:`${x}`, solution:`$${result} = ${base}^{${x}}$, so $x = ${x}$`, options:[] }; } },
  { generate: () => { const a=randInt(2,6),b=randInt(-10,10),c=randInt(5,20),x1=((c-b)/a).toFixed(2),x2=((-c-b)/a).toFixed(2),s=b>=0?'+':'-',bAbs=Math.abs(b); return { type:'free-response', question:`Solve:  $|${a}x ${s} ${bAbs}| = ${c}$`, answer:`$x = ${x1}$ or $x = ${x2}$`, solution:`Case 1: $x = ${x1}$. Case 2: $x = ${x2}$`, options:[] }; } },
  // multiple-choice
  { generate: () => { const p=randInt(-8,8),q=randInt(-8,8),B=p+q,C=p*q,s1=B>=0?'+':'-',s2=C>=0?'+':'-',Babs=Math.abs(B),Cabs=Math.abs(C); return { type:'multiple-choice', question:`Factor and solve:  $x^2 ${s1} ${Babs}x ${s2} ${Cabs} = 0$`, answer:`$x = ${-p}$ or $x = ${-q}$`, solution:`$(x${p>=0?'-':'+'}${Math.abs(p)})(x${q>=0?'-':'+'}${Math.abs(q)}) = 0$`, options: mcOptions(`$x = ${-p}$ or $x = ${-q}$`, [`$x = ${p}$ or $x = ${q}$`,`$x = ${-p}$`,`No real solutions`]) }; } },
  { generate: () => { const a=randInt(5,25),b=randInt(2,8),c=b+randInt(1,5); const x=Math.round(a/(c-b)); return { type:'multiple-choice', question:`Solve:  $\\frac{${a}}{x} + ${b} = ${c}$`, answer:`$x = ${x}$`, solution:`$\\frac{${a}}{x} = ${c-b}$, so $x = ${x}$`, options: mcOptions(`$x = ${x}$`, [`$x = ${x+1}$`,`$x = ${x-1}$`,`$x = ${-x}$`]) }; } },
  // true/false
  { generate: () => { const b=randChoice([2,3]),x=randInt(2,4),result=Math.pow(b,x); const claim=randChoice([true,false]); const shown=claim?x:x+1; return { type:'true-false', question:`$${b}^{${shown}} = ${result}$. True or False?`, answer:claim?'True':'False', solution:`$${b}^{${x}} = ${result}$. The statement is ${claim?'true':'false'}.`, options: tfOptions(claim) }; } },
];

// ─── GEOMETRY ─────────────────────────────────────────────────────────────────

const geometryBasic: Template[] = [
  // free-response
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the area of a rectangle: length $${l}$ cm, width $${w}$ cm.`, answer:`${l*w}`, solution:`$A = l \\times w = ${l} \\times ${w} = ${l*w}$ cm²`, options:[] }; } },
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the perimeter of a rectangle: length $${l}$ m, width $${w}$ m.`, answer:`${2*(l+w)}`, solution:`$P = 2(l+w) = 2(${l}+${w}) = ${2*(l+w)}$ m`, options:[] }; } },
  // multiple-choice
  { generate: () => { const b=randInt(4,20),h=randInt(3,18),a=(b*h)/2; return { type:'multiple-choice', question:`Area of a triangle: base $${b}$ cm, height $${h}$ cm?`, answer:`$${a}$ cm²`, solution:`$A = \\frac{1}{2}bh = \\frac{1}{2} \\times ${b} \\times ${h} = ${a}$ cm²`, options: mcOptions(`$${a}$ cm²`, [`$${a+5}$ cm²`,`$${b*h}$ cm²`,`$${a-3}$ cm²`]) }; } },
  { generate: () => { const r=randInt(3,12),a=(Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Area of a circle with radius $${r}$ cm? ($\\pi \\approx 3.14$)`, answer:`$${a}$ cm²`, solution:`$A = \\pi r^2 = 3.14 \\times ${r}^2 \\approx ${a}$ cm²`, options: mcOptions(`$${a}$ cm²`, [`$${(Math.PI*r*r+5).toFixed(1)}$ cm²`,`$${(2*Math.PI*r).toFixed(1)}$ cm²`,`$${(Math.PI*(r+1)*(r+1)).toFixed(1)}$ cm²`]) }; } },
  // true/false
  { generate: () => { const l=randInt(4,15),w=randInt(3,12),claim=randChoice([true,false]); const shown=claim?2*(l+w):2*(l+w)+randInt(2,6); return { type:'true-false', question:`A rectangle $${l}$ m × $${w}$ m has perimeter $${shown}$ m. True or False?`, answer:claim?'True':'False', solution:`$P = 2(${l}+${w}) = ${2*(l+w)}$ m. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const geometryIntermediate: Template[] = [
  // free-response
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=Math.sqrt(a*a+b*b).toFixed(2); return { type:'free-response', question:`Right triangle with legs $${a}$ cm and $${b}$ cm. Find the hypotenuse.`, answer:c, solution:`$c = \\sqrt{${a}^2+${b}^2} = \\sqrt{${a*a+b*b}} \\approx ${c}$ cm`, options:[] }; } },
  { generate: () => { const l=randInt(4,12),w=randInt(3,10),h=randInt(5,15); return { type:'free-response', question:`Volume of a rectangular prism: $${l} \\times ${w} \\times ${h}$ cm.`, answer:`${l*w*h}`, solution:`$V = l \\times w \\times h = ${l*w*h}$ cm³`, options:[] }; } },
  // multiple-choice
  { generate: () => { const b1=randInt(5,15),b2=randInt(8,20),h=randInt(4,12),a=(b1+b2)*h/2; return { type:'multiple-choice', question:`Area of trapezoid: bases $${b1}$ m and $${b2}$ m, height $${h}$ m?`, answer:`$${a}$ m²`, solution:`$A = \\frac{1}{2}(b_1+b_2)h = ${a}$ m²`, options: mcOptions(`$${a}$ m²`, [`$${a+8}$ m²`,`$${(b1+b2)*h}$ m²`,`$${a-5}$ m²`]) }; } },
  { generate: () => { const s=randInt(3,12),sa=6*s*s; return { type:'multiple-choice', question:`Surface area of a cube with side $${s}$ cm?`, answer:`$${sa}$ cm²`, solution:`$SA = 6s^2 = 6 \\times ${s}^2 = ${sa}$ cm²`, options: mcOptions(`$${sa}$ cm²`, [`$${sa+12}$ cm²`,`$${s*s*s}$ cm³`,`$${4*s*s}$ cm²`]) }; } },
  // true/false
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=parseFloat(Math.sqrt(a*a+b*b).toFixed(2)),claim=randChoice([true,false]); const shown=claim?c:parseFloat((c+randInt(1,3)).toFixed(2)); return { type:'true-false', question:`In a right triangle with legs $${a}$ and $${b}$, the hypotenuse is $${shown}$ cm. True or False?`, answer:claim?'True':'False', solution:`$c = \\sqrt{${a*a}+${b*b}} = ${c}$ cm. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const geometryAdvanced: Template[] = [
  // free-response
  { generate: () => { const r=randInt(3,10),h=randInt(5,15),v=(Math.PI*r*r*h).toFixed(1); return { type:'free-response', question:`Volume of a cylinder: radius $${r}$ cm, height $${h}$ cm. ($\\pi \\approx 3.14$)`, answer:v, solution:`$V = \\pi r^2 h = 3.14 \\times ${r}^2 \\times ${h} \\approx ${v}$ cm³`, options:[] }; } },
  // multiple-choice
  { generate: () => { const r=randInt(3,10),sa=(4*Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Surface area of a sphere: radius $${r}$ cm? ($\\pi \\approx 3.14$)`, answer:`$${sa}$ cm²`, solution:`$SA = 4\\pi r^2 \\approx ${sa}$ cm²`, options: mcOptions(`$${sa}$ cm²`, [`$${(4*Math.PI*r*r+10).toFixed(1)}$ cm²`,`$${(2*Math.PI*r*r).toFixed(1)}$ cm²`,`$${(4*Math.PI*(r+1)*(r+1)).toFixed(1)}$ cm²`]) }; } },
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'multiple-choice', question:`Two supplementary angles. One is $${a1}°$. Find the other.`, answer:`$${a2}°$`, solution:`$180° - ${a1}° = ${a2}°$`, options: mcOptions(`$${a2}°$`, [`$${a2+5}°$`,`$${90-a1}°$`,`$${a2-5}°$`]) }; } },
  { generate: () => { const a1=randInt(20,70),a2=90-a1; return { type:'multiple-choice', question:`Two complementary angles. One is $${a1}°$. Find the other.`, answer:`$${a2}°$`, solution:`$90° - ${a1}° = ${a2}°$`, options: mcOptions(`$${a2}°$`, [`$${a2+5}°$`,`$${180-a1}°$`,`$${a2-5}°$`]) }; } },
  // true/false
  { generate: () => { const r=randInt(3,10),v=parseFloat(((Math.PI*r*r*r*4)/3).toFixed(1)),claim=randChoice([true,false]); const shown=claim?v:parseFloat((v+randInt(5,15)).toFixed(1)); return { type:'true-false', question:`Volume of a sphere with radius $${r}$ cm is $${shown}$ cm³. True or False?`, answer:claim?'True':'False', solution:`$V = \\frac{4}{3}\\pi r^3 \\approx ${v}$ cm³. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

// ─── TRIGONOMETRY ─────────────────────────────────────────────────────────────

const commonAngles = [
  { angle:0,  sin:0,     cos:1,     sinStr:'0',    cosStr:'1'   },
  { angle:30, sin:0.5,   cos:0.866, sinStr:'1/2',  cosStr:'√3/2'},
  { angle:45, sin:0.707, cos:0.707, sinStr:'√2/2', cosStr:'√2/2'},
  { angle:60, sin:0.866, cos:0.5,   sinStr:'√3/2', cosStr:'1/2' },
  { angle:90, sin:1,     cos:0,     sinStr:'1',    cosStr:'0'   },
];
const radMap: Record<number, string> = {30:'π/6',45:'π/4',60:'π/3',90:'π/2',120:'2π/3',135:'3π/4',150:'5π/6',180:'π'};

const trigBasic: Template[] = [
  // multiple-choice — sin values
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is $\\sin(${a.angle}°)$?`, answer:`$${a.sinStr}$`, solution:`$\\sin(${a.angle}°) = ${a.sinStr}$`, options: mcOptions(`$${a.sinStr}$`, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>`$${x.sinStr}$`)) }; } },
  // multiple-choice — cos values
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is $\\cos(${a.angle}°)$?`, answer:`$${a.cosStr}$`, solution:`$\\cos(${a.angle}°) = ${a.cosStr}$`, options: mcOptions(`$${a.cosStr}$`, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>`$${x.cosStr}$`)) }; } },
  // free-response — degrees to radians
  { generate: () => { const deg=randChoice([30,45,60,90,120,180]); return { type:'free-response', question:`Convert $${deg}°$ to radians.`, answer:radMap[deg], solution:`$${deg}° \\times \\frac{\\pi}{180} = ${radMap[deg]}$`, options:[] }; } },
  // multiple-choice — SOH-CAH-TOA
  { generate: () => { const hyp=randInt(10,30),angle=randChoice([30,45,60]); const sinV=angle===30?0.5:angle===45?0.707:0.866; const opp=(hyp*sinV).toFixed(1); return { type:'multiple-choice', question:`Right triangle: hypotenuse = $${hyp}$ cm, angle = $${angle}°$. Find the opposite side.`, answer:`$${opp}$ cm`, solution:`$\\text{opp} = ${hyp} \\times \\sin(${angle}°) = ${opp}$ cm`, options: mcOptions(`$${opp}$ cm`, [`$${(hyp*sinV+2).toFixed(1)}$ cm`,`$${(hyp*sinV-2).toFixed(1)}$ cm`,`$${(hyp*(1-sinV)).toFixed(1)}$ cm`]) }; } },
  // true/false
  { generate: () => { const a=randChoice(commonAngles.slice(0,4)); const claim=randChoice([true,false]); const shownSin=claim?a.sinStr:commonAngles.find(x=>x.angle!==a.angle)!.sinStr; return { type:'true-false', question:`$\\sin(${a.angle}°) = ${shownSin}$. True or False?`, answer:claim?'True':'False', solution:`$\\sin(${a.angle}°) = ${a.sinStr}$. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
];

const trigIntermediate: Template[] = [
  // multiple-choice — Pythagorean identity
  { generate: () => { const sv=(randInt(3,9)/10).toFixed(1); const cv=Math.sqrt(1-parseFloat(sv)**2).toFixed(3); return { type:'multiple-choice', question:`If $\\sin(x) = ${sv}$, find $\\cos(x)$ (first quadrant).`, answer:`$${cv}$`, solution:`$\\cos^2 x = 1 - ${sv}^2 = ${(1-parseFloat(sv)**2).toFixed(3)}$, so $\\cos(x) \\approx ${cv}$`, options: mcOptions(`$${cv}$`, [`$${(parseFloat(cv)+0.1).toFixed(3)}$`,`$${(parseFloat(cv)-0.1).toFixed(3)}$`,`$${sv}$`]) }; } },
  // free-response — find angle
  { generate: () => { const opp=randInt(3,10),adj=randInt(4,12),angle=(Math.atan(opp/adj)*180/Math.PI).toFixed(1); return { type:'free-response', question:`Right triangle: opposite = $${opp}$, adjacent = $${adj}$. Find angle $\\theta$ (degrees).`, answer:angle, solution:`$\\theta = \\arctan\\!\\left(\\frac{${opp}}{${adj}}\\right) \\approx ${angle}°$`, options:[] }; } },
  // multiple-choice — amplitude/period
  { generate: () => { const A=randInt(2,8),period=randChoice([2,3,4,6]),B=(2*Math.PI/period).toFixed(3); return { type:'multiple-choice', question:`For $f(x) = ${A}\\sin(${B}x)$, what is the amplitude?`, answer:`$${A}$`, solution:`Amplitude $= |A| = ${A}$`, options: mcOptions(`$${A}$`, [`$${A+1}$`,`$${A-1}$`,`$${B}$`]) }; } },
  // true/false — Law of Sines
  { generate: () => { return { type:'true-false', question:`In a triangle, the Law of Sines states that $\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$. True or False?`, answer:'True', solution:`This is the definition of the Law of Sines.`, options: tfOptions(true) }; } },
  // free-response
  { generate: () => { const k=randInt(2,4),angle=30*k; return { type:'free-response', question:`Solve for $x$ in $[0°, 180°]$: $\\sin(x) = \\sin(${angle}°)$. Give all solutions.`, answer:`${angle}° and ${180-angle}°`, solution:`$\\sin$ has the same value at $${angle}°$ and $${180-angle}°$`, options:[] }; } },
];

const trigAdvanced: Template[] = [
  // multiple-choice — Law of Cosines
  { generate: () => { const a=randInt(8,15),b=randInt(10,18),angC=randChoice([60,90,120]); const c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angC*Math.PI/180)).toFixed(1); return { type:'multiple-choice', question:`Law of Cosines: $a=${a}$, $b=${b}$, $C=${angC}°$. Find $c$.`, answer:`$${c}$ cm`, solution:`$c^2 = ${a}^2+${b}^2 - 2(${a})(${b})\\cos(${angC}°) \\Rightarrow c \\approx ${c}$ cm`, options: mcOptions(`$${c}$ cm`, [`$${(parseFloat(c)+2).toFixed(1)}$ cm`,`$${(parseFloat(c)-2).toFixed(1)}$ cm`,`$${Math.abs(a-b)}$ cm`]) }; } },
  // free-response — double angle
  { generate: () => { const angle=randChoice([30,45,60]),double=angle*2,sinD=Math.sin(double*Math.PI/180).toFixed(3); return { type:'free-response', question:`Use $\\sin(2x) = 2\\sin(x)\\cos(x)$ to find $\\sin(${double}°)$.`, answer:sinD, solution:`$\\sin(${double}°) = 2 \\cdot \\sin(${angle}°) \\cdot \\cos(${angle}°) \\approx ${sinD}$`, options:[] }; } },
  // true/false — reference angles
  { generate: () => { const angle=randChoice([120,135,150,210,225,240,300,315,330]); const ref=angle<=180?180-angle:angle<=270?angle-180:360-angle; const claim=randChoice([true,false]); const shown=claim?ref:ref+randInt(5,15); return { type:'true-false', question:`The reference angle for $${angle}°$ is $${shown}°$. True or False?`, answer:claim?'True':'False', solution:`Reference angle for $${angle}°$ is $${ref}°$. ${claim?'Correct.':'Incorrect.'}`, options: tfOptions(claim) }; } },
  // multiple-choice — unit circle
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`On the unit circle, what are the coordinates at $${a.angle}°$?`, answer:`$(${a.cosStr},\\ ${a.sinStr})$`, solution:`$x = \\cos(${a.angle}°) = ${a.cosStr}$,  $y = \\sin(${a.angle}°) = ${a.sinStr}$`, options: mcOptions(`$(${a.cosStr},\\ ${a.sinStr})$`, [`$(${a.sinStr},\\ ${a.cosStr})$`,`$(${a.cosStr},\\ 0)$`,`$(0,\\ ${a.sinStr})$`]) }; } },
  // free-response
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'free-response', question:`Two supplementary angles. One is $${a1}°$. Find the other in degrees.`, answer:`${a2}`, solution:`$180° - ${a1}° = ${a2}°$`, options:[] }; } },
];


// ─── Curriculum coverage additions (all 116 curriculum subtopics) ───────────────
// Added without removing or replacing the original problem templates.
const mc = (correct: string, wrongs: string[]): string[] => [correct, ...wrongs.slice(0, 3)];
const CURRICULUM_PROBLEM_ADDITIONS: Record<string, Record<string, Template[]>> = {
  Algebra:      { Easy: [], Medium: [], Hard: [] },
  Geometry:     { Easy: [], Medium: [], Hard: [] },
  Trigonometry: { Easy: [], Medium: [], Hard: [] },
};
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(2,20), b=randInt(2,20); const x=a/b; const answer=(a%b===0)?`${x}`:`${a}/${b}`; return {question:`Which classification best describes ${a}/${b}?`, correctAnswer:"Rational", choices:mc("Rational",["Irrational","Integer only","Natural only"]), explanation:`${a}/${b} can be written as a ratio of two integers, so it is rational.`, hints:["A rational number can be expressed as a ratio of integers."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,9), b=randInt(2,6), c=randInt(1,5); const ans=a+b*c; return {question:`Evaluate: ${a} + ${b} × ${c}`, correctAnswer:`${ans}`, choices:mc(`${ans}`,[`${(a+b)*c}`,`${a*b+c}`,`${a+b+c}`]), explanation:`Multiply first: ${b}×${c}=${b*c}, then add ${a} to get ${ans}.`, hints:["Do multiplication before addition."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const p=randInt(2,8)*10; return {question:`Convert ${p}% to a decimal.`, correctAnswer:`${(p/100).toFixed(2)}`, choices:mc(`${(p/100).toFixed(2)}`,[`${p/10}`,`${p/1000}`,`${(p/100+0.1).toFixed(2)}`]), explanation:`Divide the percentage by 100: ${p}% = ${(p/100).toFixed(2)}.`, hints:["Percent means per hundred."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const n=randInt(2,8); const ans=n*n; return {question:`Simplify: √${ans}`, correctAnswer:`${n}`, choices:mc(`${n}`,[`${n+1}`,`${n-1}`,`${ans}`]), explanation:`${n}×${n}=${ans}, so √${ans}=${n}.`, hints:["Find the positive number whose square is the radicand."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const n=randInt(2,9); const ans=`${n} × 10^3`; return {question:`Write ${n*1000} in scientific notation.`, correctAnswer:ans, choices:mc(ans,[`${n} × 10^2`,`${n} × 10^4`,`${n*10} × 10^3`]), explanation:`Move the decimal three places left: ${n*1000} = ${ans}.`, hints:["Scientific notation has one nonzero digit before the decimal."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,9), b=randInt(1,9); return {question:`In ${a}x + ${b}, what is the coefficient of x?`, correctAnswer:`${a}`, choices:mc(`${a}`,[`${b}`,"x",`${a+b}`]), explanation:`The coefficient is the number multiplying x, which is ${a}.`, hints:["Look at the number directly multiplying the variable."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const n=randInt(2,9); return {question:`Which expression represents “${n} more than x”?`, correctAnswer:`x + ${n}`, choices:mc(`x + ${n}`,[`${n}x`,`x - ${n}`,`${n} - x`]), explanation:`“More than” indicates addition, so the expression is x + ${n}.`, hints:["Translate “more than” as addition."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,8), b=randInt(2,8); const s=a+b; return {question:`Simplify: ${a}x + ${b}x`, correctAnswer:`${s}x`, choices:mc(`${s}x`,[`${a*b}x`,`${s}`,`${a-b}x`]), explanation:`Like terms combine by adding coefficients: ${a}+${b}=${s}.`, hints:["Add coefficients of like terms."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,8), b=randInt(1,9); return {question:`Expand: ${a}(x + ${b})`, correctAnswer:`${a}x + ${a*b}`, choices:mc(`${a}x + ${a*b}`,[`${a}x + ${b}`,`${a+b}x`,`${a}x + ${a+b}`]), explanation:`Multiply ${a} by both terms: ${a}x + ${a*b}.`, hints:["Distribute the outside factor to every term inside."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const x=randInt(2,8), a=randInt(2,5); const ans=a*x+3; return {question:`If x=${x}, evaluate ${a}x + 3.`, correctAnswer:`${ans}`, choices:mc(`${ans}`,[`${a+x+3}`,`${a*x}`,`${a*(x+3)}`]), explanation:`Substitute x=${x}: ${a}(${x})+3=${ans}.`, hints:["Replace x with its given value, then calculate."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,12), x=randInt(2,15), b=a*x; return {question:`Solve: x + ${a} = ${x+a}`, correctAnswer:`${x}`, choices:mc(`${x}`,[`${x+a}`,`${x-1}`,`${a}`]), explanation:`Subtract ${a} from both sides to get x=${x}.`, hints:["Use the inverse operation."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,7), x=randInt(2,10), b=randInt(1,8), c=a*x+b; return {question:`Solve: ${a}x + ${b} = ${c}`, correctAnswer:`${x}`, choices:mc(`${x}`,[`${x+1}`,`${x-1}`,`${c}`]), explanation:`Subtract ${b}, then divide by ${a}: x=${x}.`, hints:["Undo addition/subtraction before multiplication/division."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(2,5), x=randInt(2,8), b=randInt(1,5), c=randInt(1,5); const rhs=a*x+b+c; return {question:`Solve: ${a}x + ${b} + ${c} = ${rhs}`, correctAnswer:`${x}`, choices:mc(`${x}`,[`${x+2}`,`${x-2}`,`${rhs}`]), explanation:`Combine constants: ${b}+${c}=${b+c}; then solve ${a}x+${b+c}=${rhs}.`, hints:["Combine like terms first."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const d=randInt(2,8), x=randInt(2,10); const n=d*x; return {question:`Solve: x/${d} = ${x}`, correctAnswer:`${n}`, choices:mc(`${n}`,[`${x}`,`${d*x+d}`,`${d+x}`]), explanation:`Multiply both sides by ${d}: x=${n}.`, hints:["Multiply both sides by the denominator."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,9); return {question:`Solve ${a}x = y for x.`, correctAnswer:`x = y/${a}`, choices:mc(`x = y/${a}`,[`x = ${a}y`,`x = y + ${a}`,`x = ${a}/y`]), explanation:`Divide both sides by ${a}.`, hints:["Isolate x by dividing by its coefficient."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(2,8), x=randInt(2,10), b=x+a; return {question:`Solve: x + ${a} > ${b}`, correctAnswer:`x > ${x}`, choices:mc(`x > ${x}`,[`x < ${x}`,`x > ${b}`,`x < ${a}`]), explanation:`Subtract ${a}: x>${x}.`, hints:["Treat the inequality like an equation when adding/subtracting."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const x=randInt(2,8); return {question:`Which describes the solution to ${x-1} < x < ${x+1}?`, correctAnswer:`All values between ${x-1} and ${x+1}`, choices:mc(`All values between ${x-1} and ${x+1}`,[`Only x=${x}`,`Values below ${x-1}`,`Values above ${x+1}`]), explanation:`A compound AND inequality requires values satisfying both bounds.`, hints:["AND means both inequalities must be true."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const k=randInt(2,8); return {question:`Solve: |x| < ${k}`, correctAnswer:`-${k} < x < ${k}`, choices:mc(`-${k} < x < ${k}`,[`x > ${k}`,`x < -${k}`,`x > -${k}`]), explanation:`|x|<k means x is within k units of zero.`, hints:["Absolute value represents distance from zero."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const x=randInt(1,8), y=-randInt(1,8); return {question:`The point (${x}, ${y}) lies in which quadrant?`, correctAnswer:"Quadrant IV", choices:mc("Quadrant IV",["Quadrant I","Quadrant II","Quadrant III"]), explanation:`Positive x and negative y place the point in Quadrant IV.`, hints:["Check the signs of x and y."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const x1=randInt(1,5), x2=x1+randInt(1,5), y1=randInt(1,8), m=randInt(1,5), y2=y1+m*(x2-x1); return {question:`Find the slope through (${x1},${y1}) and (${x2},${y2}).`, correctAnswer:`${m}`, choices:mc(`${m}`,[`${m+1}`,`${m-1}`,`${x2-x1}`]), explanation:`m=(${y2}-${y1})/(${x2}-${x1})=${m}.`, hints:["Use m=(y₂-y₁)/(x₂-x₁)."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const m=randInt(2,6), b=randInt(1,8); return {question:`In y = ${m}x + ${b}, what is the y-intercept?`, correctAnswer:`${b}`, choices:mc(`${b}`,[`${m}`,`${m+b}`,`-${b}`]), explanation:`In y=mx+b, b is the y-intercept.`, hints:["The constant term is the y-intercept."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const m=randInt(2,6), x1=randInt(1,5), y1=randInt(1,8); return {question:`Which is point-slope form for slope ${m} through (${x1},${y1})?`, correctAnswer:`y - ${y1} = ${m}(x - ${x1})`, choices:mc(`y - ${y1} = ${m}(x - ${x1})`,[`y + ${y1} = ${m}(x + ${x1})`,`y = ${m}x + ${y1}`,`y - ${x1} = ${m}(x - ${y1})`]), explanation:`Point-slope form is y-y₁=m(x-x₁).`, hints:["Use y-y₁=m(x-x₁)."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const m=randInt(1,5), b=randInt(1,8); return {question:`For y=${m}x+${b}, where does the line cross the y-axis?`, correctAnswer:`(0, ${b})`, choices:mc(`(0, ${b})`,[`(${b}, 0)`,`(1, ${m+b})`,`(0, ${m})`]), explanation:`Set x=0 to get y=${b}.`, hints:["The y-axis has x=0."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const x=randInt(1,8), y=randInt(1,8); return {question:`Which point satisfies both x=${x} and y=${y}?`, correctAnswer:`(${x}, ${y})`, choices:mc(`(${x}, ${y})`,[`(${y}, ${x})`,`(${x+1}, ${y})`,`(${x}, ${y+1})`]), explanation:`The solution must satisfy both equations, so it is (${x},${y}).`, hints:["A system solution satisfies every equation."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(2,5), x=randInt(2,8), y=a*x; return {question:`If y=${a}x and x=${x}, what is y?`, correctAnswer:`${y}`, choices:mc(`${y}`,[`${x}`,`${a+x}`,`${a*x+1}`]), explanation:`Substitute x=${x}: y=${a}(${x})=${y}.`, hints:["Replace x with its known value."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const x=randInt(2,8); return {question:`In elimination, what is the goal when adding equations?`, correctAnswer:"Cancel one variable", choices:mc("Cancel one variable",["Make both variables larger","Change every coefficient to 1","Graph the equations"]), explanation:`Elimination combines equations so one variable's coefficient becomes zero.`, hints:["Think about eliminating a variable."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const x=randInt(1,8), y=randInt(1,8); return {question:`For two lines, the graphical solution is the point where they:`, correctAnswer:"Intersect", choices:mc("Intersect",["Are parallel","Cross the y-axis","Have the same slope only"]), explanation:`The intersection point satisfies both line equations.`, hints:["Look for the common point."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(2,8), b=randInt(1,8); return {question:`Add: (${a}x + ${b}) + (2x + 3)`, correctAnswer:`${a+2}x + ${b+3}`, choices:mc(`${a+2}x + ${b+3}`,[`${a+2}x + ${b}`,`${a}x + ${b+3}`,`${a*2}x + ${b*3}`]), explanation:`Combine x terms and constants separately.`, hints:["Combine like terms."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,6); return {question:`Expand: (x + ${a})²`, correctAnswer:`x² + ${2*a}x + ${a*a}`, choices:mc(`x² + ${2*a}x + ${a*a}`,[`x² + ${a*a}`,`x² + ${a}x + ${a*a}`,`x² + ${2*a}`]), explanation:`Use (x+a)²=x²+2ax+a².`, hints:["Use the square-of-a-binomial pattern."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,8), b=randInt(2,8); const g=Math.min(a,b); return {question:`What is the greatest common factor of ${a}x and ${b}x?`, correctAnswer:`${g}x`, choices:mc(`${g}x`,[`${a+b}x`,`${Math.max(a,b)}x`,`${g}`]), explanation:`The common factor includes x and the greatest common numeric factor.`, hints:["Find the largest factor shared by both terms."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const p=randInt(1,6), q=randInt(1,6); const B=p+q,C=p*q; return {question:`Factor: x² + ${B}x + ${C}`, correctAnswer:`(x + ${p})(x + ${q})`, choices:mc(`(x + ${p})(x + ${q})`,[`(x - ${p})(x - ${q})`,`(x + ${B})(x + ${C})`,`(x + ${p+q})(x + 1)`]), explanation:`${p} and ${q} multiply to ${C} and add to ${B}.`, hints:["Find two numbers whose product is the constant and sum is the middle coefficient."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,9); return {question:`Factor: x² - ${a*a}`, correctAnswer:`(x - ${a})(x + ${a})`, choices:mc(`(x - ${a})(x + ${a})`,[`(x - ${a})²`,`(x + ${a})²`,`(x - ${a*a})(x + 1)`]), explanation:`x²-a²=(x-a)(x+a).`, hints:["Recognize a²-b²=(a-b)(a+b)."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,7); return {question:`Factor: x² + ${2*a}x + ${a*a}`, correctAnswer:`(x + ${a})²`, choices:mc(`(x + ${a})²`,[`(x - ${a})²`,`(x + ${2*a})²`,`(x + ${a})(x - ${a})`]), explanation:`The trinomial matches x²+2ax+a².`, hints:["Check whether the first and last terms are perfect squares."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const p=randInt(1,6), q=randInt(1,6); return {question:`Solve: (x-${p})(x-${q})=0`, correctAnswer:`x=${p} or x=${q}`, choices:mc(`x=${p} or x=${q}`,[`x=-${p} or x=-${q}`,`x=${p+q}`,`x=${p*q}`]), explanation:`By the zero-product property, either factor equals zero.`, hints:["Set each factor equal to zero."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(2,7); return {question:`What number completes x² + ${2*a}x to a perfect square?`, correctAnswer:`${a*a}`, choices:mc(`${a*a}`,[`${2*a}`,`${a}`,`${a*a+a}`]), explanation:`Take half the x coefficient (${a}) and square it.`, hints:["Half the middle coefficient, then square it."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const b=randInt(2,8); return {question:`For ax²+bx+c=0, which formula solves for x?`, correctAnswer:`(-b ± √(b²-4ac))/(2a)`, choices:mc(`(-b ± √(b²-4ac))/(2a)`,[`(b ± √(b²+4ac))/(2a)`,`(-b ± √(b²+4ac))/a`,`b²-4ac`]), explanation:`This is the standard quadratic formula.`, hints:["Recall the formula involving -b, ±, the square root, and 2a."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const h=randInt(1,5), k=randInt(1,8); return {question:`For y=(x-${h})²+${k}, what is the vertex?`, correctAnswer:`(${h}, ${k})`, choices:mc(`(${h}, ${k})`,[`(-${h}, ${k})`,`(${h}, -${k})`,`(${k}, ${h})`]), explanation:`Vertex form y=(x-h)²+k has vertex (h,k).`, hints:["Read h and k from vertex form."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const h=randInt(1,5), k=randInt(1,8); return {question:`Which is vertex form of a parabola with vertex (${h},${k})?`, correctAnswer:`y=(x-${h})²+${k}`, choices:mc(`y=(x-${h})²+${k}`,[`y=(x+${h})²+${k}`,`y=x²+${h}+${k}`,`y=(x-${k})²+${h}`]), explanation:`Vertex form is y=a(x-h)²+k.`, hints:["Use y=a(x-h)²+k."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const x=randInt(2,8), a=randInt(2,5); const ans=a*x+1; return {question:`If f(x)=${a}x+1, find f(${x}).`, correctAnswer:`${ans}`, choices:mc(`${ans}`,[`${a+x+1}`,`${a*x}`,`${x+1}`]), explanation:`Substitute x=${x}: f(${x})=${a}(${x})+1=${ans}.`, hints:["Function notation means substitute the input for x."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const h=randInt(1,5); return {question:`What is the domain of y=x²?`, correctAnswer:"All real numbers", choices:mc("All real numbers",["x>0","x≥0","x≠0"]), explanation:`Every real x can be squared, so the domain is all real numbers.`, hints:["Ask which x-values are allowed."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(1,5), b=randInt(1,5), x=randInt(1,5); const f=a*x, g=b*x; return {question:`If f(x)=${a}x and g(x)=${b}x, find (f+g)(${x}).`, correctAnswer:`${(a+b)*x}`, choices:mc(`${(a+b)*x}`,[`${a*b*x}`,`${a*x}`,`${b*x}`]), explanation:`(f+g)(x)=(${a}+${b})x, then substitute ${x}.`, hints:["Add the function outputs."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,6), b=randInt(1,6); return {question:`What is the inverse of f(x)=${a}x+${b}?`, correctAnswer:`f⁻¹(x)=(x-${b})/${a}`, choices:mc(`f⁻¹(x)=(x-${b})/${a}`,[`f⁻¹(x)=${a}x+${b}`,`f⁻¹(x)=(x+${b})/${a}`,`f⁻¹(x)=${a}(x-${b})`]), explanation:`Swap x and y, then solve for y.`, hints:["Interchange x and y, then isolate y."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy.push({ generate: () => {
  const q = (() => { const b=randChoice([2,3,4]), x=randInt(1,4); return {question:`Does y=${b}^x represent growth or decay?`, correctAnswer:"Growth", choices:mc("Growth",["Decay","Linear","Constant"]), explanation:`An exponential base greater than 1 represents growth.`, hints:["Compare the base with 1."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium.push({ generate: () => {
  const q = (() => { const b=randChoice([2,3,5]), e=randInt(1,4), n=b**e; return {question:`Evaluate log_${b}(${n}).`, correctAnswer:`${e}`, choices:mc(`${e}`,[`${e+1}`,`${b}`,`${n}`]), explanation:`Because ${b}^${e}=${n}, log_${b}(${n})=${e}.`, hints:["Convert the logarithm to exponential form."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard.push({ generate: () => {
  const q = (() => { const b=randChoice([2,3,5]), x=randInt(1,4), n=b**x; return {question:`Solve: log_${b}(x) = ${x}`, correctAnswer:`x=${n}`, choices:mc(`x=${n}`,[`x=${x}`,`x=${b*x}`,`x=${b+x}`]), explanation:`Convert to exponential form: x=${b}^${x}=${n}.`, hints:["Use log_b(x)=c ⇔ x=b^c."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Which geometric figure extends infinitely in both directions?`,correctAnswer:"Line",choices:mc("Line",["Ray","Line segment","Point"]),explanation:"A line extends infinitely in both directions.",hints:["Compare how far each figure extends."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(3,10),b=randInt(3,10); return {question:`A segment is ${a} cm long. If another congruent segment is drawn, its length is:`,correctAnswer:`${a} cm`,choices:mc(`${a} cm`,[`${a+b} cm`,`${b} cm`,`${a*2} cm`]),explanation:"Congruent segments have equal lengths.",hints:["Congruent means same measure."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => ({question:`A ray has:`,correctAnswer:"One endpoint and extends infinitely in one direction",choices:mc("One endpoint and extends infinitely in one direction",["Two endpoints","No endpoints","Two directions with no endpoint"]),explanation:"A ray starts at one endpoint and continues forever in one direction.",hints:["Compare a ray with a line and segment."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const a=randChoice([45,90,120,180]); const type=a<90?"Acute":a===90?"Right":a<180?"Obtuse":"Straight"; return {question:`An angle measuring ${a}° is what type?`,correctAnswer:type,choices:mc(type,["Acute","Right","Obtuse","Straight"].filter(v=>v!==type)),explanation:`An angle of ${a}° is classified as ${type.toLowerCase()}.`,hints:["Acute <90°, right =90°, obtuse is between 90° and 180°, and straight =180°."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const a=randInt(20,70), b=180-a; return {question:`Two adjacent angles form a straight angle. If one is ${a}°, the other is:`,correctAnswer:`${b}°`,choices:mc(`${b}°`,[`${90-a}°`,`${a}°`,`${180+a}°`]),explanation:`Angles forming a straight angle sum to 180°.`,hints:["Use the angle addition relationship for a straight angle."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => ({question:`A triangle with three equal sides is:`,correctAnswer:"Equilateral",choices:mc("Equilateral",["Isosceles","Scalene","Right"]),explanation:"An equilateral triangle has three congruent sides.",hints:["Classify by side lengths."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(30,80),b=randInt(20,60),c=180-a-b; return {question:`A triangle has angles ${a}° and ${b}°. Find the third angle.`,correctAnswer:`${c}°`,choices:mc(`${c}°`,[`${c+5}°`,`${c-5}°`,`${180-a}°`]),explanation:`Triangle angles sum to 180°.`,hints:["Subtract the known angles from 180°."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`Which congruence criterion uses three pairs of equal corresponding sides?`,correctAnswer:"SSS",choices:mc("SSS",["SAS","ASA","AA"]),explanation:"SSS means Side-Side-Side.",hints:["Count the side pairs used."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(2,6), scale=randInt(2,4); return {question:`If similar triangles have corresponding sides ${a} and ${a*scale}, the scale factor from the smaller to larger is:`,correctAnswer:`${scale}`,choices:mc(`${scale}`,[`${a}`,`${a+scale}`,`${a*scale}`]),explanation:`Scale factor = larger/smaller = ${a*scale}/${a}=${scale}.`,hints:["Divide corresponding larger side by smaller side."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const triple=randChoice([[3,4,5],[5,12,13],[6,8,10]]); const [a,b,c]=triple; return {question:`A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,correctAnswer:`${c}`,choices:mc(`${c}`,[`${a+b}`,`${c+1}`,`${c-1}`]),explanation:`a²+b²=c², so c=${c}.`,hints:["Use a²+b²=c²."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`Which quadrilateral has four right angles and four equal sides?`,correctAnswer:"Square",choices:mc("Square",["Rectangle","Rhombus","Trapezoid"]),explanation:"A square has four equal sides and four right angles.",hints:["Look for both properties."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const n=randChoice([3,4,5,6,8]); return {question:`A regular polygon has:`,correctAnswer:"All sides and angles congruent",choices:mc("All sides and angles congruent",["Only equal sides","Only equal angles","No equal measures"]),explanation:"Regular polygons have congruent sides and congruent angles.",hints:["Regular means uniform in both side and angle measures."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const n=randChoice([5,6,7,8]); const sum=(n-2)*180; return {question:`What is the sum of the interior angles of a ${n}-gon?`,correctAnswer:`${sum}°`,choices:mc(`${sum}°`,[`${n*180}°`,`${(n-1)*180}°`,`${(n-2)*90}°`]),explanation:`Sum=(n-2)180=(${n}-2)180=${sum}°.`,hints:["Use (n-2)×180°."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`The sum of one exterior angle at each vertex of any convex polygon is:`,correctAnswer:"360°",choices:mc("360°",["180°","90°","540°"]),explanation:"Exterior angles make one full turn, totaling 360°.",hints:["Think of a complete rotation."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const r=randInt(3,10); return {question:`A circle has radius ${r} cm. What is its diameter?`,correctAnswer:`${2*r} cm`,choices:mc(`${2*r} cm`,[`${r} cm`,`${r+2} cm`,`${r*r} cm`]),explanation:`Diameter is twice the radius.`,hints:["d=2r."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const d=randInt(6,20); return {question:`A circle has diameter ${d} cm. What is its radius?`,correctAnswer:`${d/2} cm`,choices:mc(`${d/2} cm`,[`${d} cm`,`${d/4} cm`,`${d+2} cm`]),explanation:`Radius is half the diameter.`,hints:["r=d/2."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`A chord of a circle is a segment whose endpoints lie:`,correctAnswer:"On the circle",choices:mc("On the circle",["At the center","Outside the circle","On the radius only"]),explanation:"A chord connects two points on the circle.",hints:["Think about the endpoints of a chord."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => ({question:`An arc measuring less than 180° is called a:`,correctAnswer:"Minor arc",choices:mc("Minor arc",["Major arc","Semicircle","Diameter"]),explanation:"A minor arc has measure less than 180°.",hints:["Compare arc measures with 180°."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(30,150); return {question:`A central angle measures ${a}°. What is the measure of its intercepted minor arc?`,correctAnswer:`${a}°`,choices:mc(`${a}°`,[`${180-a}°`,`${2*a}°`,`${a/2}°`]),explanation:"A central angle and its intercepted arc have equal measures.",hints:["Central angle measure equals intercepted arc measure."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const arc=randChoice([60,80,100,120]); const ang=arc/2; return {question:`An inscribed angle intercepts an arc of ${arc}°. What is the angle measure?`,correctAnswer:`${ang}°`,choices:mc(`${ang}°`,[`${arc}°`,`${180-ang}°`,`${arc*2}°`]),explanation:"An inscribed angle is half its intercepted arc.",hints:["Divide the intercepted arc measure by 2."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const l=randInt(4,12),w=randInt(3,9); const p=2*(l+w); return {question:`Find the perimeter of a rectangle ${l} cm by ${w} cm.`,correctAnswer:`${p} cm`,choices:mc(`${p} cm`,[`${l*w} cm`,`${2*l+w} cm`,`${p+2} cm`]),explanation:`P=2(l+w)=${p} cm.`,hints:["Add all four sides."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const b=randInt(4,14),h=randInt(3,12),a=b*h/2; return {question:`Find the area of a triangle with base ${b} and height ${h}.`,correctAnswer:`${a}`,choices:mc(`${a}`,[`${b*h}`,`${a+5}`,`${a-2}`]),explanation:`A=1/2bh=${a}.`,hints:["Use A=1/2bh."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const l=randInt(4,12),w=randInt(3,10); const a=l*w; return {question:`Find the area of a rectangle ${l} by ${w}.`,correctAnswer:`${a}`,choices:mc(`${a}`,[`${2*(l+w)}`,`${a+5}`,`${a-5}`]),explanation:`A=lw=${a}.`,hints:["Rectangle area is length times width."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const r=randInt(2,8),a=(3.14*r*r).toFixed(2); return {question:`Find the area of a circle with radius ${r}. Use π≈3.14.`,correctAnswer:`${a}`,choices:mc(`${a}`,[`${(2*3.14*r).toFixed(2)}`,`${(3.14*r).toFixed(2)}`,`${(3.14*(r+1)*(r+1)).toFixed(2)}`]),explanation:`A=πr²≈3.14(${r})²=${a}.`,hints:["Use A=πr²."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(20,50), b=randInt(5,15); return {question:`A composite figure has two non-overlapping parts with areas ${a} and ${b}. What is the total area?`,correctAnswer:`${a+b}`,choices:mc(`${a+b}`,[`${a-b}`,`${a*b}`,`${a+b+5}`]),explanation:`Add the component areas: ${a}+${b}=${a+b}.`,hints:["Add the areas of the parts."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`A prism has two congruent, parallel bases. Which statement is true?`,correctAnswer:"Its bases are congruent and parallel",choices:mc("Its bases are congruent and parallel",["It has one vertex","Its base is always a circle","It has no faces"]),explanation:"That is the defining structure of a prism.",hints:["Think about the two bases of a prism."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => ({question:`A cylinder has how many circular bases?`,correctAnswer:"Two",choices:mc("Two",["One","Three","None"]),explanation:"A cylinder has two congruent parallel circular bases.",hints:["Count its parallel bases."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => ({question:`A cone has:`,correctAnswer:"One circular base and one vertex",choices:mc("One circular base and one vertex",["Two circular bases","No vertex","Four circular bases"]),explanation:"A cone has a circular base and tapers to one vertex.",hints:["Recall the basic parts of a cone."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => ({question:`A pyramid has triangular faces that meet at a:`,correctAnswer:"Vertex",choices:mc("Vertex",["Circle","Midpoint","Chord"]),explanation:"The lateral triangular faces meet at the apex/vertex.",hints:["Think about the top point of a pyramid."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => ({question:`A sphere has a surface on which every point is the same distance from its:`,correctAnswer:"Center",choices:mc("Center",["Diameter","Chord","Vertex"]),explanation:"That common distance is the radius.",hints:["The radius is measured from the center."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const s=randInt(3,8); const sa=6*s*s; return {question:`Find the surface area of a cube with side ${s}.`,correctAnswer:`${sa}`,choices:mc(`${sa}`,[`${s*s*s}`,`${4*s*s}`,`${6*s}`]),explanation:`A cube has six square faces: SA=6s²=${sa}.`,hints:["Count all six faces."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const l=randInt(3,8),w=randInt(2,7),h=randInt(2,6),v=l*w*h; return {question:`Find the volume of a rectangular prism ${l}×${w}×${h}.`,correctAnswer:`${v}`,choices:mc(`${v}`,[`${l+w+h}`,`${2*(l+w+h)}`,`${v+l}`]),explanation:`V=lwh=${v}.`,hints:["Multiply length, width, and height."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const a=randInt(10,30),b=randInt(5,15); return {question:`A composite solid consists of two non-overlapping solids with volumes ${a} cm³ and ${b} cm³. Total volume?`,correctAnswer:`${a+b} cm³`,choices:mc(`${a+b} cm³`,[`${a-b} cm³`,`${a*b} cm³`,`${a+b+5} cm³`]),explanation:"Add the component volumes.",hints:["For non-overlapping parts, add their volumes."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const a=randInt(1,6); return {question:`Find the distance between (0,0) and (${a},0).`,correctAnswer:`${a}`,choices:mc(`${a}`,[`${a*a}`,`${a/2}`,`${a+1}`]),explanation:"The horizontal distance is the absolute difference in x-coordinates.",hints:["Use the distance formula or count horizontal units."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const x1=randInt(0,5),x2=x1+randInt(2,8), y1=randInt(0,5),y2=y1+randInt(2,8); return {question:`Find the midpoint of (${x1},${y1}) and (${x2},${y2}).`,correctAnswer:`(${(x1+x2)/2}, ${(y1+y2)/2})`,choices:mc(`(${(x1+x2)/2}, ${(y1+y2)/2})`,[`(${x2-x1}, ${y2-y1})`,`(${x1+x2}, ${y1+y2})`,`(${(x1+x2)/2}, ${y2-y1})`]),explanation:"Average the x-coordinates and y-coordinates.",hints:["Midpoint = ((x₁+x₂)/2,(y₁+y₂)/2)."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const h=randInt(1,5),k=randInt(1,5),r=randInt(2,6); return {question:`Which is the standard equation of a circle centered at (${h},${k}) with radius ${r}?`,correctAnswer:`(x-${h})²+(y-${k})²=${r*r}`,choices:mc(`(x-${h})²+(y-${k})²=${r*r}`,[`(x+${h})²+(y+${k})²=${r}`,`x²+y²=${r}`,`(x-${h})²+(y-${k})²=${r}`]),explanation:"Use (x-h)²+(y-k)²=r².",hints:["Use the standard circle equation."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const dx=randInt(1,5),dy=randInt(-4,4),x=randInt(1,5),y=randInt(1,5); return {question:`Translate (${x},${y}) by (${dx},${dy}).`,correctAnswer:`(${x+dx}, ${y+dy})`,choices:mc(`(${x+dx}, ${y+dy})`,[`(${x-dx}, ${y-dy})`,`(${x+dy}, ${y+dx})`,`(${dx}, ${dy})`]),explanation:`Add the translation vector to each coordinate.`,hints:["Add dx to x and dy to y."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium.push({ generate: () => {
  const q = (() => { const x=randInt(1,5),y=randInt(1,5); return {question:`A 90° counterclockwise rotation about the origin maps (${x},${y}) to:`,correctAnswer:`(-${y}, ${x})`,choices:mc(`(-${y}, ${x})`,[`(${y}, -${x})`,`(${x}, -${y})`,`(-${x}, -${y})`]),explanation:"A 90° CCW rotation maps (x,y)→(-y,x).",hints:["Use the 90° CCW coordinate rule."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard.push({ generate: () => {
  const q = (() => { const x=randInt(1,7),y=randInt(1,7); return {question:`Reflect (${x},${y}) across the x-axis.`,correctAnswer:`(${x}, -${y})`,choices:mc(`(${x}, -${y})`,[`(-${x}, ${y})`,`(-${x}, -${y})`,`(${y}, ${x})`]),explanation:"Reflection across the x-axis changes the sign of y.",hints:["The x-coordinate stays the same."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy.push({ generate: () => {
  const q = (() => { const k=randInt(2,4),x=randInt(1,5),y=randInt(1,5); return {question:`Dilate (${x},${y}) about the origin by scale factor ${k}.`,correctAnswer:`(${k*x}, ${k*y})`,choices:mc(`(${k*x}, ${k*y})`,[`(${x+k}, ${y+k})`,`(${x/k}, ${y/k})`,`(${k+x}, ${k+y})`]),explanation:"Multiply both coordinates by the scale factor.",hints:["For origin-centered dilation, (x,y)→(kx,ky)."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`In standard position, the initial side of an angle lies along the:`,correctAnswer:"Positive x-axis",choices:mc("Positive x-axis",["Positive y-axis","Negative x-axis","Negative y-axis"]),explanation:"Standard-position angles start on the positive x-axis.",hints:["Recall the definition of standard position."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => { const deg=randChoice([30,45,60,90,180]); const map: Record<number,string>={30:"π/6",45:"π/4",60:"π/3",90:"π/2",180:"π"}; return {question:`Convert ${deg}° to radians.`,correctAnswer:map[deg],choices:mc(map[deg],["π/2","π/3","π/4"].filter(v=>v!==map[deg])),explanation:`Multiply ${deg} by π/180.`,hints:["Use radians = degrees×π/180."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => { const a=randChoice([30,45,60,120,210]); return {question:`Which angle is coterminal with ${a}°?`,correctAnswer:`${a+360}°`,choices:mc(`${a+360}°`,[`${a+180}°`,`${360-a}°`,`${a+90}°`]),explanation:"Coterminal angles differ by multiples of 360°.",hints:["Add or subtract 360°."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return {question:`In a right triangle with opposite=${o} and hypotenuse=${h}, find sin(θ).`,correctAnswer:`${o}/${h}`,choices:mc(`${o}/${h}`,[`${a}/${h}`,`${o}/${a}`,`${h}/${o}`]),explanation:"sin=opposite/hypotenuse.",hints:["Use SOH."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return {question:`In a right triangle with adjacent=${a} and hypotenuse=${h}, find cos(θ).`,correctAnswer:`${a}/${h}`,choices:mc(`${a}/${h}`,[`${o}/${h}`,`${o}/${a}`,`${h}/${a}`]),explanation:"cos=adjacent/hypotenuse.",hints:["Use CAH."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return {question:`In a right triangle with opposite=${o} and adjacent=${a}, find tan(θ).`,correctAnswer:`${o}/${a}`,choices:mc(`${o}/${a}`,[`${a}/${h}`,`${o}/${h}`,`${h}/${o}`]),explanation:"tan=opposite/adjacent.",hints:["Use TOA."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Which function is the reciprocal of sine?`,correctAnswer:"Cosecant",choices:mc("Cosecant",["Secant","Cotangent","Tangent"]),explanation:"csc(θ)=1/sin(θ).",hints:["Think of reciprocal pairs."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`Which ratio should you use when you know the opposite and adjacent sides?`,correctAnswer:"Tangent",choices:mc("Tangent",["Sine","Cosine","Cosecant"]),explanation:"Tangent relates opposite and adjacent sides.",hints:["TOA = tangent, opposite, adjacent."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => { const o=randInt(3,8),a=randInt(4,10); const h=Math.sqrt(o*o+a*a).toFixed(2); return {question:`A right triangle has legs ${o} and ${a}. Approximate the hypotenuse.`,correctAnswer:`${h}`,choices:mc(`${h}`,[`${o+a}`,`${Math.abs(a-o)}`,`${(o*a).toFixed(2)}`]),explanation:`Use c=√(a²+b²).`,hints:["Apply the Pythagorean theorem."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`The angle of elevation is measured from the horizontal line of sight:`,correctAnswer:"Upward to an object",choices:mc("Upward to an object",["Downward to an object","Along the vertical axis only","At the ground only"]),explanation:"It is the angle formed when looking upward from a horizontal line.",hints:["Elevation means looking upward."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`The angle of depression is measured from the horizontal line of sight:`,correctAnswer:"Downward to an object",choices:mc("Downward to an object",["Upward to an object","Along the vertical axis only","At the ground only"]),explanation:"It is the angle formed when looking downward from a horizontal line.",hints:["Depression means looking downward."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`On the unit circle, the x-coordinate of a point at angle θ is:`,correctAnswer:"cos(θ)",choices:mc("cos(θ)",["sin(θ)","tan(θ)","sec(θ)"]),explanation:"Unit-circle coordinates are (cosθ,sinθ).",hints:["Remember the coordinate pair (cosθ,sinθ)."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => { const a=randChoice([120,135,150]); return {question:`What is the reference angle for ${a}°?`,correctAnswer:`${180-a}°`,choices:mc(`${180-a}°`,[`${a}°`,`${90-(180-a)}°`,`${360-a}°`]),explanation:"For quadrant II, reference angle=180°−θ.",hints:["Subtract a QII angle from 180°."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => { const a=randChoice([{a:30,s:"1/2"},{a:45,s:"√2/2"},{a:60,s:"√3/2"}]); return {question:`What is sin(${a.a}°)?`,correctAnswer:a.s,choices:mc(a.s,["0","1/2","1"].filter(v=>v!==a.s)),explanation:`sin(${a.a}°)=${a.s}.`,hints:["Recall the special-angle values."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`What is the period of y=sin(x)?`,correctAnswer:"2π",choices:mc("2π",["π","π/2","4π"]),explanation:"The sine function repeats every 2π radians.",hints:["Recall the standard sine period."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`What is cos(0)?`,correctAnswer:"1",choices:mc("1",["0","-1","√2/2"]),explanation:"The cosine graph starts at y=1 when x=0.",hints:["Recall the point (0,1) on the cosine graph."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`What is the period of y=tan(x)?`,correctAnswer:"π",choices:mc("π",["2π","π/2","4π"]),explanation:"Tangent repeats every π radians.",hints:["Compare tangent's period with sine and cosine."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => { const A=randInt(2,7); return {question:`What is the amplitude of y=${A}sin(x)?`,correctAnswer:`${A}`,choices:mc(`${A}`,[`${A+1}`,`1`,`2π`]),explanation:"Amplitude is |A|.",hints:["The amplitude is the absolute value of the coefficient."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => { const B=randChoice([2,3,4]); const p=(2*Math.PI/B).toFixed(2); return {question:`What is the period of y=sin(${B}x)?`,correctAnswer:`${p}`,choices:mc(`${p}`,[`${(2*Math.PI*B).toFixed(2)}`,`${B}`,`${Math.PI.toFixed(2)}`]),explanation:"Period=2π/|B|.",hints:["Use 2π/|B|."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => { const h=randInt(1,5); return {question:`What is the phase shift of y=sin(x-${h})?`,correctAnswer:`${h} units right`,choices:mc(`${h} units right`,[`${h} units left`,`-${h} units right`,`No shift`]),explanation:"x-h shifts the graph h units right.",hints:["Inside subtraction moves right."]}; })();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`Which is a fundamental Pythagorean identity?`,correctAnswer:"sin²θ + cos²θ = 1",choices:mc("sin²θ + cos²θ = 1",["sinθ+cosθ=1","tan²θ+sin²θ=1","secθ+cscθ=1"]),explanation:"This is the fundamental Pythagorean identity.",hints:["Recall the identity involving sine and cosine squared."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Which reciprocal identity is correct?`,correctAnswer:"csc(θ)=1/sin(θ)",choices:mc("csc(θ)=1/sin(θ)",["csc(θ)=sin(θ)","sec(θ)=1/cos(θ)^2","cot(θ)=tan(θ)"]),explanation:"Cosecant is the reciprocal of sine.",hints:["Match each trig function with its reciprocal."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`Which quotient identity is correct?`,correctAnswer:"tan(θ)=sin(θ)/cos(θ)",choices:mc("tan(θ)=sin(θ)/cos(θ)",["tan(θ)=cos(θ)/sin(θ)","tan(θ)=1/sin(θ)","tan(θ)=sin(θ)cos(θ)"]),explanation:"Tangent equals sine divided by cosine.",hints:["Recall tan as a quotient of sine and cosine."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`Which identity is correct?`,correctAnswer:"sin(-θ) = -sin(θ)",choices:mc("sin(-θ) = -sin(θ)",["sin(-θ)=sin(θ)","cos(-θ)=-cos(θ)","tan(-θ)=tan(θ)"]),explanation:"Sine is an odd function.",hints:["Sine is odd; cosine is even."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Solve sin(x)=0 for 0°≤x≤360°.`,correctAnswer:"0°, 180°, 360°",choices:mc("0°, 180°, 360°",["90°, 270°","30°, 150°","60°, 300°"]),explanation:"Sine is zero on the x-axis.",hints:["Look at where y=0 on the unit circle."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`How many solutions does sin(x)=1/2 have on 0°≤x≤360°?`,correctAnswer:"2",choices:mc("2",["1","3","4"]),explanation:"The sine value 1/2 occurs at 30° and 150°.",hints:["Check both quadrants where sine is positive."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`The Law of Sines relates each side of a triangle to its:`,correctAnswer:"Opposite angle",choices:mc("Opposite angle",["Adjacent side","Perimeter","Area"]),explanation:"a/sin(A)=b/sin(B)=c/sin(C).",hints:["Pair each side with the angle opposite it."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Which case is especially suited to the Law of Cosines?`,correctAnswer:"SSS or SAS",choices:mc("SSS or SAS",["AAA only","Right triangles only","One side only"]),explanation:"Law of Cosines directly handles SSS and SAS cases.",hints:["Think of cases where Pythagorean theorem needs generalization."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium.push({ generate: () => {
  const q = (() => ({question:`Which is the sine sum identity?`,correctAnswer:"sin(A+B)=sinA cosB + cosA sinB",choices:mc("sin(A+B)=sinA cosB + cosA sinB",["sin(A+B)=sinA+sinB","sin(A+B)=cosA cosB","sin(A+B)=sinA cosB-cosA sinB"]),explanation:"This is the sine addition formula.",hints:["Remember sin(a+b)=sin a cos b + cos a sin b."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard.push({ generate: () => {
  const q = (() => ({question:`Which is a correct double-angle identity?`,correctAnswer:"sin(2θ)=2sinθcosθ",choices:mc("sin(2θ)=2sinθcosθ",["sin(2θ)=sin²θ","cos(2θ)=2cosθ","tan(2θ)=tan²θ"]),explanation:"The sine double-angle identity is 2sinθcosθ.",hints:["Derive it from the sine sum identity."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });
CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy.push({ generate: () => {
  const q = (() => ({question:`Which expression is a valid half-angle formula for sin(θ/2)?`,correctAnswer:"±√((1-cosθ)/2)",choices:mc("±√((1-cosθ)/2)",["√((1+cosθ)/2)","(1-cosθ)/2","2sinθ"]),explanation:"The sign depends on the quadrant of θ/2.",hints:["Half-angle sine uses 1-cosθ."]}))();
  return { type: 'multiple-choice', question: q.question, answer: q.correctAnswer, solution: q.explanation, options: mcOptions(q.correctAnswer, q.choices.slice(1)) };
} });

algebraBasic.push(...CURRICULUM_PROBLEM_ADDITIONS.Algebra.Easy);
algebraIntermediate.push(...CURRICULUM_PROBLEM_ADDITIONS.Algebra.Medium);
algebraAdvanced.push(...CURRICULUM_PROBLEM_ADDITIONS.Algebra.Hard);
geometryBasic.push(...CURRICULUM_PROBLEM_ADDITIONS.Geometry.Easy);
geometryIntermediate.push(...CURRICULUM_PROBLEM_ADDITIONS.Geometry.Medium);
geometryAdvanced.push(...CURRICULUM_PROBLEM_ADDITIONS.Geometry.Hard);
trigBasic.push(...CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Easy);
trigIntermediate.push(...CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Medium);
trigAdvanced.push(...CURRICULUM_PROBLEM_ADDITIONS.Trigonometry.Hard);

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