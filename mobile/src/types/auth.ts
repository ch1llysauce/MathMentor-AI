export interface User {
  _id: string;
  email: string;
  displayName: string;
  gradeLevel?: number;
  currentTopic?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  gradeLevel?: number;
}
