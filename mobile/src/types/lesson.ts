export interface LessonExample {
  problem: string;
  solution: string;
  steps: string[];
}

export interface LessonSection {
  title: string;
  content: string;
  examples: LessonExample[];
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  keyTakeaways: string[];
}

export interface Lesson {
  _id: string;
  topic: string;
  subtopic: string;
  order: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: LessonContent;
  estimatedTime: number;
  isLocked: boolean;
  userProgress?: {
    status: 'not-started' | 'in-progress' | 'completed';
    progress: number;
    timeSpent: number;
    completedAt?: string;
  };
}

export interface PracticeProblem {
  _id: string;
  topic: string;
  subtopic: string;
  lessonId?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'multiple-choice' | 'free-response' | 'true-false';
  problem: {
    text: string;
    latex?: string;
    image?: string;
  };
  options?: {
    text: string;
    latex?: string;
    isCorrect?: boolean;
  }[];
  explanation: string;
  solution?: {
    steps: string[];
    finalAnswer: string;
  };
  hints: string[];
  points: number;
  previousAttempts?: ProblemAttempt[];
}

export interface ProblemAttempt {
  _id: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  pointsEarned: number;
  attemptNumber: number;
  createdAt: string;
}

export interface SubmitAnswerResponse {
  attempt: ProblemAttempt;
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
  solution?: {
    steps: string[];
    finalAnswer: string;
  };
}
