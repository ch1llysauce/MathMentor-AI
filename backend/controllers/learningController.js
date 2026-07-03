import { Session, DiagnosticResult, User, Progress } from "../models/index.js";
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

        // Find weak subtopics
        if (topicData.subtopicScores) {
            Object.entries(topicData.subtopicScores).forEach(([subtopicKey, subtopicScore]) => {
                if (subtopicScore < 50) {
                    weakTopics.push({
                        topic: topicName,
                        subtopic: formatSubtopicName(subtopicKey),
                        score: subtopicScore
                    });
                }
            });
        }
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
        .replace(/([A-Z])/g, " $1")
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
