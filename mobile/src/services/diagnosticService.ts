import api from './api';
import { storage } from '../utils/storage';
import {
  DiagnosticResponse,
  DiagnosticHistoryResponse,
  TopicScores
} from '../types/diagnostic';

/**
 * Diagnostic Service
 * Handles all diagnostic-related API calls with automatic offline cache fallbacks
 */

export const diagnosticService = {
  /**
   * Get the latest diagnostic result with analysis
   */
  getLatestDiagnostic: async (): Promise<DiagnosticResponse> => {
    try {
      const response = await api.get('/learning/diagnostic/latest');
      if (response.data?.success && response.data?.data) {
        await storage.setItem('mathmentor_offline_user_progress', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (err) {
      console.log('Network error fetching latest diagnostic, checking offline cache');
      const cached = await storage.getItem('mathmentor_offline_user_progress');
      if (cached) {
        const data = JSON.parse(cached);
        return { success: true, data: { diagnostic: data.diagnostic || data } } as any;
      }
      throw err;
    }
  },

  /**
   * Get diagnostic history
   */
  getDiagnosticHistory: async (): Promise<DiagnosticHistoryResponse> => {
    try {
      const response = await api.get('/learning/diagnostic/history');
      if (response.data?.success && response.data?.data) {
        await storage.setItem('mathmentor_offline_diagnostic_history', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (err) {
      console.log('Network error fetching diagnostic history, checking offline cache');
      const cached = await storage.getItem('mathmentor_offline_diagnostic_history');
      if (cached) {
        const data = JSON.parse(cached);
        return { success: true, data: data.diagnostics ? data : { diagnostics: data } } as any;
      }
      throw err;
    }
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
    let diagnostics: any[] = [];
    try {
      const response = await api.get(`/learning/diagnostic/history`);
      diagnostics = response.data?.data?.diagnostics || response.data?.diagnostics || [];
      if (diagnostics.length > 0) {
        await storage.setItem('mathmentor_offline_diagnostic_history', JSON.stringify({ diagnostics }));
      }
    } catch (err) {
      console.log('Network error fetching diagnostic timeline, checking offline cache');
      const cached = await storage.getItem('mathmentor_offline_diagnostic_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        diagnostics = parsed.diagnostics || parsed || [];
      }
    }

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
