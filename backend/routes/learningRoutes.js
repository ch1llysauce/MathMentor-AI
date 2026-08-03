import express from "express";
import {
    startSession,
    endSession,
    getSession,
    getSessionHistory,
    submitDiagnosticResults,
    getDiagnosticHistory,
    getLatestDiagnostic,
    getReviewQuestions,
    getLessons,
    getLesson,
    completeLesson,
    markLessonIncomplete,
    getPracticeProblems,
    submitPracticeAnswer
} from "../controllers/learningController.js";
import {
    authenticate,
    validateSessionStart,
    validateMongoId
} from "../middleware/index.js";

const router = express.Router();

// All learning routes are protected
router.use(authenticate);

// Session management
router.post("/session/start", validateSessionStart, startSession);
router.put("/session/:sessionId/end", validateMongoId("sessionId"), endSession);
router.get("/session/:sessionId", validateMongoId("sessionId"), getSession);
router.get("/sessions", getSessionHistory);

// Diagnostic test
router.post("/diagnostic/submit", submitDiagnosticResults);
router.get("/diagnostic/history", getDiagnosticHistory);
router.get("/diagnostic/latest", getLatestDiagnostic);

// Lessons
router.get("/lessons", getLessons);
router.get("/lessons/:lessonId", validateMongoId("lessonId"), getLesson);
router.put("/lessons/:lessonId/complete", validateMongoId("lessonId"), completeLesson);
router.put("/lessons/:lessonId/incomplete", validateMongoId("lessonId"), markLessonIncomplete);

// Practice problems
router.get("/practice", getPracticeProblems);
router.post("/practice/:problemId/submit", validateMongoId("problemId"), submitPracticeAnswer);

// Review
router.get("/review", getReviewQuestions);

export default router;
