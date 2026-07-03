import { askAITutor, getAnswerExplanation, getHint, generatePracticeProblem } from "../services/aiRouter.js";
import { Session } from "../models/index.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * @desc    Ask AI tutor a question (Socratic method)
 * @route   POST /api/ai/ask
 * @access  Private
 */
export const askTutor = asyncHandler(async (req, res) => {
    const { question, context, sessionId } = req.body;

    if (!question) {
        throw new AppError("Question is required", 400);
    }

    // Get AI response with fallback system
    const aiResponse = await askAITutor(question, context || {});

    // If sessionId provided, save interaction to session
    if (sessionId) {
        const session = await Session.findById(sessionId);
        if (session && session.user.toString() === req.user._id.toString()) {
            // Find current question or create interaction log
            session.questions = session.questions || [];
            
            // Add interaction to the most recent question or as standalone
            if (session.questions.length > 0) {
                const lastQuestion = session.questions[session.questions.length - 1];
                lastQuestion.aiInteractions = lastQuestion.aiInteractions || [];
                lastQuestion.aiInteractions.push({
                    userMessage: question,
                    aiResponse: aiResponse.response,
                    timestamp: new Date()
                });
            }
            
            await session.save();
        }
    }

    res.status(200).json({
        success: true,
        data: {
            response: aiResponse.response,
            source: aiResponse.source,
            model: aiResponse.model,
            context: context
        }
    });
});

/**
 * @desc    Get explanation for an answer
 * @route   POST /api/ai/explain
 * @access  Private
 */
export const explainAnswer = asyncHandler(async (req, res) => {
    const { question, correctAnswer, userAnswer, context } = req.body;

    if (!question || !correctAnswer || !userAnswer) {
        throw new AppError("Question, correct answer, and user answer are required", 400);
    }

    const explanation = await getAnswerExplanation(
        question,
        correctAnswer,
        userAnswer,
        context || {}
    );

    res.status(200).json({
        success: true,
        data: {
            explanation: explanation.response,
            source: explanation.source,
            isCorrect: userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
        }
    });
});

/**
 * @desc    Get a hint for a problem
 * @route   POST /api/ai/hint
 * @access  Private
 */
export const getHintForProblem = asyncHandler(async (req, res) => {
    const { question, step, context } = req.body;

    if (!question) {
        throw new AppError("Question is required", 400);
    }

    const hint = await getHint(question, step || 1, context || {});

    res.status(200).json({
        success: true,
        data: {
            hint: hint.response,
            source: hint.source,
            step: step || 1
        }
    });
});

/**
 * @desc    Generate AI practice problem
 * @route   POST /api/ai/generate-problem
 * @access  Private
 */
export const generateProblem = asyncHandler(async (req, res) => {
    const { topic, subtopic, difficulty, context } = req.body;

    if (!topic || !subtopic || !difficulty) {
        throw new AppError("Topic, subtopic, and difficulty are required", 400);
    }

    const result = await generatePracticeProblem(topic, subtopic, difficulty, context || {});

    if (!result.success) {
        throw new AppError(result.message || "Failed to generate problem", 500);
    }

    res.status(200).json({
        success: true,
        data: {
            problem: result.problem,
            source: result.source
        }
    });
});

/**
 * @desc    Get AI tutor conversation history for a session
 * @route   GET /api/ai/history/:sessionId
 * @access  Private
 */
export const getTutorHistory = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    // Check ownership
    if (session.user.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized to access this session", 403);
    }

    // Extract all AI interactions
    const conversations = [];
    session.questions.forEach((q, index) => {
        if (q.aiInteractions && q.aiInteractions.length > 0) {
            conversations.push({
                questionIndex: index,
                question: q.questionId,
                interactions: q.aiInteractions
            });
        }
    });

    res.status(200).json({
        success: true,
        data: {
            sessionId: session._id,
            topic: session.topic,
            conversationCount: conversations.length,
            conversations
        }
    });
});

/**
 * @desc    Test AI service availability
 * @route   GET /api/ai/status
 * @access  Private
 */
export const checkAIStatus = asyncHandler(async (req, res) => {
    const testPrompt = "Hello, this is a test. Please respond with 'OK'.";
    
    try {
        const response = await askAITutor(testPrompt, {});
        
        res.status(200).json({
            success: true,
            data: {
                status: "operational",
                activeService: response.source,
                model: response.model,
                message: "AI tutoring service is available"
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            data: {
                status: "degraded",
                message: "AI service temporarily unavailable",
                error: error.message
            }
        });
    }
});

export default {
    askTutor,
    explainAnswer,
    getHintForProblem,
    generateProblem,
    getTutorHistory,
    checkAIStatus
};
