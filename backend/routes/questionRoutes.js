import express from "express";
import {
    getQuestions,
    getRandomQuestions,
    getDiagnosticQuestions,
    getQuestionById,
    submitAnswer,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "../controllers/questionController.js";
import {
    authenticate,
    validateQuestionQuery,
    validateAnswerSubmission,
    validateMongoId
} from "../middleware/index.js";

const router = express.Router();

// All question routes are protected
router.use(authenticate);

// Get questions
router.get("/", validateQuestionQuery, getQuestions);
router.get("/random", getRandomQuestions);
router.get("/diagnostic", getDiagnosticQuestions);
router.get("/:id", validateMongoId("id"), getQuestionById);

// Submit answer
router.post("/submit", validateAnswerSubmission, submitAnswer);

// Create, update, delete (admin/system)
router.post("/", createQuestion);
router.put("/:id", validateMongoId("id"), updateQuestion);
router.delete("/:id", validateMongoId("id"), deleteQuestion);

export default router;
