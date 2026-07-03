import express from "express";
import {
    startSession,
    endSession,
    getSession,
    getSessionHistory,
    submitDiagnosticResults,
    getDiagnosticHistory,
    getLatestDiagnostic,
    getReviewQuestions
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

// Review
router.get("/review", getReviewQuestions);

export default router;
