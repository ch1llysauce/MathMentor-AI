// AI Prompt Builder for generating practice questions
// Follows the structured curriculum approach to keep LLM constrained

/**
 * Builds a constrained prompt for AI question generation
 * @param {Object} params - Parameters for prompt generation
 * @param {string} params.subject - Subject (Algebra, Geometry, Trigonometry)
 * @param {string} params.moduleName - Module name
 * @param {string} params.lessonTitle - Specific lesson title
 * @param {string} params.difficulty - Easy, Medium, or Hard
 * @param {Array<string>} params.learningObjectives - Specific learning objectives to assess
 * @param {number} params.questionCount - Number of questions to generate (default: 10)
 * @param {Array<string>} params.excludedTopics - Topics to explicitly exclude
 * @returns {string} - Formatted prompt for AI
 */
export function buildQuestionGenerationPrompt({
  subject,
  moduleName,
  lessonTitle,
  difficulty,
  learningObjectives,
  questionCount = 10,
  excludedTopics = []
}) {
  const excludeClause = excludedTopics.length > 0
    ? `\n\nDo NOT include questions about: ${excludedTopics.join(', ')}.`
    : '';

  const prompt = `Generate ${questionCount} ${difficulty}-difficulty practice questions for:

**Subject:** ${subject}
**Module:** ${moduleName}
**Lesson:** ${lessonTitle}

**Learning Objectives to Assess:**
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

**Instructions:**
- Focus ONLY on the listed learning objectives
- Each question must assess one or more of these objectives
- Do not include concepts from other lessons${excludeClause}
- Difficulty level: ${difficulty}
- Questions should be appropriate for ${difficulty.toLowerCase()}-level understanding

**Output Format (JSON):**
Return an array of question objects with this structure:
\`\`\`json
[
  {
    "problem": {
      "text": "Solve for x: 2x + 3 = 11",
      "latex": null
    },
    "options": [
      { "text": "x = 4", "isCorrect": true },
      { "text": "x = 7", "isCorrect": false },
      { "text": "x = 3", "isCorrect": false },
      { "text": "x = 5", "isCorrect": false }
    ],
    "explanation": "Subtract 3 from both sides: 2x = 8, then divide by 2: x = 4",
    "solution": {
      "steps": ["2x + 3 = 11", "2x = 8", "x = 4"],
      "finalAnswer": "x = 4"
    },
    "hints": ["What undoes addition?", "Divide by the coefficient"],
    "learningObjective": "Solve one-step linear equations"
  }
]
\`\`\`

Generate the questions now.`;

  return prompt;
}

/**
 * Builds a prompt for AI tutoring/explanation
 * @param {Object} params - Parameters for tutoring
 * @param {string} params.subject - Subject
 * @param {string} params.moduleName - Module name
 * @param {string} params.lessonTitle - Lesson title
 * @param {string} params.studentQuestion - The student's question
 * @param {Array<string>} params.learningObjectives - Context learning objectives
 * @returns {string} - Formatted prompt for AI tutor
 */
export function buildTutoringPrompt({
  subject,
  moduleName,
  lessonTitle,
  studentQuestion,
  learningObjectives
}) {
  const prompt = `You are a math tutor helping a student with ${subject}.

**Current Lesson Context:**
- Module: ${moduleName}
- Lesson: ${lessonTitle}
- Learning Objectives: ${learningObjectives.join('; ')}

**Student's Question:**
${studentQuestion}

**Instructions:**
- Answer the student's question clearly and concisely
- Stay within the scope of the current lesson
- Use examples if helpful
- Break down complex steps
- Encourage the student to think through the problem
- Do not just give the answer - guide them to understanding

Provide your tutoring response now.`;

  return prompt;
}

/**
 * Builds a prompt for diagnostic question generation
 * @param {Object} params - Parameters for diagnostic
 * @param {string} params.subject - Subject
 * @param {Array<string>} params.topics - List of topics to diagnose
 * @param {number} params.questionsPerTopic - Questions per topic
 * @returns {string} - Formatted prompt for diagnostic
 */
export function buildDiagnosticPrompt({
  subject,
  topics,
  questionsPerTopic = 3
}) {
  const prompt = `Generate diagnostic questions for ${subject} placement test.

**Topics to Assess:**
${topics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

**Requirements:**
- Generate ${questionsPerTopic} questions per topic
- Mix of difficulty levels (1 easy, 1 medium, 1 hard per topic)
- Questions should reveal student's understanding level
- Cover fundamental concepts of each topic

**Output Format (JSON):**
Return an array of question objects:
\`\`\`json
[
  {
    "topic": "${subject}",
    "subtopic": "Specific topic name",
    "difficulty": "Easy|Medium|Hard",
    "problem": {
      "text": "Find the hypotenuse of a right triangle with legs 3 and 4",
      "latex": null
    },
    "options": [
      { "text": "5", "isCorrect": true },
      { "text": "7", "isCorrect": false },
      { "text": "25", "isCorrect": false },
      { "text": "12", "isCorrect": false }
    ],
    "explanation": "Using the Pythagorean theorem: 3² + 4² = 9 + 16 = 25, so c = √25 = 5",
    "solution": {
      "steps": ["a² + b² = c²", "9 + 16 = 25", "c = 5"],
      "finalAnswer": "5"
    }
  }
]
\`\`\`

Generate the diagnostic questions now.`;

  return prompt;
}

/**
 * Validates AI-generated question format
 * @param {Object} question - Question object to validate
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validateQuestionFormat(question) {
  const errors = [];

  if (!question.problem || !question.problem.text) {
    errors.push('Missing problem text');
  }

  if (!question.options || question.options.length !== 4) {
    errors.push('Must have exactly 4 options');
  }

  const correctCount = question.options?.filter(o => o.isCorrect).length;
  if (correctCount !== 1) {
    errors.push(`Must have exactly 1 correct answer (found ${correctCount})`);
  }

  if (!question.explanation) {
    errors.push('Missing explanation');
  }

  if (!question.solution || !question.solution.steps || !question.solution.finalAnswer) {
    errors.push('Invalid solution format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Parses AI response and validates questions
 * @param {string} aiResponse - Raw AI response
 * @returns {Object} - { questions: Array, errors: Array }
 */
export function parseAndValidateQuestions(aiResponse) {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                      aiResponse.match(/```\s*([\s\S]*?)\s*```/);
    
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
    const questions = JSON.parse(jsonString);

    if (!Array.isArray(questions)) {
      return { questions: [], errors: ['Response is not an array'] };
    }

    const validatedQuestions = [];
    const errors = [];

    questions.forEach((q, index) => {
      const validation = validateQuestionFormat(q);
      if (validation.valid) {
        validatedQuestions.push(q);
      } else {
        errors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return { questions: validatedQuestions, errors };
  } catch (error) {
    return { questions: [], errors: [`Parse error: ${error.message}`] };
  }
}

export default {
  buildQuestionGenerationPrompt,
  buildTutoringPrompt,
  buildDiagnosticPrompt,
  validateQuestionFormat,
  parseAndValidateQuestions
};
