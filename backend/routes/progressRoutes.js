import express from "express";
import {
    getAllProgress,
    getTopicProgress,
    getProgressSummary,
    getLearningPath,
    getNextTopic,
    getDifficultySuggestion,
    updateStreak,
    getWeakAreas
} from "../controllers/progressController.js";
import {
    authenticate,
    validateProgressQuery
} from "../middleware/index.js";

const router = express.Router();

// All progress routes are protected
router.use(authenticate);

// Progress tracking
router.get("/", validateProgressQuery, getAllProgress);
router.get("/stats/summary", getProgressSummary);
router.get("/weak-areas", getWeakAreas);
router.get("/:topic", getTopicProgress);

// Learning recommendations
router.get("/learning-path", getLearningPath);
router.get("/next-recommendation", getNextTopic);
router.get("/difficulty-suggestion/:topic", getDifficultySuggestion);

// Streak management
router.post("/update-streak", updateStreak);

export default router;
