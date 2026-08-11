import api from './api';
import { PROGRESS_ENDPOINTS, LEARNING_ENDPOINTS } from '../constants/api';

export interface DashboardStats {
  currentStreak: number;
  xpEarned: number;
  accuracy: number;          // percentage (0-100)
  accuracyCorrect: number;   // raw correct count from diagnostic
  accuracyTotal: number;     // raw total count from diagnostic
  avgSpeed: number;
}

export interface TopicProgress {
  topic: string;
  progress: number;
  problemsSolved: number;
}

export interface DashboardData {
  user: {
    displayName: string;
    currentStreak: number;
    longestStreak: number;
    totalStudyTime: number;
  };
  topicStats: Array<{
    topic: string;
    totalQuestions: number;
    correctAnswers: number;
    averageMastery: number;
    accuracy: number;
  }>;
  overallProgress: {
    totalTopics: number;
    totalSubtopics: number;
    totalQuestions: number;
    totalCorrect: number;
    averageResponseTime: number;
  };
}

export const dashboardService = {
  // Get dashboard summary data
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get(PROGRESS_ENDPOINTS.SUMMARY);
    return response.data.data;
  },

  // Get all topic progress
  async getTopicProgress(): Promise<TopicProgress[]> {
    const response = await api.get(PROGRESS_ENDPOINTS.BASE);
    const progressData = response.data.data.progress;

    // Group by topic and calculate stats
    const topicMap = new Map<string, { total: number; correct: number }>();
    
    progressData.forEach((item: any) => {
      const existing = topicMap.get(item.topic) || { total: 0, correct: 0 };
      topicMap.set(item.topic, {
        total: existing.total + item.questionsAnswered,
        correct: existing.correct + item.correctAnswers,
      });
    });

    return Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      progress: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      problemsSolved: stats.total,
    }));
  },

  // Fetch accuracy and avg speed from the latest diagnostic result
  async getDiagnosticStats(): Promise<{ accuracy: number; accuracyCorrect: number; accuracyTotal: number; avgSpeed: number }> {
    try {
      const response = await api.get(LEARNING_ENDPOINTS.GET_DIAGNOSTIC);
      // Response shape: { data: { diagnostic, analysis } }
      const result = response.data?.data?.diagnostic;
      const correct: number = result?.correctAnswers ?? 0;
      const total: number = result?.totalQuestions ?? 0;
      const timeSpent: number = result?.timeSpent ?? 0;

      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const avgSpeed = total > 0 ? Math.round(timeSpent / total) : 0;

      return { accuracy, accuracyCorrect: correct, accuracyTotal: total, avgSpeed };
    } catch {
      return { accuracy: 0, accuracyCorrect: 0, accuracyTotal: 0, avgSpeed: 0 };
    }
  },

  // Calculate dashboard stats — accuracy & avgSpeed come from the diagnostic
  calculateStats(data: DashboardData, diagnosticAccuracy = 0, diagnosticAvgSpeed = 0, accuracyCorrect = 0, accuracyTotal = 0): DashboardStats {
    const totalCorrect = data.overallProgress.totalCorrect;

    return {
      currentStreak: data.user.currentStreak,
      xpEarned: totalCorrect * 10,
      accuracy: diagnosticAccuracy,
      accuracyCorrect,
      accuracyTotal,
      avgSpeed: diagnosticAvgSpeed,
    };
  },

  // Update streak (call daily)
  async updateStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const response = await api.post(PROGRESS_ENDPOINTS.UPDATE_STREAK);
    return response.data.data;
  },
};
