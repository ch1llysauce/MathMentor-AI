import api from './api';
import { PROGRESS_ENDPOINTS } from '../constants/api';

export interface DashboardStats {
  currentStreak: number;
  xpEarned: number;
  accuracy: number;
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

    // Convert to array format
    return Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      progress: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      problemsSolved: stats.total,
    }));
  },

  // Calculate dashboard stats
  calculateStats(data: DashboardData): DashboardStats {
    const totalQuestions = data.overallProgress.totalQuestions;
    const totalCorrect = data.overallProgress.totalCorrect;
    
    return {
      currentStreak: data.user.currentStreak,
      xpEarned: totalCorrect * 10, // 10 XP per correct answer
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      avgSpeed: 42, // TODO: Calculate from actual response times
    };
  },

  // Update streak (call daily)
  async updateStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const response = await api.post(PROGRESS_ENDPOINTS.UPDATE_STREAK);
    return response.data.data;
  },
};
