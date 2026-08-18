/**
 * Client-side Problem Generator
 * Ported from mobile/src/services/clientProblemGenerator.ts — pure JS, no TS syntax.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = (arr) => arr[randInt(0, arr.length - 1)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function mcOptions(correct, wrongs) {
  return shuffle([
    { text: correct, isCorrect: true },
    ...wrongs.slice(0, 3).map((w) => ({ text: w, isCorrect: false })),
  ]);
}

function tfOptions(correct) {
  return [
    { text: 'True',  isCorrect:  correct },
    { text: 'False', isCorrect: !correct },
  ];
}

// helper used in curriculum additions — returns [correct, ...wrongs]
function mc(correct, wrongs) {
  return [correct, ...wrongs.slice(0, 3)];
}

// ─── ALGEBRA — Basic ──────────────────────────────────────────────────────────

const algebraBasic = [
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x+a; return { type:'free-response', question:`Solve for x:  x + ${a} = ${b}`, answer:`${x}`, solution:`Subtract ${a}: x = ${b} - ${a} = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),x=randInt(1,15),b=a*x; return { type:'free-response', question:`Solve for x:  ${a}x = ${b}`, answer:`${x}`, solution:`Divide both sides by ${a}: x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,10),b=randInt(1,15),x=a*b; return { type:'free-response', question:`Solve for x:  x / ${a} = ${b}`, answer:`${x}`, solution:`Multiply by ${a}: x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,10),c=a*x+b; const s=b>=0?'+':'-',bAbs=Math.abs(b); return { type:'multiple-choice', question:`Solve for x:  ${a}x ${s} ${bAbs} = ${c}`, answer:`${x}`, solution:`Subtract ${b}, divide by ${a}: x = ${x}`, options:mcOptions(`${x}`,[`${x+1}`,`${x-1}`,`${x+2}`]) }; } },
  { generate: () => { const a=randInt(1,20),x=randInt(1,30),b=x-a; return { type:'multiple-choice', question:`Solve for x:  x - ${a} = ${b}`, answer:`${x}`, solution:`Add ${a} to both sides: x = ${x}`, options:mcOptions(`${x}`,[`${x+2}`,`${x-2}`,`${b}`]) }; } },
  { generate: () => { const a=randInt(2,9),x=randInt(1,12),b=a*x; const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`If ${a}x = ${b}, then x = ${shown}. True or False?`, answer:claim?'True':'False', solution:`${a}x = ${b} → x = ${b/a}. The statement is ${claim?'true':'false'}.`, options:tfOptions(claim) }; } },
];

// ─── ALGEBRA — Intermediate ───────────────────────────────────────────────────

const algebraIntermediate = [
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),x=randInt(1,12),c=a*(x+b); return { type:'free-response', question:`Solve for x:  ${a}(x + ${b}) = ${c}`, answer:`${x}`, solution:`Distribute: ${a}x + ${a*b} = ${c}, so x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(1,10),c=randInt(5,20),x=a*(c-b); return { type:'free-response', question:`Solve:  x/${a} + ${b} = ${c}`, answer:`${x}`, solution:`x/${a} = ${c-b}, so x = ${x}`, options:[] }; } },
  { generate: () => { const p=randInt(-7,7),q=randInt(-7,7),B=p+q,C=p*q,s1=B>=0?'+':'-',s2=C>=0?'+':'-',Babs=Math.abs(B),Cabs=Math.abs(C); return { type:'multiple-choice', question:`Solve:  x² ${s1} ${Babs}x ${s2} ${Cabs} = 0`, answer:`x = ${-p} or x = ${-q}`, solution:`Factor: (x${p>=0?'-':'+'}${Math.abs(p)})(x${q>=0?'-':'+'}${Math.abs(q)}) = 0`, options:mcOptions(`x = ${-p} or x = ${-q}`,[`x = ${p} or x = ${q}`,`x = ${-p}`,`x = ${-q}`]) }; } },
  { generate: () => { const a=randInt(2,5),b=randInt(1,5),c=randInt(1,5),x=randInt(1,8),y=a*x,d=b*x+c*y; return { type:'multiple-choice', question:`Solve the system: y = ${a}x,  ${b}x + ${c}y = ${d}`, answer:`x = ${x}, y = ${y}`, solution:`Sub y = ${a}x: ${b+c*a}x = ${d}, so x = ${x}, y = ${y}`, options:mcOptions(`x = ${x}, y = ${y}`,[`x = ${x+1}, y = ${y}`,`x = ${x}, y = ${y+1}`,`x = ${x-1}, y = ${y-1}`]) }; } },
  { generate: () => { const a=randInt(2,6),b=randInt(1,8),x=randInt(1,8),c=a*(x+b); const claim=randChoice([true,false]); const shown=claim?x:x+randInt(1,3); return { type:'true-false', question:`${a}(x + ${b}) = ${c}. Is x = ${shown} the solution? True or False?`, answer:claim?'True':'False', solution:`Distribute: ${a}x + ${a*b} = ${c} → x = ${x}. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
];

// ─── ALGEBRA — Advanced ───────────────────────────────────────────────────────

const algebraAdvanced = [
  { generate: () => { const base=randChoice([2,3,4,5]),x=randInt(2,5),result=Math.pow(base,x); return { type:'free-response', question:`Solve for x:  ${base}^x = ${result}`, answer:`${x}`, solution:`${result} = ${base}^${x}, so x = ${x}`, options:[] }; } },
  { generate: () => { const a=randInt(2,6),b=randInt(-10,10),c=randInt(5,20),v1=(c-b)/a,v2=(-c-b)/a,x1=Number.isInteger(v1)?`${v1}`:v1.toFixed(2),x2=Number.isInteger(v2)?`${v2}`:v2.toFixed(2),s=b>=0?'+':'-',bAbs=Math.abs(b); return { type:'free-response', question:`Solve:  |${a}x ${s} ${bAbs}| = ${c}`, answer:`x = ${x1} or x = ${x2}`, solution:`Case 1: ${a}x ${s} ${bAbs} = ${c} → x = ${x1}. Case 2: ${a}x ${s} ${bAbs} = -${c} → x = ${x2}. (Note: Providing either solution is accepted)`, options:[] }; } },
  { generate: () => { const p=randInt(-8,8),q=randInt(-8,8),B=p+q,C=p*q,s1=B>=0?'+':'-',s2=C>=0?'+':'-',Babs=Math.abs(B),Cabs=Math.abs(C); return { type:'multiple-choice', question:`Factor and solve:  x² ${s1} ${Babs}x ${s2} ${Cabs} = 0`, answer:`x = ${-p} or x = ${-q}`, solution:`(x${p>=0?'-':'+'}${Math.abs(p)})(x${q>=0?'-':'+'}${Math.abs(q)}) = 0`, options:mcOptions(`x = ${-p} or x = ${-q}`,[`x = ${p} or x = ${q}`,`x = ${-p}`,`No real solutions`]) }; } },
  { generate: () => { const b=randChoice([2,3]),x=randInt(2,4),result=Math.pow(b,x); const claim=randChoice([true,false]); const shown=claim?x:x+1; return { type:'true-false', question:`${b}^${shown} = ${result}. True or False?`, answer:claim?'True':'False', solution:`${b}^${x} = ${result}. The statement is ${claim?'true':'false'}.`, options:tfOptions(claim) }; } },
];

// ─── GEOMETRY — Basic ─────────────────────────────────────────────────────────

const geometryBasic = [
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the area of a rectangle: length ${l} cm, width ${w} cm.`, answer:`${l*w}`, solution:`A = l × w = ${l} × ${w} = ${l*w} cm²`, options:[] }; } },
  { generate: () => { const l=randInt(5,20),w=randInt(3,15); return { type:'free-response', question:`Find the perimeter of a rectangle: length ${l} m, width ${w} m.`, answer:`${2*(l+w)}`, solution:`P = 2(l+w) = 2(${l}+${w}) = ${2*(l+w)} m`, options:[] }; } },
  { generate: () => { const b=randInt(4,20),h=randInt(3,18),a=(b*h)/2; return { type:'multiple-choice', question:`Area of a triangle: base ${b} cm, height ${h} cm?`, answer:`${a} cm²`, solution:`A = ½bh = ½ × ${b} × ${h} = ${a} cm²`, options:mcOptions(`${a} cm²`,[`${a+5} cm²`,`${b*h} cm²`,`${a-3} cm²`]) }; } },
  { generate: () => { const r=randInt(3,12),a=(Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Area of a circle with radius ${r} cm? (π ≈ 3.14)`, answer:`${a} cm²`, solution:`A = πr² = 3.14 × ${r}² ≈ ${a} cm²`, options:mcOptions(`${a} cm²`,[`${(Math.PI*r*r+5).toFixed(1)} cm²`,`${(2*Math.PI*r).toFixed(1)} cm²`,`${(Math.PI*(r+1)*(r+1)).toFixed(1)} cm²`]) }; } },
  { generate: () => { const l=randInt(4,15),w=randInt(3,12),claim=randChoice([true,false]); const shown=claim?2*(l+w):2*(l+w)+randInt(2,6); return { type:'true-false', question:`A rectangle ${l} m × ${w} m has perimeter ${shown} m. True or False?`, answer:claim?'True':'False', solution:`P = 2(${l}+${w}) = ${2*(l+w)} m. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
];

// ─── GEOMETRY — Intermediate ──────────────────────────────────────────────────

const geometryIntermediate = [
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=Math.sqrt(a*a+b*b).toFixed(2); return { type:'free-response', question:`Right triangle with legs ${a} cm and ${b} cm. Find the hypotenuse.`, answer:c, solution:`c = √(${a}²+${b}²) = √${a*a+b*b} ≈ ${c} cm`, options:[] }; } },
  { generate: () => { const l=randInt(4,12),w=randInt(3,10),h=randInt(5,15); return { type:'free-response', question:`Volume of a rectangular prism: ${l} × ${w} × ${h} cm.`, answer:`${l*w*h}`, solution:`V = l × w × h = ${l*w*h} cm³`, options:[] }; } },
  { generate: () => { const b1=randInt(5,15),b2=randInt(8,20),h=randInt(4,12),a=(b1+b2)*h/2; return { type:'multiple-choice', question:`Area of trapezoid: bases ${b1} m and ${b2} m, height ${h} m?`, answer:`${a} m²`, solution:`A = ½(b₁+b₂)h = ${a} m²`, options:mcOptions(`${a} m²`,[`${a+8} m²`,`${(b1+b2)*h} m²`,`${a-5} m²`]) }; } },
  { generate: () => { const s=randInt(3,12),sa=6*s*s; return { type:'multiple-choice', question:`Surface area of a cube with side ${s} cm?`, answer:`${sa} cm²`, solution:`SA = 6s² = 6 × ${s}² = ${sa} cm²`, options:mcOptions(`${sa} cm²`,[`${sa+12} cm²`,`${s*s*s} cm³`,`${4*s*s} cm²`]) }; } },
  { generate: () => { const a=randInt(3,12),b=randInt(4,12),c=parseFloat(Math.sqrt(a*a+b*b).toFixed(2)),claim=randChoice([true,false]); const shown=claim?c:parseFloat((c+randInt(1,3)).toFixed(2)); return { type:'true-false', question:`In a right triangle with legs ${a} and ${b}, the hypotenuse is ${shown} cm. True or False?`, answer:claim?'True':'False', solution:`c = √(${a*a}+${b*b}) = ${c} cm. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
];

// ─── GEOMETRY — Advanced ──────────────────────────────────────────────────────

const geometryAdvanced = [
  { generate: () => { const r=randInt(3,10),h=randInt(5,15),v=(Math.PI*r*r*h).toFixed(1); return { type:'free-response', question:`Volume of a cylinder: radius ${r} cm, height ${h} cm. (π ≈ 3.14)`, answer:v, solution:`V = πr²h = 3.14 × ${r}² × ${h} ≈ ${v} cm³`, options:[] }; } },
  { generate: () => { const r=randInt(3,10),sa=(4*Math.PI*r*r).toFixed(1); return { type:'multiple-choice', question:`Surface area of a sphere: radius ${r} cm? (π ≈ 3.14)`, answer:`${sa} cm²`, solution:`SA = 4πr² ≈ ${sa} cm²`, options:mcOptions(`${sa} cm²`,[`${(4*Math.PI*r*r+10).toFixed(1)} cm²`,`${(2*Math.PI*r*r).toFixed(1)} cm²`,`${(4*Math.PI*(r+1)*(r+1)).toFixed(1)} cm²`]) }; } },
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'multiple-choice', question:`Two supplementary angles. One is ${a1}°. Find the other.`, answer:`${a2}°`, solution:`180° - ${a1}° = ${a2}°`, options:mcOptions(`${a2}°`,[`${a2+5}°`,`${90-a1}°`,`${a2-5}°`]) }; } },
  { generate: () => { const a1=randInt(20,70),a2=90-a1; return { type:'multiple-choice', question:`Two complementary angles. One is ${a1}°. Find the other.`, answer:`${a2}°`, solution:`90° - ${a1}° = ${a2}°`, options:mcOptions(`${a2}°`,[`${a2+5}°`,`${180-a1}°`,`${a2-5}°`]) }; } },
  { generate: () => { const r=randInt(3,10),v=parseFloat(((Math.PI*r*r*r*4)/3).toFixed(1)),claim=randChoice([true,false]); const shown=claim?v:parseFloat((v+randInt(5,15)).toFixed(1)); return { type:'true-false', question:`Volume of a sphere with radius ${r} cm is ${shown} cm³. True or False?`, answer:claim?'True':'False', solution:`V = (4/3)πr³ ≈ ${v} cm³. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
];

// ─── TRIGONOMETRY ─────────────────────────────────────────────────────────────

const commonAngles = [
  { angle:0,  sinStr:'0',    cosStr:'1'    },
  { angle:30, sinStr:'1/2',  cosStr:'√3/2' },
  { angle:45, sinStr:'√2/2', cosStr:'√2/2' },
  { angle:60, sinStr:'√3/2', cosStr:'1/2'  },
  { angle:90, sinStr:'1',    cosStr:'0'    },
];
const radMap = { 30:'π/6', 45:'π/4', 60:'π/3', 90:'π/2', 120:'2π/3', 135:'3π/4', 150:'5π/6', 180:'π' };

const trigBasic = [
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is sin(${a.angle}°)?`, answer:a.sinStr, solution:`sin(${a.angle}°) = ${a.sinStr}`, options:mcOptions(a.sinStr, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>x.sinStr)) }; } },
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`What is cos(${a.angle}°)?`, answer:a.cosStr, solution:`cos(${a.angle}°) = ${a.cosStr}`, options:mcOptions(a.cosStr, commonAngles.filter(x=>x.angle!==a.angle).slice(0,3).map(x=>x.cosStr)) }; } },
  { generate: () => { const deg=randChoice([30,45,60,90,120,180]); return { type:'free-response', question:`Convert ${deg}° to radians.`, answer:radMap[deg], solution:`${deg}° × π/180 = ${radMap[deg]}`, options:[] }; } },
  { generate: () => { const hyp=randInt(10,30),angle=randChoice([30,45,60]); const sinV=angle===30?0.5:angle===45?0.707:0.866; const opp=(hyp*sinV).toFixed(1); return { type:'multiple-choice', question:`Right triangle: hypotenuse = ${hyp} cm, angle = ${angle}°. Find the opposite side.`, answer:`${opp} cm`, solution:`opp = ${hyp} × sin(${angle}°) = ${opp} cm`, options:mcOptions(`${opp} cm`,[`${(hyp*sinV+2).toFixed(1)} cm`,`${(hyp*sinV-2).toFixed(1)} cm`,`${(hyp*(1-sinV)).toFixed(1)} cm`]) }; } },
  { generate: () => { const a=randChoice(commonAngles.slice(0,4)); const claim=randChoice([true,false]); const other=commonAngles.find(x=>x.angle!==a.angle); const shownSin=claim?a.sinStr:other.sinStr; return { type:'true-false', question:`sin(${a.angle}°) = ${shownSin}. True or False?`, answer:claim?'True':'False', solution:`sin(${a.angle}°) = ${a.sinStr}. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
];

const trigIntermediate = [
  { generate: () => { const sv=(randInt(3,9)/10).toFixed(1); const cv=Math.sqrt(1-parseFloat(sv)**2).toFixed(3); return { type:'multiple-choice', question:`If sin(x) = ${sv}, find cos(x) (first quadrant).`, answer:`${cv}`, solution:`cos²x = 1 - ${sv}² = ${(1-parseFloat(sv)**2).toFixed(3)}, so cos(x) ≈ ${cv}`, options:mcOptions(`${cv}`,[`${(parseFloat(cv)+0.1).toFixed(3)}`,`${(parseFloat(cv)-0.1).toFixed(3)}`,`${sv}`]) }; } },
  { generate: () => { const opp=randInt(3,10),adj=randInt(4,12),angle=(Math.atan(opp/adj)*180/Math.PI).toFixed(1); return { type:'free-response', question:`Right triangle: opposite = ${opp}, adjacent = ${adj}. Find angle θ (degrees).`, answer:angle, solution:`θ = arctan(${opp}/${adj}) ≈ ${angle}°`, options:[] }; } },
  { generate: () => { const A=randInt(2,8),period=randChoice([2,3,4,6]),B=(2*Math.PI/period).toFixed(3); return { type:'multiple-choice', question:`For f(x) = ${A}sin(${B}x), what is the amplitude?`, answer:`${A}`, solution:`Amplitude = |A| = ${A}`, options:mcOptions(`${A}`,[`${A+1}`,`${A-1}`,`${B}`]) }; } },
  { generate: () => { return { type:'true-false', question:`In a triangle, the Law of Sines states that a/sin(A) = b/sin(B). True or False?`, answer:'True', solution:`This is the definition of the Law of Sines.`, options:tfOptions(true) }; } },
  { generate: () => { const k=randInt(2,4),angle=30*k; return { type:'free-response', question:`Solve for x in [0°, 180°]: sin(x) = sin(${angle}°). Give all solutions.`, answer:`${angle}° and ${180-angle}°`, solution:`sin has the same value at ${angle}° and ${180-angle}°`, options:[] }; } },
];

const trigAdvanced = [
  { generate: () => { const a=randInt(8,15),b=randInt(10,18),angC=randChoice([60,90,120]); const c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(angC*Math.PI/180)).toFixed(1); return { type:'multiple-choice', question:`Law of Cosines: a=${a}, b=${b}, C=${angC}°. Find c.`, answer:`${c} cm`, solution:`c² = ${a}²+${b}² - 2(${a})(${b})cos(${angC}°) → c ≈ ${c} cm`, options:mcOptions(`${c} cm`,[`${(parseFloat(c)+2).toFixed(1)} cm`,`${(parseFloat(c)-2).toFixed(1)} cm`,`${Math.abs(a-b)} cm`]) }; } },
  { generate: () => { const angle=randChoice([30,45,60]),double=angle*2,sinD=Math.sin(double*Math.PI/180).toFixed(3); return { type:'free-response', question:`Use sin(2x) = 2sin(x)cos(x) to find sin(${double}°).`, answer:sinD, solution:`sin(${double}°) = 2·sin(${angle}°)·cos(${angle}°) ≈ ${sinD}`, options:[] }; } },
  { generate: () => { const angle=randChoice([120,135,150,210,225,240,300,315,330]); const ref=angle<=180?180-angle:angle<=270?angle-180:360-angle; const claim=randChoice([true,false]); const shown=claim?ref:ref+randInt(5,15); return { type:'true-false', question:`The reference angle for ${angle}° is ${shown}°. True or False?`, answer:claim?'True':'False', solution:`Reference angle for ${angle}° is ${ref}°. ${claim?'Correct.':'Incorrect.'}`, options:tfOptions(claim) }; } },
  { generate: () => { const a=randChoice(commonAngles); return { type:'multiple-choice', question:`On the unit circle, what are the coordinates at ${a.angle}°?`, answer:`(${a.cosStr}, ${a.sinStr})`, solution:`x = cos(${a.angle}°) = ${a.cosStr}, y = sin(${a.angle}°) = ${a.sinStr}`, options:mcOptions(`(${a.cosStr}, ${a.sinStr})`,[`(${a.sinStr}, ${a.cosStr})`,`(${a.cosStr}, 0)`,`(0, ${a.sinStr})`]) }; } },
  { generate: () => { const a1=randInt(30,80),a2=180-a1; return { type:'free-response', question:`Two supplementary angles. One is ${a1}°. Find the other in degrees.`, answer:`${a2}`, solution:`180° - ${a1}° = ${a2}°`, options:[] }; } },
];

// ─── Curriculum additions — Algebra ──────────────────────────────────────────

algebraBasic.push(
  { generate: () => { const a=randInt(2,20),b=randInt(2,20); const answer=(a%b===0)?`${a/b}`:`${a}/${b}`; return { type:'multiple-choice', question:`Which classification best describes ${a}/${b}?`, answer:'Rational', solution:`${a}/${b} can be written as a ratio of two integers, so it is rational.`, options:mcOptions('Rational',['Irrational','Integer only','Natural only']) }; } },
  { generate: () => { const n=randInt(2,8); const ans=n*n; return { type:'multiple-choice', question:`Simplify: √${ans}`, answer:`${n}`, solution:`${n}×${n}=${ans}, so √${ans}=${n}.`, options:mcOptions(`${n}`,[`${n+1}`,`${n-1}`,`${ans}`]) }; } },
  { generate: () => { const n=randInt(2,9); return { type:'multiple-choice', question:`Which expression represents "${n} more than x"?`, answer:`x + ${n}`, solution:`"More than" indicates addition, so the expression is x + ${n}.`, options:mcOptions(`x + ${n}`,[`${n}x`,`x - ${n}`,`${n} - x`]) }; } },
  { generate: () => { const x=randInt(2,8),a=randInt(2,5); const ans=a*x+3; return { type:'multiple-choice', question:`If x=${x}, evaluate ${a}x + 3.`, answer:`${ans}`, solution:`Substitute x=${x}: ${a}(${x})+3=${ans}.`, options:mcOptions(`${ans}`,[`${a+x+3}`,`${a*x}`,`${a*(x+3)}`]) }; } },
  { generate: () => { const a=randInt(2,8),x=randInt(2,10),b=x+a; return { type:'multiple-choice', question:`Solve: x + ${a} > ${b}`, answer:`x > ${x}`, solution:`Subtract ${a}: x>${x}.`, options:mcOptions(`x > ${x}`,[`x < ${x}`,`x > ${b}`,`x < ${a}`]) }; } },
  { generate: () => { const x=randInt(1,8),y=-randInt(1,8); return { type:'multiple-choice', question:`The point (${x}, ${y}) lies in which quadrant?`, answer:'Quadrant IV', solution:`Positive x and negative y place the point in Quadrant IV.`, options:mcOptions('Quadrant IV',['Quadrant I','Quadrant II','Quadrant III']) }; } },
  { generate: () => { const m=randInt(2,6),x1=randInt(1,5),y1=randInt(1,8); return { type:'multiple-choice', question:`Which is point-slope form for slope ${m} through (${x1},${y1})?`, answer:`y - ${y1} = ${m}(x - ${x1})`, solution:`Point-slope form is y-y₁=m(x-x₁).`, options:mcOptions(`y - ${y1} = ${m}(x - ${x1})`,[`y + ${y1} = ${m}(x + ${x1})`,`y = ${m}x + ${y1}`,`y - ${x1} = ${m}(x - ${y1})`]) }; } },
  { generate: () => { const a=randInt(2,5),x=randInt(2,8),b=randInt(1,5),c=randInt(1,5); const rhs=a*x+b+c; return { type:'multiple-choice', question:`Solve: ${a}x + ${b} + ${c} = ${rhs}`, answer:`${x}`, solution:`Combine constants: ${b}+${c}=${b+c}; then solve ${a}x+${b+c}=${rhs}.`, options:mcOptions(`${x}`,[`${x+2}`,`${x-2}`,`${rhs}`]) }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(2,8); return { type:'multiple-choice', question:`Simplify: ${a}x + ${b}x`, answer:`${a+b}x`, solution:`Like terms combine: ${a}+${b}=${a+b}.`, options:mcOptions(`${a+b}x`,[`${a*b}x`,`${a+b}`,`${a-b}x`]) }; } },
  { generate: () => { const h=randInt(1,5),k=randInt(1,8); return { type:'multiple-choice', question:`For y=(x-${h})²+${k}, what is the vertex?`, answer:`(${h}, ${k})`, solution:`Vertex form y=(x-h)²+k has vertex (h,k).`, options:mcOptions(`(${h}, ${k})`,[`(-${h}, ${k})`,`(${h}, -${k})`,`(${k}, ${h})`]) }; } }
);

algebraIntermediate.push(
  { generate: () => { const a=randInt(2,9),b=randInt(2,6),c=randInt(1,5); const ans=a+b*c; return { type:'multiple-choice', question:`Evaluate: ${a} + ${b} × ${c}`, answer:`${ans}`, solution:`Multiply first: ${b}×${c}=${b*c}, then add ${a} to get ${ans}.`, options:mcOptions(`${ans}`,[`${(a+b)*c}`,`${a*b+c}`,`${a+b+c}`]) }; } },
  { generate: () => { const n=randInt(2,9); return { type:'multiple-choice', question:`Write ${n*1000} in scientific notation.`, answer:`${n} × 10^3`, solution:`Move the decimal three places left: ${n*1000} = ${n} × 10^3.`, options:mcOptions(`${n} × 10^3`,[`${n} × 10^2`,`${n} × 10^4`,`${n*10} × 10^3`]) }; } },
  { generate: () => { const x1=randInt(1,5),x2=x1+randInt(1,5),y1=randInt(1,8),m=randInt(1,5),y2=y1+m*(x2-x1); return { type:'multiple-choice', question:`Find the slope through (${x1},${y1}) and (${x2},${y2}).`, answer:`${m}`, solution:`m=(${y2}-${y1})/(${x2}-${x1})=${m}.`, options:mcOptions(`${m}`,[`${m+1}`,`${m-1}`,`${x2-x1}`]) }; } },
  { generate: () => { const a=randInt(2,12),x=randInt(2,15); return { type:'multiple-choice', question:`Solve: x + ${a} = ${x+a}`, answer:`${x}`, solution:`Subtract ${a} from both sides to get x=${x}.`, options:mcOptions(`${x}`,[`${x+a}`,`${x-1}`,`${a}`]) }; } },
  { generate: () => { const m=randInt(1,5),b=randInt(1,8); return { type:'multiple-choice', question:`For y=${m}x+${b}, where does the line cross the y-axis?`, answer:`(0, ${b})`, solution:`Set x=0 to get y=${b}.`, options:mcOptions(`(0, ${b})`,[`(${b}, 0)`,`(1, ${m+b})`,`(0, ${m})`]) }; } },
  { generate: () => { const d=randInt(2,8),x=randInt(2,10); return { type:'multiple-choice', question:`Solve: x/${d} = ${x}`, answer:`${d*x}`, solution:`Multiply both sides by ${d}: x=${d*x}.`, options:mcOptions(`${d*x}`,[`${x}`,`${d*x+d}`,`${d+x}`]) }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(2,8); return { type:'multiple-choice', question:`Add: (${a}x + 2) + (${b}x + 3)`, answer:`${a+b}x + 5`, solution:`Combine like terms: ${a+b}x + 5.`, options:mcOptions(`${a+b}x + 5`,[`${a+b}x + 2`,`${a}x + 5`,`${a*b}x + 5`]) }; } },
  { generate: () => { const a=randInt(2,6); return { type:'multiple-choice', question:`Expand: (x + ${a})²`, answer:`x² + ${2*a}x + ${a*a}`, solution:`Use (x+a)²=x²+2ax+a².`, options:mcOptions(`x² + ${2*a}x + ${a*a}`,[`x² + ${a*a}`,`x² + ${a}x + ${a*a}`,`x² + ${2*a}`]) }; } },
  { generate: () => { const b=randChoice([2,3,5]),e=randInt(1,4),n=Math.pow(b,e); return { type:'multiple-choice', question:`Evaluate log base ${b} of ${n}.`, answer:`${e}`, solution:`Because ${b}^${e}=${n}, log_${b}(${n})=${e}.`, options:mcOptions(`${e}`,[`${e+1}`,`${b}`,`${n}`]) }; } },
  { generate: () => { const a=randInt(2,7); return { type:'multiple-choice', question:`What number completes x² + ${2*a}x to a perfect square?`, answer:`${a*a}`, solution:`Take half the x coefficient (${a}) and square it.`, options:mcOptions(`${a*a}`,[`${2*a}`,`${a}`,`${a*a+a}`]) }; } }
);

algebraAdvanced.push(
  { generate: () => { const p=randInt(2,8)*10; return { type:'multiple-choice', question:`Convert ${p}% to a decimal.`, answer:`${(p/100).toFixed(2)}`, solution:`Divide by 100: ${p}% = ${(p/100).toFixed(2)}.`, options:mcOptions(`${(p/100).toFixed(2)}`,[`${p/10}`,`${p/1000}`,`${(p/100+0.1).toFixed(2)}`]) }; } },
  { generate: () => { const a=randInt(2,9),b=randInt(1,9); return { type:'multiple-choice', question:`In ${a}x + ${b}, what is the coefficient of x?`, answer:`${a}`, solution:`The coefficient is the number multiplying x, which is ${a}.`, options:mcOptions(`${a}`,[`${b}`,'x',`${a+b}`]) }; } },
  { generate: () => { const a=randInt(2,9); return { type:'multiple-choice', question:`Solve ${a}x = y for x.`, answer:`x = y/${a}`, solution:`Divide both sides by ${a}.`, options:mcOptions(`x = y/${a}`,[`x = ${a}y`,`x = y + ${a}`,`x = ${a}/y`]) }; } },
  { generate: () => { const a=randInt(2,8),b=randInt(1,9); return { type:'multiple-choice', question:`Expand: ${a}(x + ${b})`, answer:`${a}x + ${a*b}`, solution:`Multiply ${a} by both terms: ${a}x + ${a*b}.`, options:mcOptions(`${a}x + ${a*b}`,[`${a}x + ${b}`,`${a+b}x`,`${a}x + ${a+b}`]) }; } },
  { generate: () => { const m=randInt(2,6),b=randInt(1,8); return { type:'multiple-choice', question:`In y = ${m}x + ${b}, what is the y-intercept?`, answer:`${b}`, solution:`In y=mx+b, b is the y-intercept.`, options:mcOptions(`${b}`,[`${m}`,`${m+b}`,`-${b}`]) }; } },
  { generate: () => { const p=randInt(1,6),q=randInt(1,6); const B=p+q,C=p*q; return { type:'multiple-choice', question:`Factor: x² + ${B}x + ${C}`, answer:`(x + ${p})(x + ${q})`, solution:`${p} and ${q} multiply to ${C} and add to ${B}.`, options:mcOptions(`(x + ${p})(x + ${q})`,[`(x - ${p})(x - ${q})`,`(x + ${B})(x + ${C})`,`(x + ${p+q})(x + 1)`]) }; } },
  { generate: () => { const a=randInt(2,9); return { type:'multiple-choice', question:`Factor: x² - ${a*a}`, answer:`(x - ${a})(x + ${a})`, solution:`x²-a²=(x-a)(x+a).`, options:mcOptions(`(x - ${a})(x + ${a})`,[`(x - ${a})²`,`(x + ${a})²`,`(x - ${a*a})(x + 1)`]) }; } },
  { generate: () => { const p=randInt(1,6),q=randInt(1,6); return { type:'multiple-choice', question:`Solve: (x-${p})(x-${q})=0`, answer:`x=${p} or x=${q}`, solution:`By the zero-product property, either factor equals zero.`, options:mcOptions(`x=${p} or x=${q}`,[`x=-${p} or x=-${q}`,`x=${p+q}`,`x=${p*q}`]) }; } },
  { generate: () => { const x=randInt(2,8),a=randInt(2,5); const ans=a*x+1; return { type:'multiple-choice', question:`If f(x)=${a}x+1, find f(${x}).`, answer:`${ans}`, solution:`Substitute x=${x}: f(${x})=${a}(${x})+1=${ans}.`, options:mcOptions(`${ans}`,[`${a+x+1}`,`${a*x}`,`${x+1}`]) }; } },
  { generate: () => { const a=randInt(2,6),b=randInt(1,6); return { type:'multiple-choice', question:`What is the inverse of f(x)=${a}x+${b}?`, answer:`f⁻¹(x)=(x-${b})/${a}`, solution:`Swap x and y, then solve for y.`, options:mcOptions(`f⁻¹(x)=(x-${b})/${a}`,[`f⁻¹(x)=${a}x+${b}`,`f⁻¹(x)=(x+${b})/${a}`,`f⁻¹(x)=${a}(x-${b})`]) }; } }
);

// ─── Curriculum additions — Geometry ─────────────────────────────────────────

geometryBasic.push(
  { generate: () => ({ type:'multiple-choice', question:`Which geometric figure extends infinitely in both directions?`, answer:'Line', solution:'A line extends infinitely in both directions.', options:mcOptions('Line',['Ray','Line segment','Point']) }) },
  { generate: () => { const a=randChoice([45,90,120,180]); const type=a<90?'Acute':a===90?'Right':a<180?'Obtuse':'Straight'; return { type:'multiple-choice', question:`An angle measuring ${a}° is what type?`, answer:type, solution:`An angle of ${a}° is classified as ${type.toLowerCase()}.`, options:mcOptions(type,['Acute','Right','Obtuse','Straight'].filter(v=>v!==type)) }; } },
  { generate: () => { const a=randInt(30,80),b=randInt(20,60),c=180-a-b; return { type:'multiple-choice', question:`A triangle has angles ${a}° and ${b}°. Find the third angle.`, answer:`${c}°`, solution:`Triangle angles sum to 180°.`, options:mcOptions(`${c}°`,[`${c+5}°`,`${c-5}°`,`${180-a}°`]) }; } },
  { generate: () => { const triple=randChoice([[3,4,5],[5,12,13],[6,8,10]]); const [a,b,c]=triple; return { type:'multiple-choice', question:`A right triangle has legs ${a} and ${b}. Find the hypotenuse.`, answer:`${c}`, solution:`a²+b²=c², so c=${c}.`, options:mcOptions(`${c}`,[`${a+b}`,`${c+1}`,`${c-1}`]) }; } },
  { generate: () => { const n=randChoice([5,6,7,8]); const sum=(n-2)*180; return { type:'multiple-choice', question:`What is the sum of the interior angles of a ${n}-gon?`, answer:`${sum}°`, solution:`Sum=(n-2)×180=(${n}-2)×180=${sum}°.`, options:mcOptions(`${sum}°`,[`${n*180}°`,`${(n-1)*180}°`,`${(n-2)*90}°`]) }; } },
  { generate: () => { const b=randInt(4,14),h=randInt(3,12),a=b*h/2; return { type:'multiple-choice', question:`Find the area of a triangle with base ${b} and height ${h}.`, answer:`${a}`, solution:`A=½bh=${a}.`, options:mcOptions(`${a}`,[`${b*h}`,`${a+5}`,`${a-2}`]) }; } },
  { generate: () => { const r=randInt(3,10); return { type:'multiple-choice', question:`A circle has radius ${r} cm. What is its diameter?`, answer:`${2*r} cm`, solution:`Diameter is twice the radius.`, options:mcOptions(`${2*r} cm`,[`${r} cm`,`${r+2} cm`,`${r*r} cm`]) }; } },
  { generate: () => { const d=randInt(6,20); return { type:'multiple-choice', question:`A circle has diameter ${d} cm. What is its radius?`, answer:`${d/2} cm`, solution:`Radius is half the diameter.`, options:mcOptions(`${d/2} cm`,[`${d} cm`,`${d/4} cm`,`${d+2} cm`]) }; } },
  { generate: () => { const a=randInt(30,150); return { type:'multiple-choice', question:`A central angle measures ${a}°. What is its intercepted arc?`, answer:`${a}°`, solution:'A central angle equals its intercepted arc.', options:mcOptions(`${a}°`,[`${180-a}°`,`${2*a}°`,`${a/2}°`]) }; } },
  { generate: () => { const dx=randInt(1,5),dy=randInt(-4,4),x=randInt(1,5),y=randInt(1,5); return { type:'multiple-choice', question:`Translate (${x},${y}) by (${dx},${dy}).`, answer:`(${x+dx}, ${y+dy})`, solution:`Add the translation vector to each coordinate.`, options:mcOptions(`(${x+dx}, ${y+dy})`,[`(${x-dx}, ${y-dy})`,`(${x+dy}, ${y+dx})`,`(${dx}, ${dy})`]) }; } }
);

geometryIntermediate.push(
  { generate: () => { const a=randInt(3,10),b=randInt(3,10); return { type:'multiple-choice', question:`A segment is ${a} cm long. If another congruent segment is drawn, its length is:`, answer:`${a} cm`, solution:'Congruent segments have equal lengths.', options:mcOptions(`${a} cm`,[`${a+b} cm`,`${b} cm`,`${a*2} cm`]) }; } },
  { generate: () => { const a=randInt(20,70),b=180-a; return { type:'multiple-choice', question:`Two adjacent angles form a straight angle. If one is ${a}°, the other is:`, answer:`${b}°`, solution:`Angles forming a straight angle sum to 180°.`, options:mcOptions(`${b}°`,[`${90-a}°`,`${a}°`,`${180+a}°`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`Which congruence criterion uses three pairs of equal corresponding sides?`, answer:'SSS', solution:'SSS means Side-Side-Side.', options:mcOptions('SSS',['SAS','ASA','AA']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which quadrilateral has four right angles and four equal sides?`, answer:'Square', solution:'A square has four equal sides and four right angles.', options:mcOptions('Square',['Rectangle','Rhombus','Trapezoid']) }) },
  { generate: () => ({ type:'multiple-choice', question:`The sum of one exterior angle at each vertex of any convex polygon is:`, answer:'360°', solution:'Exterior angles make one full turn, totaling 360°.', options:mcOptions('360°',['180°','90°','540°']) }) },
  { generate: () => { const l=randInt(4,12),w=randInt(3,10); return { type:'multiple-choice', question:`Find the area of a rectangle ${l} by ${w}.`, answer:`${l*w}`, solution:`A=lw=${l*w}.`, options:mcOptions(`${l*w}`,[`${2*(l+w)}`,`${l*w+5}`,`${l*w-5}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`A chord of a circle is a segment whose endpoints lie:`, answer:'On the circle', solution:'A chord connects two points on the circle.', options:mcOptions('On the circle',['At the center','Outside the circle','On the radius only']) }) },
  { generate: () => { const arc=randChoice([60,80,100,120]); const ang=arc/2; return { type:'multiple-choice', question:`An inscribed angle intercepts an arc of ${arc}°. What is the angle measure?`, answer:`${ang}°`, solution:'An inscribed angle is half its intercepted arc.', options:mcOptions(`${ang}°`,[`${arc}°`,`${180-ang}°`,`${arc*2}°`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`A prism has two congruent, parallel bases. Which statement is true?`, answer:'Its bases are congruent and parallel', solution:'That is the defining structure of a prism.', options:mcOptions('Its bases are congruent and parallel',['It has one vertex','Its base is always a circle','It has no faces']) }) },
  { generate: () => { const x=randInt(1,5),y=randInt(1,5); return { type:'multiple-choice', question:`A 90° counterclockwise rotation about the origin maps (${x},${y}) to:`, answer:`(-${y}, ${x})`, solution:'A 90° CCW rotation maps (x,y)→(-y,x).', options:mcOptions(`(-${y}, ${x})`,[`(${y}, -${x})`,`(${x}, -${y})`,`(-${x}, -${y})`]) }; } }
);

geometryAdvanced.push(
  { generate: () => ({ type:'multiple-choice', question:`A ray has:`, answer:'One endpoint and extends infinitely in one direction', solution:'A ray starts at one endpoint and continues forever in one direction.', options:mcOptions('One endpoint and extends infinitely in one direction',['Two endpoints','No endpoints','Two directions with no endpoint']) }) },
  { generate: () => ({ type:'multiple-choice', question:`A triangle with three equal sides is:`, answer:'Equilateral', solution:'An equilateral triangle has three congruent sides.', options:mcOptions('Equilateral',['Isosceles','Scalene','Right']) }) },
  { generate: () => { const a=randInt(2,6),scale=randInt(2,4); return { type:'multiple-choice', question:`Similar triangles have corresponding sides ${a} and ${a*scale}. The scale factor is:`, answer:`${scale}`, solution:`Scale factor = larger/smaller = ${a*scale}/${a}=${scale}.`, options:mcOptions(`${scale}`,[`${a}`,`${a+scale}`,`${a*scale}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`A regular polygon has:`, answer:'All sides and angles congruent', solution:'Regular polygons have congruent sides and congruent angles.', options:mcOptions('All sides and angles congruent',['Only equal sides','Only equal angles','No equal measures']) }) },
  { generate: () => ({ type:'multiple-choice', question:`An arc measuring less than 180° is called a:`, answer:'Minor arc', solution:'A minor arc has measure less than 180°.', options:mcOptions('Minor arc',['Major arc','Semicircle','Diameter']) }) },
  { generate: () => { const l=randInt(4,12),w=randInt(3,9); return { type:'multiple-choice', question:`Find the perimeter of a rectangle ${l} cm by ${w} cm.`, answer:`${2*(l+w)} cm`, solution:`P=2(l+w)=${2*(l+w)} cm.`, options:mcOptions(`${2*(l+w)} cm`,[`${l*w} cm`,`${2*l+w} cm`,`${2*(l+w)+2} cm`]) }; } },
  { generate: () => { const s=randInt(3,8); return { type:'multiple-choice', question:`Find the surface area of a cube with side ${s}.`, answer:`${6*s*s}`, solution:`SA=6s²=${6*s*s}.`, options:mcOptions(`${6*s*s}`,[`${s*s*s}`,`${4*s*s}`,`${6*s}`]) }; } },
  { generate: () => { const l=randInt(3,8),w=randInt(2,7),h=randInt(2,6); return { type:'multiple-choice', question:`Find the volume of a rectangular prism ${l}×${w}×${h}.`, answer:`${l*w*h}`, solution:`V=lwh=${l*w*h}.`, options:mcOptions(`${l*w*h}`,[`${l+w+h}`,`${2*(l+w+h)}`,`${l*w*h+l}`]) }; } },
  { generate: () => { const h=randInt(1,5),k=randInt(1,5),r=randInt(2,6); return { type:'multiple-choice', question:`Standard equation of a circle at (${h},${k}) with radius ${r}?`, answer:`(x-${h})²+(y-${k})²=${r*r}`, solution:'Use (x-h)²+(y-k)²=r².', options:mcOptions(`(x-${h})²+(y-${k})²=${r*r}`,[`(x+${h})²+(y+${k})²=${r}`,`x²+y²=${r}`,`(x-${h})²+(y-${k})²=${r}`]) }; } },
  { generate: () => { const x=randInt(1,7),y=randInt(1,7); return { type:'multiple-choice', question:`Reflect (${x},${y}) across the x-axis.`, answer:`(${x}, -${y})`, solution:'Reflection across the x-axis changes the sign of y.', options:mcOptions(`(${x}, -${y})`,[`(-${x}, ${y})`,`(-${x}, -${y})`,`(${y}, ${x})`]) }; } }
);

// ─── Curriculum additions — Trigonometry ─────────────────────────────────────

trigBasic.push(
  { generate: () => ({ type:'multiple-choice', question:`In standard position, the initial side of an angle lies along the:`, answer:'Positive x-axis', solution:'Standard-position angles start on the positive x-axis.', options:mcOptions('Positive x-axis',['Positive y-axis','Negative x-axis','Negative y-axis']) }) },
  { generate: () => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return { type:'multiple-choice', question:`In a right triangle with opposite=${o} and hypotenuse=${h}, find sin(θ).`, answer:`${o}/${h}`, solution:'sin=opposite/hypotenuse.', options:mcOptions(`${o}/${h}`,[`${a}/${h}`,`${o}/${a}`,`${h}/${o}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`Which function is the reciprocal of sine?`, answer:'Cosecant', solution:'csc(θ)=1/sin(θ).', options:mcOptions('Cosecant',['Secant','Cotangent','Tangent']) }) },
  { generate: () => ({ type:'multiple-choice', question:`The angle of elevation is measured from the horizontal line of sight:`, answer:'Upward to an object', solution:'It is the angle formed when looking upward from a horizontal line.', options:mcOptions('Upward to an object',['Downward to an object','Along the vertical axis only','At the ground only']) }) },
  { generate: () => { const a=randChoice([120,135,150]); return { type:'multiple-choice', question:`What is the reference angle for ${a}°?`, answer:`${180-a}°`, solution:`For quadrant II, reference angle=180°−θ.`, options:mcOptions(`${180-a}°`,[`${a}°`,`${90-(180-a)}°`,`${360-a}°`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`What is cos(0)?`, answer:'1', solution:'The cosine graph starts at y=1 when x=0.', options:mcOptions('1',['0','-1','√2/2']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which case is especially suited to the Law of Cosines?`, answer:'SSS or SAS', solution:'Law of Cosines directly handles SSS and SAS cases.', options:mcOptions('SSS or SAS',['AAA only','Right triangles only','One side only']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which is a valid half-angle formula for sin(θ/2)?`, answer:'±√((1-cosθ)/2)', solution:'The sign depends on the quadrant of θ/2.', options:mcOptions('±√((1-cosθ)/2)',['√((1+cosθ)/2)','(1-cosθ)/2','2sinθ']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which reciprocal identity is correct?`, answer:'csc(θ)=1/sin(θ)', solution:'Cosecant is the reciprocal of sine.', options:mcOptions('csc(θ)=1/sin(θ)',['csc(θ)=sin(θ)','sec(θ)=1/cos²(θ)','cot(θ)=tan(θ)']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Solve sin(x)=0 for 0°≤x≤360°.`, answer:'0°, 180°, 360°', solution:'Sine is zero on the x-axis.', options:mcOptions('0°, 180°, 360°',['90°, 270°','30°, 150°','60°, 300°']) }) }
);

trigIntermediate.push(
  { generate: () => { const deg=randChoice([30,45,60,90,180]); const map={30:'π/6',45:'π/4',60:'π/3',90:'π/2',180:'π'}; return { type:'multiple-choice', question:`Convert ${deg}° to radians.`, answer:map[deg], solution:`Multiply ${deg} by π/180.`, options:mcOptions(map[deg],['π/2','π/3','π/4'].filter(v=>v!==map[deg])) }; } },
  { generate: () => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return { type:'multiple-choice', question:`In a right triangle with adjacent=${a} and hypotenuse=${h}, find cos(θ).`, answer:`${a}/${h}`, solution:'cos=adjacent/hypotenuse.', options:mcOptions(`${a}/${h}`,[`${o}/${h}`,`${o}/${a}`,`${h}/${a}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`Which ratio should you use when you know the opposite and adjacent sides?`, answer:'Tangent', solution:'Tangent relates opposite and adjacent sides.', options:mcOptions('Tangent',['Sine','Cosine','Cosecant']) }) },
  { generate: () => ({ type:'multiple-choice', question:`The angle of depression is measured from the horizontal line of sight:`, answer:'Downward to an object', solution:'It is the angle formed when looking downward from a horizontal line.', options:mcOptions('Downward to an object',['Upward to an object','Along the vertical axis only','At the ground only']) }) },
  { generate: () => { const a=randChoice([{a:30,s:'1/2'},{a:45,s:'√2/2'},{a:60,s:'√3/2'}]); return { type:'multiple-choice', question:`What is sin(${a.a}°)?`, answer:a.s, solution:`sin(${a.a}°)=${a.s}.`, options:mcOptions(a.s,['0','1/2','1'].filter(v=>v!==a.s)) }; } },
  { generate: () => ({ type:'multiple-choice', question:`What is the period of y=tan(x)?`, answer:'π', solution:'Tangent repeats every π radians.', options:mcOptions('π',['2π','π/2','4π']) }) },
  { generate: () => { const h=randInt(1,5); return { type:'multiple-choice', question:`What is the phase shift of y=sin(x-${h})?`, answer:`${h} units right`, solution:'x-h shifts the graph h units right.', options:mcOptions(`${h} units right`,[`${h} units left`,`-${h} units right`,'No shift']) }; } },
  { generate: () => ({ type:'multiple-choice', question:`Which quotient identity is correct?`, answer:'tan(θ)=sin(θ)/cos(θ)', solution:'Tangent equals sine divided by cosine.', options:mcOptions('tan(θ)=sin(θ)/cos(θ)',['tan(θ)=cos(θ)/sin(θ)','tan(θ)=1/sin(θ)','tan(θ)=sin(θ)cos(θ)']) }) },
  { generate: () => ({ type:'multiple-choice', question:`How many solutions does sin(x)=1/2 have on 0°≤x≤360°?`, answer:'2', solution:'The sine value 1/2 occurs at 30° and 150°.', options:mcOptions('2',['1','3','4']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which is the sine sum identity?`, answer:'sin(A+B)=sinA cosB + cosA sinB', solution:'This is the sine addition formula.', options:mcOptions('sin(A+B)=sinA cosB + cosA sinB',['sin(A+B)=sinA+sinB','sin(A+B)=cosA cosB','sin(A+B)=sinA cosB-cosA sinB']) }) }
);

trigAdvanced.push(
  { generate: () => { const a=randChoice([30,45,60,120,210]); return { type:'multiple-choice', question:`Which angle is coterminal with ${a}°?`, answer:`${a+360}°`, solution:'Coterminal angles differ by multiples of 360°.', options:mcOptions(`${a+360}°`,[`${a+180}°`,`${360-a}°`,`${a+90}°`]) }; } },
  { generate: () => { const t=randChoice([[3,4,5],[5,12,13]]); const [o,a,h]=t; return { type:'multiple-choice', question:`In a right triangle with opposite=${o} and adjacent=${a}, find tan(θ).`, answer:`${o}/${a}`, solution:'tan=opposite/adjacent.', options:mcOptions(`${o}/${a}`,[`${a}/${h}`,`${o}/${h}`,`${h}/${o}`]) }; } },
  { generate: () => { const o=randInt(3,8),a=randInt(4,10); const h=Math.sqrt(o*o+a*a).toFixed(2); return { type:'multiple-choice', question:`A right triangle has legs ${o} and ${a}. Approximate the hypotenuse.`, answer:`${h}`, solution:`Use c=√(a²+b²).`, options:mcOptions(`${h}`,[`${o+a}`,`${Math.abs(a-o)}`,`${(o*a).toFixed(2)}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`On the unit circle, the x-coordinate of a point at angle θ is:`, answer:'cos(θ)', solution:'Unit-circle coordinates are (cosθ,sinθ).', options:mcOptions('cos(θ)',['sin(θ)','tan(θ)','sec(θ)']) }) },
  { generate: () => ({ type:'multiple-choice', question:`What is the period of y=sin(x)?`, answer:'2π', solution:'The sine function repeats every 2π radians.', options:mcOptions('2π',['π','π/2','4π']) }) },
  { generate: () => { const A=randInt(2,7); return { type:'multiple-choice', question:`What is the amplitude of y=${A}sin(x)?`, answer:`${A}`, solution:'Amplitude is |A|.', options:mcOptions(`${A}`,[`${A+1}`,'1','2π']) }; } },
  { generate: () => { const B=randChoice([2,3,4]); const p=(2*Math.PI/B).toFixed(2); return { type:'multiple-choice', question:`What is the period of y=sin(${B}x)?`, answer:`${p}`, solution:'Period=2π/|B|.', options:mcOptions(`${p}`,[`${(2*Math.PI*B).toFixed(2)}`,`${B}`,`${Math.PI.toFixed(2)}`]) }; } },
  { generate: () => ({ type:'multiple-choice', question:`Which is a fundamental Pythagorean identity?`, answer:'sin²θ + cos²θ = 1', solution:'This is the fundamental Pythagorean identity.', options:mcOptions('sin²θ + cos²θ = 1',['sinθ+cosθ=1','tan²θ+sin²θ=1','secθ+cscθ=1']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which identity is correct?`, answer:'sin(-θ) = -sin(θ)', solution:'Sine is an odd function.', options:mcOptions('sin(-θ) = -sin(θ)',['sin(-θ)=sin(θ)','cos(-θ)=-cos(θ)','tan(-θ)=tan(θ)']) }) },
  { generate: () => ({ type:'multiple-choice', question:`Which is a correct double-angle identity?`, answer:'sin(2θ)=2sinθcosθ', solution:'The sine double-angle identity is 2sinθcosθ.', options:mcOptions('sin(2θ)=2sinθcosθ',['sin(2θ)=sin²θ','cos(2θ)=2cosθ','tan(2θ)=tan²θ']) }) }
);

// ─── Template map ─────────────────────────────────────────────────────────────

const templateMap = {
  algebra:      { basic: algebraBasic,      intermediate: algebraIntermediate,      advanced: algebraAdvanced      },
  geometry:     { basic: geometryBasic,     intermediate: geometryIntermediate,     advanced: geometryAdvanced     },
  trigonometry: { basic: trigBasic,         intermediate: trigIntermediate,         advanced: trigAdvanced         },
};

function pickDifficulty(category) {
  if (category === 'basic')        return 'Easy';
  if (category === 'intermediate') return 'Medium';
  if (category === 'advanced')     return 'Hard';
  return randChoice(['Easy', 'Medium', 'Hard']);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateProblems(topic = 'algebra', category = 'mixed', count = 5) {
  const topicKey = topic.toLowerCase();
  const catKey   = category.toLowerCase();
  const topicTemplates = templateMap[topicKey] ?? templateMap['algebra'];

  let pool;
  if (catKey === 'mixed') {
    pool = [
      ...topicTemplates.basic,
      ...topicTemplates.intermediate,
      ...topicTemplates.advanced,
    ];
  } else {
    pool = topicTemplates[catKey] ?? topicTemplates.basic;
  }

  const problems = [];
  for (let i = 0; i < count; i++) {
    const template   = randChoice(pool);
    const raw        = template.generate();
    const difficulty = pickDifficulty(catKey);

    problems.push({
      _id:              `${topicKey}-${catKey}-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      topic:            topicKey,
      subtopic:         topicKey,
      category:         catKey,
      difficulty,
      type:             raw.type,
      problem:          { text: raw.question, latex: null },
      // Normalise options: generator may return [] for free-response
      options:          raw.options ?? [],
      correctAnswer:    raw.answer,
      explanation:      raw.solution,
      solution:         { steps: [raw.solution], finalAnswer: raw.answer },
      hints:            ['Read the question carefully', 'Write down what you know', 'Work step by step'],
      points:           difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 15 : 20,
      previousAttempts: [],
    });
  }

  return problems;
}
