export interface User {
  _id: string;
  email: string;
  displayName: string;
  gradeLevel?: number;
  focusAreas?: string[];
  currentTopic?: string;
  diagnosticCompleted?: boolean;
  currentStreak?: number;
  totalStudyTime?: number;
  createdAt?: string;
  twoFactorEnabled?: boolean;
  learningPreferences?: {
    difficulty?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresTwoFactor?: boolean;
  data?: {
    user: User;
    token: string;
    userId?: string; // present when requiresTwoFactor is true
  };
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  gradeLevel?: number;
  focusAreas?: string[];
}
