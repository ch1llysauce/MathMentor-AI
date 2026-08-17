/**
 * Learning Path Service
 * Generates adaptive learning paths based on diagnostic results and progress
 * Based on MathMentor AI adaptive learning requirements
 */

/**
 * Topic and Subtopic Configuration
 * Subtopic names MUST match the DB lesson subtopic field ("Module N: ModuleName")
 * so the $regex lookup in progressController works correctly.
 */
const TOPICS_CONFIG = {
    Algebra: {
        subtopics: ["Module 3: Linear Equations", "Module 1: Foundations", "Module 7: Polynomials"],
        prerequisites: []
    },
    Geometry: {
        subtopics: ["Module 1: Basics", "Module 2: Triangles", "Module 5: Perimeter & Area", "Module 4: Circles"],
        prerequisites: ["Algebra"]
    },
    Trigonometry: {
        subtopics: ["Module 2: Right Triangle Trigonometry", "Module 4: Unit Circle", "Module 3: Applications"],
        prerequisites: ["Algebra", "Geometry"]
    }
};

/**
 * Maps diagnostic subtopic names (from diagnosticGenerator.js) to DB module names.
 * Used to translate DiagnosticResult.topicScores.subtopicScores keys into
 * the "Module N: Name" format stored in the Lesson collection.
 */
const DIAGNOSTIC_SUBTOPIC_TO_MODULE = {
    // Algebra (camelCase DB keys)
    'linearEquations': 'Module 3: Linear Equations',
    'fractions':       'Module 1: Foundations',
    'factoring':       'Module 7: Polynomials',
    // Geometry (camelCase DB keys)
    'angles':          'Module 1: Basics',
    'triangles':       'Module 2: Triangles',
    'area':            'Module 5: Perimeter & Area',
    'basicCircles':    'Module 4: Circles',
    // Trigonometry (camelCase DB keys)
    'sohCahToa':           'Module 2: Right Triangle Trigonometry',
    'basicTrigRatios':     'Module 4: Unit Circle',
    'simpleApplications':  'Module 3: Applications',
};

/**
 * Scoring thresholds for mastery levels
 */
const MASTERY_THRESHOLDS = {
    STRONG: 80,    // 80%+ is strong
    MODERATE: 50,  // 50-79% is moderate
    WEAK: 50       // Below 50% is weak
};

/**
 * Analyze diagnostic results and categorize topics
 */
export const analyzeDiagnosticResults = (diagnosticResult) => {
    const analysis = {
        strongTopics: [],
        moderateTopics: [],
        weakTopics: [],
        overallLevel: "Beginner",
        recommendations: []
    };

    let { topicScores, overallScore } = diagnosticResult;
    
    // Fallback for legacy diagnostic results
    if (!topicScores) {
        topicScores = {
            algebra: { score: diagnosticResult.algebraScore || 0 },
            geometry: { score: diagnosticResult.geometryScore || 0 },
            trigonometry: { score: diagnosticResult.trigonometryScore || 0 }
        };
    }

    // Analyze each topic
    if (topicScores) {
        Object.entries(topicScores).forEach(([topicKey, topicData]) => {
            const topicName = topicKey.charAt(0).toUpperCase() + topicKey.slice(1);
            const score = topicData.score || 0;

            const topicAnalysis = {
                topic: topicName,
                score: score,
                subtopics: []
            };

            // Analyze subtopics
            if (topicData.subtopicScores) {
                Object.entries(topicData.subtopicScores).forEach(([subtopicKey, subtopicScore]) => {
                    const subtopicName = formatSubtopicName(subtopicKey);
                    topicAnalysis.subtopics.push({
                        name: subtopicName,
                        score: subtopicScore
                    });
                });
            }

            // Categorize topic
            if (score >= MASTERY_THRESHOLDS.STRONG) {
                analysis.strongTopics.push(topicAnalysis);
            } else if (score >= MASTERY_THRESHOLDS.MODERATE) {
                analysis.moderateTopics.push(topicAnalysis);
            } else {
                analysis.weakTopics.push(topicAnalysis);
            }
        });
    }

    // Determine overall level
    if (overallScore >= 80) {
        analysis.overallLevel = "Advanced";
    } else if (overallScore >= 60) {
        analysis.overallLevel = "Intermediate";
    } else if (overallScore >= 40) {
        analysis.overallLevel = "Beginner-Intermediate";
    } else {
        analysis.overallLevel = "Beginner";
    }

    return analysis;
};

/**
 * Generate personalized learning path
 */
export const generateLearningPath = (diagnosticResult, userPreferences = {}) => {
    const analysis = analyzeDiagnosticResults(diagnosticResult);
    const learningPath = [];

    // Priority 1: Address weak topics first
    analysis.weakTopics.forEach((topic, index) => {
        // Find weakest subtopics within this topic
        const weakSubtopics = topic.subtopics
            .filter(st => st.score < MASTERY_THRESHOLDS.MODERATE)
            .sort((a, b) => a.score - b.score);

        weakSubtopics.forEach((subtopic, subIndex) => {
            learningPath.push({
                topic: topic.topic,
                subtopic: subtopic.name,
                priority: index + 1,
                currentScore: subtopic.score,
                targetScore: 70,
                status: "Pending",
                reason: `Low proficiency (${subtopic.score}%) - Priority focus area`,
                difficulty: "Easy",
                estimatedSessions: calculateEstimatedSessions(subtopic.score, 70)
            });
        });
    });

    // Priority 2: Improve moderate topics
    analysis.moderateTopics.forEach((topic, index) => {
        const moderateSubtopics = topic.subtopics
            .filter(st => st.score >= MASTERY_THRESHOLDS.MODERATE && st.score < MASTERY_THRESHOLDS.STRONG)
            .sort((a, b) => a.score - b.score);

        moderateSubtopics.forEach((subtopic) => {
            learningPath.push({
                topic: topic.topic,
                subtopic: subtopic.name,
                priority: analysis.weakTopics.length + index + 1,
                currentScore: subtopic.score,
                targetScore: 85,
                status: "Pending",
                reason: `Good foundation (${subtopic.score}%) - Ready to advance`,
                difficulty: "Medium",
                estimatedSessions: calculateEstimatedSessions(subtopic.score, 85)
            });
        });
    });

    // Priority 3: Master strong topics
    analysis.strongTopics.forEach((topic, index) => {
        learningPath.push({
            topic: topic.topic,
            subtopic: "Advanced Practice",
            priority: analysis.weakTopics.length + analysis.moderateTopics.length + index + 1,
            currentScore: topic.score,
            targetScore: 95,
            status: "Pending",
            reason: `Strong foundation (${topic.score}%) - Challenge yourself`,
            difficulty: "Hard",
            estimatedSessions: 3
        });
    });

    // Apply user preferences if any
    if (userPreferences.focusAreas && userPreferences.focusAreas.length > 0) {
        learningPath.sort((a, b) => {
            const aIsFocus = userPreferences.focusAreas.includes(a.topic);
            const bIsFocus = userPreferences.focusAreas.includes(b.topic);
            if (aIsFocus && !bIsFocus) return -1;
            if (!aIsFocus && bIsFocus) return 1;
            return a.priority - b.priority;
        });
    }

    return {
        learningPath,
        summary: {
            totalSteps: learningPath.length,
            weakAreasCount: analysis.weakTopics.length,
            moderateAreasCount: analysis.moderateTopics.length,
            strongAreasCount: analysis.strongTopics.length,
            overallLevel: analysis.overallLevel,
            estimatedTotalSessions: learningPath.reduce((sum, step) => sum + step.estimatedSessions, 0)
        }
    };
};

/**
 * Get next recommended topic based on current progress
 */
export const getNextRecommendation = (progressRecords, diagnosticResult) => {
    const learningPathData = generateLearningPath(diagnosticResult);
    const { learningPath } = learningPathData;

    // Find topics already completed or in progress
    const completedSubtopics = progressRecords
        .filter(p => p.masteryLevel >= 70)
        .map(p => ({ topic: p.topic, subtopic: p.subtopic }));

    // Find next pending topic not yet mastered
    const nextStep = learningPath.find(step => {
        return !completedSubtopics.some(
            completed => completed.topic === step.topic && completed.subtopic === step.subtopic
        );
    });

    return {
        nextStep: nextStep || null,
        progressPercentage: calculateProgressPercentage(progressRecords, learningPath),
        completedSteps: completedSubtopics.length,
        totalSteps: learningPath.length
    };
};

/**
 * Suggest difficulty adjustment based on recent performance
 */
export const suggestDifficultyAdjustment = (recentAccuracy, currentDifficulty) => {
    const HIGH_PERFORMANCE = 85;
    const LOW_PERFORMANCE = 50;

    if (recentAccuracy >= HIGH_PERFORMANCE && currentDifficulty !== "Hard") {
        return {
            shouldAdjust: true,
            newDifficulty: currentDifficulty === "Easy" ? "Medium" : "Hard",
            reason: `Excellent performance (${recentAccuracy}%) - Ready for more challenge`
        };
    }

    if (recentAccuracy <= LOW_PERFORMANCE && currentDifficulty !== "Easy") {
        return {
            shouldAdjust: true,
            newDifficulty: currentDifficulty === "Hard" ? "Medium" : "Easy",
            reason: `Performance below expectations (${recentAccuracy}%) - Building stronger foundation`
        };
    }

    return {
        shouldAdjust: false,
        currentDifficulty: currentDifficulty,
        reason: `Current difficulty is appropriate (${recentAccuracy}%)`
    };
};

/**
 * Calculate estimated sessions needed to reach target
 */
const calculateEstimatedSessions = (currentScore, targetScore) => {
    const gap = targetScore - currentScore;
    
    if (gap <= 10) return 2;
    if (gap <= 20) return 3;
    if (gap <= 30) return 5;
    if (gap <= 40) return 7;
    return 10;
};

/**
 * Calculate overall progress percentage
 */
const calculateProgressPercentage = (progressRecords, learningPath) => {
    if (learningPath.length === 0) return 0;
    
    const masteredCount = progressRecords.filter(p => p.masteryLevel >= 70).length;
    return Math.round((masteredCount / learningPath.length) * 100);
};

/**
 * Format subtopic name from camelCase/diagnostic key to DB module name.
 * Falls back to title-casing if no mapping exists.
 */
const formatSubtopicName = (subtopicKey) => {
    // First check direct mapping from diagnostic subtopic → DB module name
    if (DIAGNOSTIC_SUBTOPIC_TO_MODULE[subtopicKey]) {
        return DIAGNOSTIC_SUBTOPIC_TO_MODULE[subtopicKey];
    }
    // Convert camelCase to Title Case as fallback
    const titleCase = subtopicKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase())
        .trim();
    return DIAGNOSTIC_SUBTOPIC_TO_MODULE[titleCase] || titleCase;
};

/**
 * Generate study schedule based on learning path
 */
export const generateStudySchedule = (learningPath, dailyGoalMinutes = 30) => {
    const schedule = [];
    let currentDay = 1;
    
    learningPath.forEach((step, index) => {
        const sessionsPerDay = Math.ceil(dailyGoalMinutes / 20); // Assume 20 min per session
        const daysNeeded = Math.ceil(step.estimatedSessions / sessionsPerDay);
        
        schedule.push({
            day: currentDay,
            topic: step.topic,
            subtopic: step.subtopic,
            difficulty: step.difficulty,
            sessionsPlanned: step.estimatedSessions,
            daysAllocated: daysNeeded
        });
        
        currentDay += daysNeeded;
    });
    
    return {
        schedule,
        totalDays: currentDay - 1,
        dailyGoalMinutes
    };
};

export default {
    analyzeDiagnosticResults,
    generateLearningPath,
    getNextRecommendation,
    suggestDifficultyAdjustment,
    generateStudySchedule
};
