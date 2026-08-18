import api from './api';
import { Lesson, PracticeProblem, SubmitAnswerResponse } from '@/types/lesson';
import { generateProblems } from './clientProblemGenerator';
import { offlineCacheService } from './offlineCache';

export const lessonService = {
  // Get all lessons for a topic/subtopic (tries fresh API first, falls back to offline cache)
  async getLessons(topic?: string, subtopic?: string): Promise<{ lessons: Lesson[] }> {
    try {
      const params = new URLSearchParams();
      if (topic) params.append('topic', topic);
      if (subtopic) params.append('subtopic', subtopic);
      const response = await api.get(`/learning/lessons?${params.toString()}`);
      if (response.data?.data?.lessons) {
        return response.data.data;
      }
    } catch (e) {
      console.warn('Network error fetching lessons, using offline cache fallback');
    }

    const cached = await offlineCacheService.getOfflineLessons(topic, subtopic);
    return { lessons: cached };
  },

  // Get a single lesson by ID (tries fresh API first, falls back to offline cache)
  async getLesson(lessonId: string): Promise<{ lesson: Lesson; progress: any }> {
    try {
      const response = await api.get(`/learning/lessons/${lessonId}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (e) {
      console.warn('Network error fetching lesson, using offline cache fallback');
    }

    const cached = await offlineCacheService.getOfflineLesson(lessonId);
    if (cached) {
      return { lesson: cached, progress: { completed: false, timeSpent: 0 } };
    }
    throw new Error('Lesson not found');
  },

  // Mark lesson as completed
  async completeLesson(lessonId: string, timeSpent: number): Promise<any> {
    await offlineCacheService.markOfflineLessonCompleted(lessonId);
    try {
      const response = await api.put(`/learning/lessons/${lessonId}/complete`, { timeSpent });
      return response.data.data;
    } catch (e) {
      console.log('Backend unreachable, marked lesson completed in offline cache');
      return { success: true };
    }
  },

  // Mark lesson as incomplete
  async markLessonIncomplete(lessonId: string): Promise<any> {
    await offlineCacheService.markOfflineLessonIncomplete(lessonId);
    try {
      const response = await api.put(`/learning/lessons/${lessonId}/incomplete`);
      return response.data.data;
    } catch (e) {
      return { success: true };
    }
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

  // Delete the lesson conversation entirely
  async deleteLessonConversation(lessonId: string): Promise<void> {
    await api.delete(`/learning/lessons/${lessonId}/conversation`);
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

    // ── Path A: lesson-specific → database (with client generator fallback) ───
    if (params.lessonId) {
      try {
        const q = new URLSearchParams();
        if (params.topic)      q.append('topic', params.topic);
        if (params.difficulty) q.append('difficulty', params.difficulty);
        q.append('lessonId', params.lessonId);
        if (params.limit)      q.append('limit', params.limit.toString());
        const response = await api.get(`/learning/practice?${q.toString()}`);
        if (response.data?.data?.problems) {
          return response.data.data;
        }
      } catch (e) {
        console.warn('Network error fetching lesson practice problems, falling back to client generator');
      }
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
