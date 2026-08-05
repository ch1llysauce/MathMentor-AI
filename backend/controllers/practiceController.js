/**
 * Practice Problem Controller
 * All general practice problems are now generated client-side (clientProblemGenerator.ts).
 * This controller only handles lesson-specific DB lookups and the categories metadata endpoint.
 */

import PracticeProblem from '../models/PracticeProblem.js';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const difficultyMap = { basic: 'Easy', intermediate: 'Medium', advanced: 'Hard' };

const normalizeProblem = (p) => ({
  id: p._id.toString(),
  topic: p.topic.toLowerCase(),
  difficulty: p.difficulty === 'Easy' ? 'basic' : p.difficulty === 'Medium' ? 'intermediate' : 'advanced',
  question: p.problem.text,
  answer: p.correctAnswer || p.options?.find(o => o.isCorrect)?.text,
  solution: p.solution?.steps?.join(' → ') || p.explanation,
  type: p.type,
  options: p.options,
  points: p.points,
  explanation: p.explanation,
  hints: p.hints,
  lessonId: p.lessonId,
});

// ─── GET /api/practice/problems ───────────────────────────────────────────────
// Only used when lessonId is provided (lesson-specific DB lookup).
// General practice is handled entirely client-side — no backend call needed.

export const getPracticeProblems = async (req, res) => {
  try {
    const { topic, category = 'mixed', count = 10, lessonId } = req.query;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'General practice problems are generated client-side. Provide a lessonId for lesson-specific problems.',
      });
    }

    const filter = { lessonId };
    if (category && category !== 'mixed') {
      filter.difficulty = difficultyMap[category.toLowerCase()];
    }

    const problems = await PracticeProblem.find(filter)
      .limit(parseInt(count))
      .select('-__v');

    if (problems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No problems found for this lesson.',
        lessonId,
      });
    }

    res.json({
      success: true,
      source: 'database',
      data: {
        topic,
        category,
        lessonId,
        count: problems.length,
        problems: problems.map(normalizeProblem),
      },
    });
  } catch (error) {
    console.error('Error in getPracticeProblems:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch practice problems', error: error.message });
  }
};

// ─── GET /api/practice/categories ─────────────────────────────────────────────

export const getCategories = (req, res) => {
  res.json({
    success: true,
    data: {
      topics: [
        { id: 'algebra',      name: 'Algebra',      categories: ['basic', 'intermediate', 'advanced', 'mixed'] },
        { id: 'geometry',     name: 'Geometry',     categories: ['basic', 'intermediate', 'advanced', 'mixed'] },
        { id: 'trigonometry', name: 'Trigonometry', categories: ['basic', 'intermediate', 'advanced', 'mixed'] },
      ],
      categoryDescriptions: {
        basic:        'Basic equations practice (5 problems)',
        intermediate: 'Intermediate problems (5 problems)',
        advanced:     'Advanced challenge set (5 problems)',
        mixed:        'Mixed review (15 problems)',
      },
      note: 'General practice problems are generated client-side. This endpoint only serves lesson-specific problems.',
    },
  });
};
