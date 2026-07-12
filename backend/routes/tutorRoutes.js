import express from 'express';
import { chat, clearConversation, getConversationHistory } from '../controllers/tutorController.js';
import { authenticate } from '../middleware/index.js';

const router = express.Router();

// All tutor routes require authentication
router.post('/chat', authenticate, chat);
router.post('/clear', authenticate, clearConversation);
router.get('/history/:conversationId', authenticate, getConversationHistory);

export default router;
