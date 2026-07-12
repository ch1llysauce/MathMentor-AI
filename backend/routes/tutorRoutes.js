import express from 'express';
import { chat, clearConversation, getConversationHistory } from '../controllers/tutorController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All tutor routes require authentication
router.post('/chat', auth, chat);
router.post('/clear', auth, clearConversation);
router.get('/history/:conversationId', auth, getConversationHistory);

export default router;
