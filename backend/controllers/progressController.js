import { Progress, User, DiagnosticResult, Session, UserProblemAttempt, Lesson, UserLessonProgress } from "../models/index.js";
import { generateLearningPath, getNextRecommendation, suggestDifficultyAdjustment } from "../services/learningPath.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * @desc    Get user's progress for all topics
 * @route   GET /api/progress
 * @access  Private
 */
export const getAllProgress = asyncHandler(async (req, res) => {
    const progress = await Progress.find({ user: req.user._id })
        .sort({ topic: 1, subtopic: 1 });

    res.status(200).json({
        success: true,
        count: progress.length,
        data: { progress }
    });
});

/**
 * @desc    Get progress for a specific topic
 * @route   GET /api/progress/:topic
 * @access  Private
 */
export const getTopicProgress = asyncHandler(async (req, res) => {
    const { topic } = req.params;

    const progress = await Progress.find({
        user: req.user._id,
        topic: topic
    }).sort({ subtopic: 1 });

    if (progress.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No progress found for this topic",
            data: { progress: [] }
        });
    }

    // Calculate overall topic statistics
    const totalQuestions = progress.reduce((sum, p) => sum + p.questionsAnswered, 0);
    const totalCorrect = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const averageMastery = Math.round(
        progress.reduce((sum, p) => sum + p.masteryLevel, 0) / progress.length
    );

    res.status(200).json({
        success: true,
        data: {
            topic,
            progress,
            summary: {
                subtopicCount: progress.length,
                totalQuestions,
                totalCorrect,
                overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
                averageMastery
            }
        }
    });
});

/**
 * @desc    Get progress statistics/summary
 * @route   GET /api/progress/stats/summary
 * @access  Private
 */
export const getProgressSummary = asyncHandler(async (req, res) => {
    const progress = await Progress.find({ user: req.user._id });
    const user = await User.findById(req.user._id);

    // Aggregate average response time from user problem attempts
    const attemptAgg = await UserProblemAttempt.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: null,
                avgResponseTime: { $avg: "$timeSpent" },
                totalAttempts: { $sum: 1 }
            }
        }
    ]);

    const averageResponseTime = attemptAgg.length > 0 && attemptAgg[0].totalAttempts > 0
        ? Math.round(attemptAgg[0].avgResponseTime)
        : 0;

    // Group by topic
    const topicStats = {};
    progress.forEach(p => {
        if (!topicStats[p.topic]) {
            topicStats[p.topic] = {
                topic: p.topic,
                totalQuestions: 0,
                correctAnswers: 0,
                averageMastery: 0,
                subtopics: []
            };
        }
        
        topicStats[p.topic].totalQuestions += p.questionsAnswered;
        topicStats[p.topic].correctAnswers += p.correctAnswers;
        topicStats[p.topic].subtopics.push({
            name: p.subtopic,
            mastery: p.masteryLevel,
            accuracy: p.accuracy
        });
    });

    // Calculate averages
    Object.values(topicStats).forEach(stat => {
        stat.averageMastery = Math.round(
            stat.subtopics.reduce((sum, s) => sum + s.mastery, 0) / stat.subtopics.length
        );
        stat.accuracy = stat.totalQuestions > 0
            ? Math.round((stat.correctAnswers / stat.totalQuestions) * 100)
            : 0;
    });

    res.status(200).json({
        success: true,
        data: {
            user: {
                displayName: user.displayName,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                totalStudyTime: user.totalStudyTime
            },
            topicStats: Object.values(topicStats),
            overallProgress: {
                totalTopics: Object.keys(topicStats).length,
                totalSubtopics: progress.length,
                totalQuestions: progress.reduce((sum, p) => sum + p.questionsAnswered, 0),
                totalCorrect: progress.reduce((sum, p) => sum + p.correctAnswers, 0),
                averageResponseTime
            }
        }
    });
});

/**
 * @desc    Get learning path based on diagnostic results
 * @route   GET /api/progress/learning-path
 * @access  Private
 */
export const getLearningPath = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    // Get most recent diagnostic result
    const diagnosticResult = await DiagnosticResult.findOne({ user: req.user._id })
        .sort({ createdAt: -1 });

    if (!diagnosticResult) {
        throw new AppError("No diagnostic results found. Please complete the diagnostic test first.", 404);
    }

    // Generate learning path
    const learningPathData = generateLearningPath(diagnosticResult, {
        focusAreas: user.focusAreas,
        difficulty: user.learningPreferences?.difficulty
    });

    res.status(200).json({
        success: true,
        data: learningPathData
    });
});

/**
 * @desc    Get next recommended topic to study
 * @route   GET /api/progress/next-recommendation
 * @access  Private
 */
export const getNextTopic = asyncHandler(async (req, res) => {
    const [progress, diagnosticResult, totalLessons, completedLessons] = await Promise.all([
        Progress.find({ user: req.user._id }),
        DiagnosticResult.findOne({ user: req.user._id }).sort({ createdAt: -1 }),
        Lesson.countDocuments(),
        UserLessonProgress.countDocuments({
            user: req.user._id,
            status: 'completed'
        })
    ]);

    const progressPercentage = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // If no diagnostic yet, return lesson progress without a recommendation
    if (!diagnosticResult) {
        return res.status(200).json({
            success: true,
            data: {
                nextStep: null,
                progressPercentage,
                completedLessons,
                totalLessons
            }
        });
    }

    const recommendation = getNextRecommendation(progress, diagnosticResult);

    // Replace nextStep.currentScore with real lesson-completion-based progress
    // so the dashboard card shows actual progress instead of the frozen diagnostic score
    if (recommendation.nextStep) {
        const { topic, subtopic } = recommendation.nextStep;

        // Count lessons in this subtopic
        const subtopicLessons = await Lesson.find({ topic, subtopic }).select('_id');
        const subtopicLessonIds = subtopicLessons.map(l => l._id);

        const subtopicCompletedCount = subtopicLessonIds.length > 0
            ? await UserLessonProgress.countDocuments({
                user: req.user._id,
                lesson: { $in: subtopicLessonIds },
                status: 'completed'
            })
            : 0;

        const lessonBasedScore = subtopicLessonIds.length > 0
            ? Math.round((subtopicCompletedCount / subtopicLessonIds.length) * 100)
            : 0;

        // Use lesson-based score; fall back to diagnostic score only if no lessons exist
        recommendation.nextStep = {
            ...recommendation.nextStep,
            currentScore: lessonBasedScore,
            completedLessons: subtopicCompletedCount,
            totalLessonsInSubtopic: subtopicLessonIds.length,
            reason: subtopicCompletedCount > 0
                ? `${subtopicCompletedCount} of ${subtopicLessonIds.length} lessons completed`
                : recommendation.nextStep.reason
        };
    }

    res.status(200).json({
        success: true,
        data: {
            ...recommendation,
            progressPercentage,
            completedLessons,
            totalLessons
        }
    });
});

/**
 * @desc    Get difficulty adjustment suggestion
 * @route   GET /api/progress/difficulty-suggestion/:topic
 * @access  Private
 */
export const getDifficultySuggestion = asyncHandler(async (req, res) => {
    const { topic } = req.params;

    // Get recent progress for this topic
    const recentSessions = await Session.find({
        user: req.user._id,
        topic: topic,
        isCompleted: true
    })
        .sort({ completedAt: -1 })
        .limit(5);

    if (recentSessions.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                shouldAdjust: false,
                message: "Not enough data to suggest difficulty adjustment"
            }
        });
    }

    // Calculate recent accuracy
    const totalCorrect = recentSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalQuestions = recentSessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
    const recentAccuracy = Math.round((totalCorrect / totalQuestions) * 100);

    // Get current difficulty from most recent session
    const currentDifficulty = recentSessions[0].difficulty || "Medium";

    const suggestion = suggestDifficultyAdjustment(recentAccuracy, currentDifficulty);

    res.status(200).json({
        success: true,
        data: {
            ...suggestion,
            recentAccuracy,
            sessionsAnalyzed: recentSessions.length
        }
    });
});

/**
 * @desc    Update streak (called daily)
 * @route   POST /api/progress/update-streak
 * @access  Private
 */
export const updateStreak = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    // Calculate days difference
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Same day, no change
        return res.status(200).json({
            success: true,
            message: "Already logged activity today",
            data: { currentStreak: user.currentStreak }
        });
    } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }
    } else {
        // Streak broken
        user.currentStreak = 1;
    }

    user.lastActiveDate = now;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Streak updated",
        data: {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak
        }
    });
});

/**
 * @desc    Get weak areas for focused practice
 * @route   GET /api/progress/weak-areas
 * @access  Private
 */
export const getWeakAreas = asyncHandler(async (req, res) => {
    const progress = await Progress.find({
        user: req.user._id,
        masteryLevel: { $lt: 50 }
    })
        .sort({ masteryLevel: 1 })
        .limit(10);

    res.status(200).json({
        success: true,
        count: progress.length,
        data: {
            weakAreas: progress.map(p => ({
                topic: p.topic,
                subtopic: p.subtopic,
                masteryLevel: p.masteryLevel,
                accuracy: p.accuracy,
                questionsAnswered: p.questionsAnswered
            }))
        }
    });
});

export default {
    getAllProgress,
    getTopicProgress,
    getProgressSummary,
    getLearningPath,
    getNextTopic,
    getDifficultySuggestion,
    updateStreak,
    getWeakAreas
};
