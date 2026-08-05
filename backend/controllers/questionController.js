import { Question, Session, Progress } from "../models/index.js";
import { validateAnswer } from "../services/mathService.js";
import { AppError, asyncHandler } from "../middleware/index.js";
import { generateDiagnosticQuestions } from "../services/diagnosticGenerator.js";

/**
 * @desc    Get questions (with filters)
 * @route   GET /api/questions
 * @access  Private
 */
export const getQuestions = asyncHandler(async (req, res) => {
    const { topic, subtopic, difficulty, isDiagnostic, limit = 10 } = req.query;

    const filter = {};
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    if (difficulty) filter.difficulty = difficulty;
    if (isDiagnostic !== undefined) filter.isDiagnostic = isDiagnostic === "true";

    const questions = await Question.find(filter)
        .limit(parseInt(limit))
        .select("-__v");

    res.status(200).json({
        success: true,
        count: questions.length,
        data: { questions }
    });
});

/**
 * @desc    Get random questions for practice
 * @route   GET /api/questions/random
 * @access  Private
 */
export const getRandomQuestions = asyncHandler(async (req, res) => {
    const { topic, difficulty, count = 5 } = req.query;

    const filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    filter.isDiagnostic = false; // Only practice questions

    const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(count) } }
    ]);

    res.status(200).json({
        success: true,
        count: questions.length,
        data: { questions }
    });
});

/**
 * @desc    Get diagnostic questions
 * @route   GET /api/questions/diagnostic
 * @access  Private
 */
/**
 * @desc    Get diagnostic questions — freshly generated with random numbers
 * @route   GET /api/questions/diagnostic
 * @access  Private
 */
export const getDiagnosticQuestions = asyncHandler(async (req, res) => {
    // Generate 9 fresh questions (1 per topic/difficulty bucket), no DB query needed
    const questions = generateDiagnosticQuestions();

    res.status(200).json({
        success: true,
        count: questions.length,
        data: { questions }
    });
});

/**
 * @desc    Get a single question by ID
 * @route   GET /api/questions/:id
 * @access  Private
 */
export const getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (!question) {
        throw new AppError("Question not found", 404);
    }

    res.status(200).json({
        success: true,
        data: { question }
    });
});

/**
 * @desc    Submit answer to a question
 * @route   POST /api/questions/submit
 * @access  Private
 */
export const submitAnswer = asyncHandler(async (req, res) => {
    const { questionId, userAnswer, sessionId, timeSpent } = req.body;

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
        throw new AppError("Question not found", 404);
    }

    // Validate answer
    const validation = validateAnswer(userAnswer, question.correctAnswer, {
        caseSensitive: false,
        allowMultipleForms: true
    });

    // Update question usage statistics
    question.usageCount += 1;
    const newTotalAccuracy = question.averageAccuracy * (question.usageCount - 1);
    question.averageAccuracy = (newTotalAccuracy + (validation.isCorrect ? 100 : 0)) / question.usageCount;
    await question.save();

    // Update session if provided
    if (sessionId) {
        const session = await Session.findById(sessionId);
        if (session && session.user.toString() === req.user._id.toString()) {
            session.questions.push({
                questionId: question._id,
                userAnswer,
                isCorrect: validation.isCorrect,
                timeSpent: timeSpent || 0,
                hintsUsed: 0
            });

            session.questionsAttempted += 1;
            if (validation.isCorrect) {
                session.correctAnswers += 1;
            }
            session.totalTimeSpent += timeSpent || 0;
            session.score = Math.round((session.correctAnswers / session.questionsAttempted) * 100);

            await session.save();
        }
    }

    // Update user progress for this topic
    const progress = await Progress.findOne({
        user: req.user._id,
        topic: question.topic,
        subtopic: question.subtopic
    });

    if (progress) {
        progress.questionsAnswered += 1;
        if (validation.isCorrect) {
            progress.correctAnswers += 1;
        }
        progress.accuracy = Math.round((progress.correctAnswers / progress.questionsAnswered) * 100);
        
        // Update mastery level (weighted average)
        progress.masteryLevel = Math.min(
            100,
            Math.round(progress.accuracy * 0.7 + (progress.questionsAnswered * 2) * 0.3)
        );
        
        progress.lastStudied = new Date();
        await progress.save();
    } else {
        // Create new progress record
        await Progress.create({
            user: req.user._id,
            topic: question.topic,
            subtopic: question.subtopic,
            questionsAnswered: 1,
            correctAnswers: validation.isCorrect ? 1 : 0,
            accuracy: validation.isCorrect ? 100 : 0,
            masteryLevel: validation.isCorrect ? 30 : 10,
            currentDifficulty: question.difficulty
        });
    }

    res.status(200).json({
        success: true,
        data: {
            isCorrect: validation.isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            validation: validation.method,
            sessionUpdated: !!sessionId
        }
    });
});

/**
 * @desc    Create a new question (admin/system)
 * @route   POST /api/questions
 * @access  Private (could add admin check)
 */
export const createQuestion = asyncHandler(async (req, res) => {
    const questionData = req.body;

    const question = await Question.create(questionData);

    res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: { question }
    });
});

/**
 * @desc    Update a question (admin/system)
 * @route   PUT /api/questions/:id
 * @access  Private (could add admin check)
 */
export const updateQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!question) {
        throw new AppError("Question not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: { question }
    });
});

/**
 * @desc    Delete a question (admin/system)
 * @route   DELETE /api/questions/:id
 * @access  Private (could add admin check)
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
        throw new AppError("Question not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Question deleted successfully"
    });
});

export default {
    getQuestions,
    getRandomQuestions,
    getDiagnosticQuestions,
    getQuestionById,
    submitAnswer,
    createQuestion,
    updateQuestion,
    deleteQuestion
};
