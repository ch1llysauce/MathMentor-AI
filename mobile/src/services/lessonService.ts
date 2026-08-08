import api from './api';
import { Lesson, PracticeProblem, SubmitAnswerResponse } from '@/types/lesson';
import { generateProblems } from './clientProblemGenerator';

export const lessonService = {
  // Get all lessons for a topic/subtopic
  async getLessons(topic?: string, subtopic?: string): Promise<{ lessons: Lesson[] }> {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (subtopic) params.append('subtopic', subtopic);
    const response = await api.get(`/learning/lessons?${params.toString()}`);
    return response.data.data;
  },

  // Get a single lesson by ID
  async getLesson(lessonId: string): Promise<{ lesson: Lesson; progress: any }> {
    const response = await api.get(`/learning/lessons/${lessonId}`);
    return response.data.data;
  },

  // Mark lesson as completed
  async completeLesson(lessonId: string, timeSpent: number): Promise<any> {
    const response = await api.put(`/learning/lessons/${lessonId}/complete`, { timeSpent });
    return response.data.data;
  },

  // Mark lesson as incomplete
  async markLessonIncomplete(lessonId: string): Promise<any> {
    const response = await api.put(`/learning/lessons/${lessonId}/incomplete`);
    return response.data.data;
  },

  // Get persisted lesson conversation (history + conversationId)
  async getLessonConversation(lessonId: string): Promise<{ conversationId: string | null; messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> }> {
    const response = await api.get(`/learning/lessons/${lessonId}/conversation`);
    return response.data.data;
  },

  // Save a message pair to the lesson conversation
  async saveLessonConversationMessage(lessonId: string, conversationId: string, userMessage: string, assistantMessage: string): Promise<void> {
    await api.post(`/learning/lessons/${lessonId}/conversation`, {
      conversationId,
      userMessage,
      assistantMessage,
    });
  },

  /**
   * Get practice problems.
   *
   * Strategy:
   * 1. If `lessonId` is provided → fetch from database (lesson-specific, progress tracking).
   * 2. Otherwise → generate problems client-side instantly (PRIMARY, zero-cost, offline-capable).
   *    If generation somehow fails → attempt the backend generator endpoint as fallback.
   */
  async getPracticeProblems(params: {
    topic?: string;
    subtopic?: string;
    difficulty?: string;
    category?: string;
    lessonId?: string;
    limit?: number;
  }): Promise<{ problems: PracticeProblem[] }> {

    // ── Path A: lesson-specific → database ──────────────────────────────────
    if (params.lessonId) {
      const q = new URLSearchParams();
      if (params.topic)      q.append('topic', params.topic);
      if (params.difficulty) q.append('difficulty', params.difficulty);
      q.append('lessonId', params.lessonId);
      if (params.limit)      q.append('limit', params.limit.toString());
      const response = await api.get(`/learning/practice?${q.toString()}`);
      return response.data.data;
    }

    // ── Path B: general practice → client-side generator (PRIMARY) ──────────
    const difficultyToCategory: Record<string, string> = {
      Easy: 'basic', Medium: 'intermediate', Hard: 'advanced',
    };
    const topic    = (params.topic ?? 'algebra').toLowerCase();
    const category = params.category
      ?? (params.difficulty ? (difficultyToCategory[params.difficulty] ?? 'mixed') : 'mixed');
    const count    = params.limit ?? 10;

    try {
      const generated = generateProblems(topic, category, count);
      console.log(`✅ Generated ${generated.length} ${topic}/${category} problems client-side`);
      return { problems: generated as unknown as PracticeProblem[] };
    } catch (genError) {
      console.error('Client generator failed:', genError);
      throw genError;
    }
  },

  // Submit practice problem answer (database-backed problems only)
  async submitAnswer(
    problemId: string,
    userAnswer: string,
    timeSpent: number,
    hintsUsed: number
  ): Promise<SubmitAnswerResponse> {
    const response = await api.post(`/learning/practice/${problemId}/submit`, {
      userAnswer,
      timeSpent,
      hintsUsed,
    });
    return response.data.data;
  },
};
