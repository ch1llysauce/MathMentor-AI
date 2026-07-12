import api from './api';
import { ChatResponse } from '@/types/tutor';

export const tutorService = {
  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    const response = await api.post('/tutor/chat', {
      message,
      conversationId,
    });
    return response.data;
  },

  async clearConversation(conversationId: string): Promise<void> {
    await api.post('/tutor/clear', { conversationId });
  },

  async getConversationHistory(conversationId: string): Promise<any> {
    const response = await api.get(`/tutor/history/${conversationId}`);
    return response.data;
  },
};
