import express from "express";
import {
    getDiagnosticDashboard,
    getDiagnosticTimeline,
    getWeakAreas,
    getRecommendations,
    compareDiagnostics
} from "../controllers/diagnosticController.js";
import { authenticate } from "../middleware/index.js";

const router = express.Router();

// All diagnostic routes are protected
router.use(authenticate);

// Dashboard and analytics
router.get("/dashboard", getDiagnosticDashboard);
router.get("/timeline", getDiagnosticTimeline);
router.get("/weak-areas", getWeakAreas);
router.get("/recommendations", getRecommendations);
router.get("/compare", compareDiagnostics);

export default router;
