import api from './api';
import { Lesson, PracticeProblem, SubmitAnswerResponse } from '@/types/lesson';

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

  // Get practice problems
  async getPracticeProblems(params: {
    topic?: string;
    subtopic?: string;
    difficulty?: string;
    lessonId?: string;
    limit?: number;
  }): Promise<{ problems: PracticeProblem[] }> {
    const queryParams = new URLSearchParams();
    if (params.topic) queryParams.append('topic', params.topic);
    if (params.subtopic) queryParams.append('subtopic', params.subtopic);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.lessonId) queryParams.append('lessonId', params.lessonId);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/learning/practice?${queryParams.toString()}`);
    return response.data.data;
  },

  // Submit practice problem answer
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
