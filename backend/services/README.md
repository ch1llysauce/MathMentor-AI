# Services Documentation

This directory contains the core business logic services for MathMentor AI.

## 📁 Files

### `aiRouter.js`
AI tutoring service with multi-provider fallback system.

**Model:** Groq (`openai/gpt-oss-120b`)

**Functions:**
- `askAITutor(prompt, context)` - Main AI tutor interface with automatic fallback
- `getAnswerExplanation(question, correctAnswer, userAnswer, context)` - Generate explanations for answers
- `getHint(question, step, context)` - Provide step-by-step hints
- `generatePracticeProblem(topic, subtopic, difficulty, context)` - AI-generated practice problems

**Environment Variables Required:**
```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**Example Usage:**
```javascript
import { askAITutor } from '../services/aiRouter.js';

const response = await askAITutor(
    "I don't understand how to solve 2x + 5 = 15",
    { topic: "Algebra", subtopic: "Linear Equations" }
);

console.log(response.response); // AI tutor's Socratic guidance
console.log(response.source);   // "Groq"
```

---

### `mathService.js`
Mathematical validation and computation service using math.js.

**Functions:**
- `validateAnswer(userAnswer, correctAnswer, options)` - Compare answers with multiple validation methods
- `evaluateExpression(expression)` - Safely evaluate math expressions
- `simplifyExpression(expression)` - Algebraic simplification
- `isSimplestForm(numerator, denominator)` - Check if fraction is simplified
- `decimalToFraction(decimal)` - Convert decimals to fractions
- `validateAngle(angle, unit)` - Validate angle measurements
- `calculateAccuracy(correct, total)` - Calculate percentage accuracy
- `suggestDifficulty(accuracy)` - Recommend difficulty level
- `parseMultipleChoiceAnswer(answer)` - Parse multiple choice responses

**Validation Methods:**
1. **String Match** - Direct comparison (fastest)
2. **Numerical Evaluation** - Computes both expressions and compares values
3. **Algebraic Simplification** - Simplifies expressions before comparison

**Example Usage:**
```javascript
import { validateAnswer } from '../services/mathService.js';

// Example 1: Direct comparison
const result1 = validateAnswer("15", "15");
// { isCorrect: true, method: "string_match" }

// Example 2: Numerical evaluation
const result2 = validateAnswer("3 + 4", "7");
// { isCorrect: true, method: "numerical_evaluation" }

// Example 3: Algebraic simplification
const result3 = validateAnswer("2x + 3x", "5x", { allowMultipleForms: true });
// { isCorrect: true, method: "algebraic_simplification" }
```

---

### `learningPath.js`
Adaptive learning path generation based on diagnostic results and progress.

**Functions:**
- `analyzeDiagnosticResults(diagnosticResult)` - Categorize topics as strong/moderate/weak
- `generateLearningPath(diagnosticResult, userPreferences)` - Create personalized learning sequence
- `getNextRecommendation(progressRecords, diagnosticResult)` - Get next study topic
- `suggestDifficultyAdjustment(recentAccuracy, currentDifficulty)` - Adaptive difficulty
- `generateStudySchedule(learningPath, dailyGoalMinutes)` - Create study schedule

**Mastery Thresholds:**
- **Strong:** 80%+ accuracy
- **Moderate:** 50-79% accuracy
- **Weak:** Below 50% accuracy

**Learning Path Priority:**
1. Address weak topics first (lowest scores)
2. Improve moderate topics (build on foundations)
3. Master strong topics (advanced challenges)

**Example Usage:**
```javascript
import { generateLearningPath } from '../services/learningPath.js';

const diagnosticResult = {
    topicScores: {
        algebra: { score: 45, subtopicScores: { fractions: 30, linearEquations: 60 } },
        geometry: { score: 75, subtopicScores: { angles: 80, triangles: 70 } },
        trigonometry: { score: 60, subtopicScores: { sohCahToa: 65 } }
    },
    overallScore: 60
};

const { learningPath, summary } = generateLearningPath(diagnosticResult);

// learningPath[0] will be Fractions (weakest subtopic)
// summary shows total steps, weak/moderate/strong areas, estimated sessions
```

---

## 🔄 Service Integration Flow

```
User Question/Action
        ↓
    Controller
        ↓
    ┌─────────────┐
    │  Services   │
    └─────────────┘
         ↓
    ┌──────┬──────┬──────┐
    ↓      ↓      ↓      ↓
  AI    Math   Learning  DB
Router Service  Path   Models
```

---

## 🧪 Testing Services

You can test services independently:

```javascript
// Test AI Router
import { askAITutor } from './services/aiRouter.js';
const response = await askAITutor("What is 2+2?", { topic: "Algebra" });

// Test Math Service
import { validateAnswer } from './services/mathService.js';
const result = validateAnswer("10", "10");

// Test Learning Path
import { generateLearningPath } from './services/learningPath.js';
const path = generateLearningPath(mockDiagnosticResult);
```

---

## 🔐 Security Considerations

- **API Keys:** Never commit `.env` file with real API keys
- **Input Validation:** All user inputs are validated before processing
- **Error Handling:** Services return structured error objects, never throw uncaught errors
- **Timeouts:** API calls have 10-second timeouts to prevent hanging

---

## 📊 Based On

All services implement the MathMentor AI specification:
- **AI Router:** Groq AI tutoring service (`openai/gpt-oss-120b`)
- **Math Service:** math.js-based validation engine
- **Learning Path:** Adaptive learning algorithm for personalized education
