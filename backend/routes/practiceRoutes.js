import express from 'express';
import { getPracticeProblems, getCategories, getDailyStatus, completeDailyChallenge } from '../controllers/practiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get available categories and topics
router.get('/categories', authenticate, getCategories);

// Get practice problems
router.get('/problems', authenticate, getPracticeProblems);

// Daily challenge status (server-side, per user)
router.get('/daily-status', authenticate, getDailyStatus);
router.post('/daily-complete', authenticate, completeDailyChallenge);

export default router;
