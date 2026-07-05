// Diagnostic Types
export interface SubtopicScore {
  [key: string]: number;
}

export interface TopicScore {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  subtopicScores: SubtopicScore;
}

export interface TopicScores {
  algebra: TopicScore;
  geometry: TopicScore;
  trigonometry: TopicScore;
}

export interface WeakTopic {
  topic: string;
  subtopic?: string;
  score: number;
}

export interface StrongTopic {
  topic: string;
  subtopic?: string;
  score: number;
}

export interface RecommendedPath {
  topic: string;
  subtopic: string;
  priority: number;
  reason: string;
}

export interface DiagnosticResult {
  _id: string;
  user: string;
  topicScores: TopicScores;
  algebraScore: number;
  geometryScore: number;
  trigonometryScore: number;
  weakTopics: WeakTopic[];
  strongTopics: StrongTopic[];
  recommendedLearningPath: RecommendedPath[];
  totalQuestions: number;
  correctAnswers: number;
  overallScore: number;
  timeSpent: number;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticHistory {
  _id: string;
  overallScore: number;
  completedAt: string;
}

export interface DiagnosticTimeline {
  date: string;
  score: number;
}

export interface DiagnosticAnalysis {
  strongTopics: StrongTopic[];
  weakTopics: WeakTopic[];
  needsReview: WeakTopic[];
  recommendation?: {
    topic: string;
    subtopic: string;
    reason: string;
    potentialImprovement: number;
  };
}

export interface DiagnosticResponse {
  success: boolean;
  data: {
    diagnostic: DiagnosticResult;
    analysis?: DiagnosticAnalysis;
  };
}

export interface DiagnosticHistoryResponse {
  success: boolean;
  count: number;
  data: {
    diagnostics: DiagnosticHistory[];
  };
}
