// Curriculum structure types for frontend

export type Subject = 'Algebra' | 'Geometry' | 'Trigonometry';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LessonMetadata {
  order: number;
  title: string;
  learningObjectives: string[];
}

export interface ModuleMetadata {
  moduleNumber: number;
  moduleName: string;
  lessons: LessonMetadata[];
}

export interface SubjectCurriculum {
  modules: ModuleMetadata[];
}

export interface Curriculum {
  Algebra: SubjectCurriculum;
  Geometry: SubjectCurriculum;
  Trigonometry: SubjectCurriculum;
}

// Full lesson from backend
export interface Lesson {
  _id: string;
  topic: Subject;
  subtopic: string;
  moduleNumber?: number;
  moduleName?: string;
  order: number;
  title: string;
  description: string;
  difficulty: LessonDifficulty;
  difficultyLevels: DifficultyLevel[];
  learningObjectives: string[];
  content: {
    introduction: string;
    sections: {
      title: string;
      content: string;
      examples: {
        problem: string;
        solution: string;
        steps: string[];
      }[];
    }[];
    summary: string;
    keyTakeaways: string[];
  };
  prerequisites: string[];
  estimatedTime: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Practice problem from backend
export interface PracticeProblem {
  _id: string;
  topic: Subject;
  subtopic: string;
  lessonId: string;
  difficulty: DifficultyLevel;
  type: 'multiple-choice' | 'free-response' | 'true-false';
  problem: {
    text: string;
    latex?: string;
    image?: string;
  };
  options?: {
    text: string;
    latex?: string;
    isCorrect: boolean;
  }[];
  correctAnswer?: string;
  explanation: string;
  solution: {
    steps: string[];
    finalAnswer: string;
  };
  hints: string[];
  points: number;
  learningObjective?: string;
  createdAt: string;
  updatedAt: string;
}

// Flat lesson structure for easy navigation
export interface FlatLesson {
  subject: Subject;
  moduleNumber: number;
  moduleName: string;
  lessonOrder: number;
  lessonTitle: string;
  learningObjectives: string[];
  fullPath: string;
}

// Progress tracking
export interface LessonProgress {
  lessonId: string;
  subject: Subject;
  moduleNumber: number;
  moduleName: string;
  lessonTitle: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  attemptsCount: number;
  lastAttempt?: string;
  masteryLevel: 'Not Started' | 'In Progress' | 'Needs Practice' | 'Proficient' | 'Mastered';
}

// Module progress aggregation
export interface ModuleProgress {
  subject: Subject;
  moduleNumber: number;
  moduleName: string;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  totalTimeSpent: number;
  masteryLevel: 'Not Started' | 'In Progress' | 'Proficient' | 'Mastered';
}

// AI Prompt generation structure
export interface AIPromptContext {
  subject: Subject;
  moduleName: string;
  lessonTitle: string;
  difficultyLevel: DifficultyLevel;
  learningObjectives: string[];
  excludedTopics?: string[];
  questionCount?: number;
  format?: 'multiple-choice' | 'free-response' | 'mixed';
}

// Curriculum navigation
export interface CurriculumNavigation {
  currentLesson: FlatLesson;
  previousLesson: FlatLesson | null;
  nextLesson: FlatLesson | null;
  currentModule: ModuleMetadata;
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    percentageComplete: number;
  };
}
