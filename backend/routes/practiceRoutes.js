/**
 * Practice Problem Routes
 */

import express from 'express';
import { getPracticeProblems, getCategories } from '../controllers/practiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get available categories and topics
router.get('/categories', protect, getCategories);

// Get practice problems
router.get('/problems', protect, getPracticeProblems);

export default router;
