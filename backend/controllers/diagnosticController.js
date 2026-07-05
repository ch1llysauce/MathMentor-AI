import { DiagnosticResult, Progress, User } from "../models/index.js";
import { analyzeDiagnosticResults, generateLearningPath } from "../services/learningPath.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * @desc    Get comprehensive diagnostic dashboard data
 * @route   GET /api/diagnostic/dashboard
 * @access  Private
 */
export const getDiagnosticDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get latest diagnostic
    const latestDiagnostic = await DiagnosticResult.findOne({ user: userId })
        .sort({ completedAt: -1 });

    if (!latestDiagnostic) {
        return res.status(404).json({
            success: false,
            message: "No diagnostic results found. Please complete a diagnostic test first."
        });
    }

    // Get diagnostic history for timeline
    const diagnosticHistory = await DiagnosticResult.find({ user: userId })
        .sort({ completedAt: -1 })
        .limit(10)
        .select('overallScore completedAt algebraScore geometryScore trigonometryScore');

    // Get progress data
    const progressData = await Progress.find({ user: userId });

    // Analyze latest diagnostic
    const analysis = analyzeDiagnosticResults(latestDiagnostic);

    // Calculate trends
    const trends = calculateTrends(diagnosticHistory);

    res.status(200).json({
        success: true,
        data: {
            diagnostic: latestDiagnostic,
            analysis,
            history: diagnosticHistory,
            progress: progressData,
            trends
        }
    });
});

/**
 * @desc    Get diagnostic timeline data
 * @route   GET /api/diagnostic/timeline
 * @access  Private
 */
export const getDiagnosticTimeline = asyncHandler(async (req, res) => {
    const { period = 'week' } = req.query;
    const userId = req.user._id;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case '6months':
            startDate.setMonth(now.getMonth() - 6);
            break;
        default:
            startDate.setDate(now.getDate() - 7);
    }

    // Get diagnostics within period
    const diagnostics = await DiagnosticResult.find({
        user: userId,
        completedAt: { $gte: startDate }
    })
    .sort({ completedAt: 1 })
    .select('overallScore algebraScore geometryScore trigonometryScore completedAt');

    // Format timeline data
    const timeline = diagnostics.map(d => ({
        date: d.completedAt,
        overallScore: d.overallScore,
        algebra: d.algebraScore,
        geometry: d.geometryScore,
        trigonometry: d.trigonometryScore
    }));

    res.status(200).json({
        success: true,
        count: timeline.length,
        data: { timeline }
    });
});

/**
 * @desc    Get weak areas with detailed breakdown
 * @route   GET /api/diagnostic/weak-areas
 * @access  Private
 */
export const getWeakAreas = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const latestDiagnostic = await DiagnosticResult.findOne({ user: userId })
        .sort({ completedAt: -1 });

    if (!latestDiagnostic) {
        throw new AppError("No diagnostic results found", 404);
    }

    // Get weak areas with more context
    const weakAreas = latestDiagnostic.weakTopics.map(weak => {
        // Find related progress data
        const progressMatch = Progress.findOne({
            user: userId,
            topic: weak.topic,
            subtopic: weak.subtopic
        });

        return {
            ...weak.toObject(),
            needsPractice: weak.score < 40,
            priority: weak.score < 30 ? 'high' : weak.score < 50 ? 'medium' : 'low',
            estimatedStudyTime: calculateEstimatedStudyTime(weak.score)
        };
    });

    // Sort by priority
    weakAreas.sort((a, b) => a.score - b.score);

    res.status(200).json({
        success: true,
        count: weakAreas.length,
        data: { weakAreas }
    });
});

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/diagnostic/recommendations
 * @access  Private
 */
export const getRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const latestDiagnostic = await DiagnosticResult.findOne({ user: userId })
        .sort({ completedAt: -1 });

    if (!latestDiagnostic) {
        throw new AppError("No diagnostic results found", 404);
    }

    const user = await User.findById(userId);
    const progressData = await Progress.find({ user: userId });

    // Generate learning path
    const learningPathData = generateLearningPath(latestDiagnostic, {
        focusAreas: user.focusAreas,
        difficulty: user.learningPreferences?.difficulty
    });

    // Create actionable recommendations
    const recommendations = createActionableRecommendations(
        latestDiagnostic,
        progressData,
        learningPathData
    );

    res.status(200).json({
        success: true,
        data: {
            recommendations,
            learningPath: learningPathData
        }
    });
});

/**
 * @desc    Compare diagnostic results over time
 * @route   GET /api/diagnostic/compare
 * @access  Private
 */
export const compareDiagnostics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const diagnostics = await DiagnosticResult.find({ user: userId })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit))
        .select('overallScore algebraScore geometryScore trigonometryScore completedAt weakTopics strongTopics');

    if (diagnostics.length < 2) {
        return res.status(200).json({
            success: true,
            message: "Need at least 2 diagnostic results for comparison",
            data: { diagnostics }
        });
    }

    // Calculate improvements
    const latest = diagnostics[0];
    const previous = diagnostics[1];

    const comparison = {
        overall: {
            current: latest.overallScore,
            previous: previous.overallScore,
            change: latest.overallScore - previous.overallScore,
            percentChange: ((latest.overallScore - previous.overallScore) / previous.overallScore * 100).toFixed(1)
        },
        algebra: {
            current: latest.algebraScore,
            previous: previous.algebraScore,
            change: latest.algebraScore - previous.algebraScore
        },
        geometry: {
            current: latest.geometryScore,
            previous: previous.geometryScore,
            change: latest.geometryScore - previous.geometryScore
        },
        trigonometry: {
            current: latest.trigonometryScore,
            previous: previous.trigonometryScore,
            change: latest.trigonometryScore - previous.trigonometryScore
        },
        weakTopicsResolved: previous.weakTopics.filter(prevWeak =>
            !latest.weakTopics.some(currWeak =>
                currWeak.topic === prevWeak.topic &&
                currWeak.subtopic === prevWeak.subtopic
            )
        ).length,
        newStrongTopics: latest.strongTopics.filter(currStrong =>
            !previous.strongTopics.some(prevStrong =>
                prevStrong.topic === currStrong.topic &&
                prevStrong.subtopic === currStrong.subtopic
            )
        ).length
    };

    res.status(200).json({
        success: true,
        data: {
            comparison,
            diagnostics
        }
    });
});

/**
 * Helper Functions
 */

function calculateTrends(diagnosticHistory) {
    if (diagnosticHistory.length < 2) {
        return {
            trend: 'insufficient_data',
            message: 'Need more diagnostic results to calculate trends'
        };
    }

    const latest = diagnosticHistory[0];
    const oldest = diagnosticHistory[diagnosticHistory.length - 1];

    const overallTrend = latest.overallScore - oldest.overallScore;
    const algebraTrend = latest.algebraScore - oldest.algebraScore;
    const geometryTrend = latest.geometryScore - oldest.geometryScore;
    const trigonometryTrend = latest.trigonometryScore - oldest.trigonometryScore;

    return {
        trend: overallTrend > 5 ? 'improving' : overallTrend < -5 ? 'declining' : 'stable',
        overallChange: overallTrend,
        topicTrends: {
            algebra: { change: algebraTrend, status: getTrendStatus(algebraTrend) },
            geometry: { change: geometryTrend, status: getTrendStatus(geometryTrend) },
            trigonometry: { change: trigonometryTrend, status: getTrendStatus(trigonometryTrend) }
        },
        dataPoints: diagnosticHistory.length
    };
}

function getTrendStatus(change) {
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
}

function calculateEstimatedStudyTime(score) {
    // Estimate hours needed based on score
    if (score < 30) return '10-15 hours';
    if (score < 50) return '5-8 hours';
    if (score < 70) return '2-4 hours';
    return '1-2 hours';
}

function createActionableRecommendations(diagnostic, progressData, learningPathData) {
    const recommendations = [];

    // Priority 1: Address critical weak areas
    const criticalWeaknesses = diagnostic.weakTopics.filter(w => w.score < 30);
    if (criticalWeaknesses.length > 0) {
        recommendations.push({
            priority: 'high',
            type: 'critical_weakness',
            title: 'Address Critical Weaknesses',
            description: `Focus on ${criticalWeaknesses[0].subtopic || criticalWeaknesses[0].topic} to build foundational skills`,
            topic: criticalWeaknesses[0].topic,
            subtopic: criticalWeaknesses[0].subtopic,
            estimatedTime: calculateEstimatedStudyTime(criticalWeaknesses[0].score),
            action: 'practice'
        });
    }

    // Priority 2: Maintain strong areas
    if (diagnostic.strongTopics.length > 0) {
        const strongest = diagnostic.strongTopics.reduce((max, topic) =>
            topic.score > max.score ? topic : max
        );
        recommendations.push({
            priority: 'medium',
            type: 'maintain_strength',
            title: 'Maintain Your Strength',
            description: `Keep practicing ${strongest.subtopic || strongest.topic} to maintain mastery`,
            topic: strongest.topic,
            subtopic: strongest.subtopic,
            estimatedTime: '30 minutes per week',
            action: 'review'
        });
    }

    // Priority 3: Follow learning path
    if (learningPathData.learningPath.length > 0) {
        const nextInPath = learningPathData.learningPath[0];
        recommendations.push({
            priority: 'medium',
            type: 'learning_path',
            title: 'Continue Your Learning Path',
            description: nextInPath.reason,
            topic: nextInPath.topic,
            subtopic: nextInPath.subtopic,
            estimatedTime: '3-5 hours',
            action: 'learn'
        });
    }

    return recommendations;
}

export default {
    getDiagnosticDashboard,
    getDiagnosticTimeline,
    getWeakAreas,
    getRecommendations,
    compareDiagnostics
};
