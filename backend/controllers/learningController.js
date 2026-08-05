import { Session, DiagnosticResult, User, Progress, Lesson, PracticeProblem, UserLessonProgress, UserProblemAttempt } from "../models/index.js";
import { analyzeDiagnosticResults, generateLearningPath } from "../services/learningPath.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * @desc    Start a new learning session
 * @route   POST /api/learning/session/start
 * @access  Private
 */
export const startSession = asyncHandler(async (req, res) => {
    const { sessionType, topic, subtopic, difficulty } = req.body;

    const session = await Session.create({
        user: req.user._id,
        sessionType,
        topic,
        subtopic: subtopic || "",
        difficulty: difficulty || "Medium",
        questions: [],
        isCompleted: false
    });

    res.status(201).json({
        success: true,
        message: "Session started successfully",
        data: { session }
    });
});

/**
 * @desc    End a learning session
 * @route   PUT /api/learning/session/:sessionId/end
 * @access  Private
 */
export const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized to access this session", 403);
    }

    // Mark as completed
    session.isCompleted = true;
    session.completedAt = new Date();

    // Calculate final score if not already set
    if (session.questionsAttempted > 0 && !session.score) {
        session.score = Math.round((session.correctAnswers / session.questionsAttempted) * 100);
    }

    await session.save();

    // Update user's total study time
    const user = await User.findById(req.user._id);
    user.totalStudyTime += session.totalTimeSpent;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Session completed successfully",
        data: { session }
    });
});

/**
 * @desc    Get session by ID
 * @route   GET /api/learning/session/:sessionId
 * @access  Private
 */
export const getSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.sessionId)
        .populate("questions.questionId");

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized to access this session", 403);
    }

    res.status(200).json({
        success: true,
        data: { session }
    });
});

/**
 * @desc    Get user's session history
 * @route   GET /api/learning/sessions
 * @access  Private
 */
export const getSessionHistory = asyncHandler(async (req, res) => {
    const { sessionType, topic, limit = 20, skip = 0 } = req.query;

    const filter = { user: req.user._id, isCompleted: true };
    if (sessionType) filter.sessionType = sessionType;
    if (topic) filter.topic = topic;

    const sessions = await Session.find(filter)
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select("-questions.aiInteractions"); // Exclude detailed AI conversations for list view

    const total = await Session.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: sessions.length,
        total,
        data: { sessions }
    });
});

/**
 * @desc    Submit diagnostic test results
 * @route   POST /api/learning/diagnostic/submit
 * @access  Private
 */
export const submitDiagnosticResults = asyncHandler(async (req, res) => {
    const { topicScores, totalQuestions, correctAnswers, timeSpent } = req.body;

    if (!topicScores) {
        throw new AppError("Topic scores are required", 400);
    }

    // Calculate overall score
    const overallScore = Math.round((correctAnswers / totalQuestions) * 100);

    // Determine weak and strong topics
    const weakTopics = [];
    const strongTopics = [];

    Object.entries(topicScores).forEach(([topicKey, topicData]) => {
        const topicName = topicKey.charAt(0).toUpperCase() + topicKey.slice(1);
        
        if (topicData.score < 50) {
            weakTopics.push({
                topic: topicName,
                score: topicData.score
            });
        } else if (topicData.score >= 80) {
            strongTopics.push({
                topic: topicName,
                score: topicData.score
            });
        }

        // Find weak subtopics — skipped, we track at topic level only
        // if (topicData.subtopicScores) { ... }
    });

    // Create diagnostic result
    const diagnosticResult = await DiagnosticResult.create({
        user: req.user._id,
        topicScores,
        algebraScore: topicScores.algebra?.score || 0,
        geometryScore: topicScores.geometry?.score || 0,
        trigonometryScore: topicScores.trigonometry?.score || 0,
        weakTopics,
        strongTopics,
        totalQuestions,
        correctAnswers,
        overallScore,
        timeSpent: timeSpent || 0,
        completedAt: new Date()
    });

    // Generate recommended learning path
    const learningPathData = generateLearningPath(diagnosticResult);
    diagnosticResult.recommendedLearningPath = learningPathData.learningPath;
    await diagnosticResult.save();

    // Update user status
    const user = await User.findById(req.user._id);
    user.diagnosticCompleted = true;
    user.lastDiagnosticDate = new Date();
    await user.save();

    res.status(201).json({
        success: true,
        message: "Diagnostic results submitted successfully",
        data: {
            diagnosticResult,
            learningPath: learningPathData
        }
    });
});

/**
 * @desc    Get diagnostic results history
 * @route   GET /api/learning/diagnostic/history
 * @access  Private
 */
export const getDiagnosticHistory = asyncHandler(async (req, res) => {
    const diagnostics = await DiagnosticResult.find({ user: req.user._id })
        .sort({ completedAt: -1 })
        .select("-recommendedLearningPath"); // Exclude large learning path from list

    res.status(200).json({
        success: true,
        count: diagnostics.length,
        data: { diagnostics }
    });
});

/**
 * @desc    Get latest diagnostic result with learning path
 * @route   GET /api/learning/diagnostic/latest
 * @access  Private
 */
export const getLatestDiagnostic = asyncHandler(async (req, res) => {
    const diagnostic = await DiagnosticResult.findOne({ user: req.user._id })
        .sort({ completedAt: -1 });

    if (!diagnostic) {
        throw new AppError("No diagnostic results found", 404);
    }

    // Analyze results
    const analysis = analyzeDiagnosticResults(diagnostic);

    res.status(200).json({
        success: true,
        data: {
            diagnostic,
            analysis
        }
    });
});

/**
 * @desc    Get review questions (incorrect answers from past sessions)
 * @route   GET /api/learning/review
 * @access  Private
 */
export const getReviewQuestions = asyncHandler(async (req, res) => {
    const { topic, limit = 10 } = req.query;

    const filter = {
        user: req.user._id,
        isCompleted: true,
        "questions.isCorrect": false
    };
    if (topic) filter.topic = topic;

    const sessions = await Session.find(filter)
        .populate("questions.questionId")
        .sort({ completedAt: -1 })
        .limit(50); // Get recent sessions with mistakes

    // Extract incorrect questions
    const reviewQuestions = [];
    sessions.forEach(session => {
        session.questions.forEach(q => {
            if (!q.isCorrect && q.questionId) {
                reviewQuestions.push({
                    question: q.questionId,
                    userAnswer: q.userAnswer,
                    sessionDate: session.completedAt,
                    topic: session.topic,
                    subtopic: session.subtopic
                });
            }
        });
    });

    // Remove duplicates and limit
    const uniqueQuestions = reviewQuestions
        .filter((q, index, self) =>
            index === self.findIndex(t => t.question._id.toString() === q.question._id.toString())
        )
        .slice(0, parseInt(limit));

    res.status(200).json({
        success: true,
        count: uniqueQuestions.length,
        data: { reviewQuestions: uniqueQuestions }
    });
});

/**
 * Helper function to format subtopic names
 */
const formatSubtopicName = (subtopicKey) => {
    return subtopicKey
        .replace(/_/g, ' ')                  // snake_case → spaces
        .replace(/([A-Z])/g, ' $1')          // camelCase → spaces
        .replace(/\s+/g, ' ')                // collapse double spaces
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

export default {
    startSession,
    endSession,
    getSession,
    getSessionHistory,
    submitDiagnosticResults,
    getDiagnosticHistory,
    getLatestDiagnostic,
    getReviewQuestions
};


/**
 * @desc    Get lessons for a specific topic/subtopic
 * @route   GET /api/learning/lessons
 * @access  Private
 */
export const getLessons = asyncHandler(async (req, res) => {
    const { topic, subtopic } = req.query;
    const userId = req.user._id;

    const filter = {};
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;

    const lessons = await Lesson.find(filter).sort({ order: 1 });

    // Get user's progress for these lessons
    const lessonIds = lessons.map(l => l._id);
    const progressRecords = await UserLessonProgress.find({
        user: userId,
        lesson: { $in: lessonIds }
    });

    // Map progress to lessons
    const progressMap = {};
    progressRecords.forEach(p => {
        progressMap[p.lesson.toString()] = p;
    });

    const lessonsWithProgress = lessons.map(lesson => {
        const progress = progressMap[lesson._id.toString()];
        return {
            ...lesson.toObject(),
            userProgress: progress ? {
                status: progress.status,
                progress: progress.progress,
                timeSpent: progress.timeSpent,
                completedAt: progress.completedAt
            } : {
                status: 'not-started',
                progress: 0,
                timeSpent: 0
            }
        };
    });

    // Fetch actual problem counts for all lessons
    const problemCounts = await PracticeProblem.aggregate([
        { $match: { lessonId: { $in: lessonIds } } },
        { $group: { _id: '$lessonId', count: { $sum: 1 } } }
    ]);
    const problemCountMap = {};
    problemCounts.forEach(pc => {
        problemCountMap[pc._id.toString()] = pc.count;
    });

    const lessonsWithCounts = lessonsWithProgress.map(lesson => ({
        ...lesson,
        problemCount: problemCountMap[lesson._id.toString()] || 0
    }));

    res.status(200).json({
        success: true,
        count: lessonsWithCounts.length,
        data: { lessons: lessonsWithCounts }
    });
});

/**
 * @desc    Get a single lesson by ID
 * @route   GET /api/learning/lessons/:lessonId
 * @access  Private
 */
export const getLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId).populate('prerequisites');

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Get user's progress for this lesson
    let progress = await UserLessonProgress.findOne({
        user: userId,
        lesson: lessonId
    });

    // Create progress record if it doesn't exist
    if (!progress) {
        progress = await UserLessonProgress.create({
            user: userId,
            lesson: lessonId,
            status: 'in-progress'
        });
    } else {
        // Update last accessed time
        progress.lastAccessedAt = new Date();
        await progress.save();
    }

    res.status(200).json({
        success: true,
        data: {
            lesson,
            progress: {
                status: progress.status,
                progress: progress.progress,
                timeSpent: progress.timeSpent,
                completedAt: progress.completedAt
            }
        }
    });
});

/**
 * @desc    Mark lesson as completed
 * @route   PUT /api/learning/lessons/:lessonId/complete
 * @access  Private
 */
export const completeLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Update or create progress record
    let progress = await UserLessonProgress.findOne({
        user: userId,
        lesson: lessonId
    });

    if (!progress) {
        progress = new UserLessonProgress({
            user: userId,
            lesson: lessonId
        });
    }

    const wasCompleted = progress.status === 'completed';

    progress.status = 'completed';
    progress.progress = 100;
    progress.timeSpent += timeSpent || 0;
    progress.completedAt = new Date();
    await progress.save();

    // Update overall topic progress
    const topicProgress = await Progress.findOne({
        user: userId,
        topic: lesson.topic
    });

    if (topicProgress && !wasCompleted) {
        topicProgress.lessonsCompleted += 1;
        topicProgress.totalStudyTime += timeSpent || 0;
        topicProgress.lastStudied = new Date();
        await topicProgress.save();
    }

    res.status(200).json({
        success: true,
        message: 'Lesson marked as completed',
        data: { progress }
    });
});

/**
 * @desc    Mark lesson as incomplete
 * @route   PUT /api/learning/lessons/:lessonId/incomplete
 * @access  Private
 */
export const markLessonIncomplete = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    // Find progress record
    const progress = await UserLessonProgress.findOne({
        user: userId,
        lesson: lessonId
    });

    if (!progress) {
        throw new AppError("No progress record found for this lesson", 404);
    }

    const wasCompleted = progress.status === 'completed';

    progress.status = 'in-progress';
    progress.progress = 50; // Set to in-progress state
    progress.completedAt = null;
    await progress.save();

    // Update overall topic progress
    if (wasCompleted) {
        const topicProgress = await Progress.findOne({
            user: userId,
            topic: lesson.topic
        });

        if (topicProgress && topicProgress.lessonsCompleted > 0) {
            topicProgress.lessonsCompleted -= 1;
            topicProgress.lastStudied = new Date();
            await topicProgress.save();
        }
    }

    res.status(200).json({
        success: true,
        message: 'Lesson marked as incomplete',
        data: { progress }
    });
});

/**
 * @desc    Get practice problems
 * @route   GET /api/learning/practice
 * @access  Private
 */
export const getPracticeProblems = asyncHandler(async (req, res) => {
    const { topic, subtopic, difficulty, lessonId, limit = 10 } = req.query;
    const userId = req.user._id;

    const filter = {};
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    if (difficulty) filter.difficulty = difficulty;
    if (lessonId) filter.lessonId = lessonId;

    const problems = await PracticeProblem.find(filter)
        .limit(parseInt(limit))
        .select('-correctAnswer -options.isCorrect'); // Don't send correct answers

    // Get user's previous attempts
    const problemIds = problems.map(p => p._id);
    const attempts = await UserProblemAttempt.find({
        user: userId,
        problem: { $in: problemIds }
    });

    const attemptsMap = {};
    attempts.forEach(a => {
        if (!attemptsMap[a.problem.toString()]) {
            attemptsMap[a.problem.toString()] = [];
        }
        attemptsMap[a.problem.toString()].push(a);
    });

    const problemsWithAttempts = problems.map(problem => ({
        ...problem.toObject(),
        previousAttempts: attemptsMap[problem._id.toString()] || []
    }));

    res.status(200).json({
        success: true,
        count: problemsWithAttempts.length,
        data: { problems: problemsWithAttempts }
    });
});

/**
 * @desc    Submit practice problem answer
 * @route   POST /api/learning/practice/:problemId/submit
 * @access  Private
 */
export const submitPracticeAnswer = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { userAnswer, timeSpent, hintsUsed } = req.body;
    const userId = req.user._id;

    const problem = await PracticeProblem.findById(problemId);
    if (!problem) {
        throw new AppError("Problem not found", 404);
    }

    // Check if answer is correct
    let isCorrect = false;
    if (problem.type === 'multiple-choice') {
        console.log('🔍 Checking answer:');
        console.log('  User answer:', userAnswer);
        console.log('  Options:', JSON.stringify(problem.options, null, 2));
        
        const selectedOption = problem.options.find(opt => opt.text === userAnswer);
        console.log('  Selected option:', selectedOption);
        
        isCorrect = selectedOption ? selectedOption.isCorrect : false;
        console.log('  Is correct:', isCorrect);
    } else if (problem.type === 'free-response') {
        // Simple string comparison for now (can be enhanced with AI grading)
        isCorrect = userAnswer.trim().toLowerCase() === problem.correctAnswer.trim().toLowerCase();
    }

    // Calculate points (reduce points for hints used)
    let pointsEarned = 0;
    if (isCorrect) {
        pointsEarned = problem.points - (hintsUsed * 2);
        pointsEarned = Math.max(pointsEarned, problem.points * 0.5); // At least 50% points
    }

    // Get attempt number
    const previousAttempts = await UserProblemAttempt.countDocuments({
        user: userId,
        problem: problemId
    });

    // Create attempt record
    const attempt = await UserProblemAttempt.create({
        user: userId,
        problem: problemId,
        userAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
        hintsUsed: hintsUsed || 0,
        pointsEarned,
        attemptNumber: previousAttempts + 1
    });

    // Update topic progress
    const topicProgress = await Progress.findOne({
        user: userId,
        topic: problem.topic
    });

    if (topicProgress) {
        topicProgress.questionsAnswered += 1;
        if (isCorrect) {
            topicProgress.correctAnswers += 1;
        }
        topicProgress.accuracy = Math.round(
            (topicProgress.correctAnswers / topicProgress.questionsAnswered) * 100
        );
        topicProgress.lastStudied = new Date();
        await topicProgress.save();
    }

    res.status(200).json({
        success: true,
        data: {
            attempt,
            isCorrect,
            pointsEarned,
            explanation: problem.explanation,
            solution: isCorrect ? null : problem.solution // Only show solution if incorrect
        }
    });
});
