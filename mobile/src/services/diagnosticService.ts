import api from './api';
import {
  DiagnosticResult,
  DiagnosticResponse,
  DiagnosticHistoryResponse,
  TopicScores
} from '../types/diagnostic';

/**
 * Diagnostic Service
 * Handles all diagnostic-related API calls
 */

export const diagnosticService = {
  /**
   * Get the latest diagnostic result with analysis
   */
  getLatestDiagnostic: async (): Promise<DiagnosticResponse> => {
    const response = await api.get('/learning/diagnostic/latest');
    return response.data;
  },

  /**
   * Get diagnostic history
   */
  getDiagnosticHistory: async (): Promise<DiagnosticHistoryResponse> => {
    const response = await api.get('/learning/diagnostic/history');
    return response.data;
  },

  /**
   * Submit diagnostic test results
   */
  submitDiagnosticResults: async (data: {
    topicScores: TopicScores;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
  }): Promise<DiagnosticResponse> => {
    const response = await api.post('/learning/diagnostic/submit', data);
    return response.data;
  },

  /**
   * Get diagnostic timeline for progress tracking
   */
  getDiagnosticTimeline: async (period: 'week' | 'month' | '6months' = 'week') => {
    const response = await api.get(`/learning/diagnostic/history`);
    const diagnostics = response.data.data.diagnostics;

    // Process diagnostics based on period
    const now = new Date();
    const filterDate = new Date();
    
    switch (period) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
    }

    return diagnostics
      .filter((d: any) => new Date(d.completedAt) >= filterDate)
      .map((d: any) => ({
        date: new Date(d.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: d.overallScore
      }))
      .reverse();
  }
};

export default diagnosticService;
