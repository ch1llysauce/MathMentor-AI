import express from "express";
import {
    askTutor,
    explainAnswer,
    getHintForProblem,
    generateProblem,
    getTutorHistory,
    checkAIStatus
} from "../controllers/aiController.js";
import {
    authenticate,
    validateAITutorRequest
} from "../middleware/index.js";

const router = express.Router();

// All AI routes are protected
router.use(authenticate);

// AI tutor interaction
router.post("/ask", validateAITutorRequest, askTutor);
router.post("/explain", explainAnswer);
router.post("/hint", getHintForProblem);
router.post("/generate-problem", generateProblem);

// AI conversation history
router.get("/history/:sessionId", getTutorHistory);

// System status
router.get("/status", checkAIStatus);

export default router;
