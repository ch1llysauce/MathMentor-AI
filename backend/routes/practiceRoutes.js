/**
 * Practice Problem Routes
 */

import express from 'express';
import { getPracticeProblems, getCategories } from '../controllers/practiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get available categories and topics
router.get('/categories', authenticate, getCategories);

// Get practice problems
router.get('/problems', authenticate, getPracticeProblems);

export default router;
