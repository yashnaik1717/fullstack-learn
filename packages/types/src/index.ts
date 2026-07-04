// Shared TypeScript interface definitions
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressSummary {
  lessonsCompleted: number;
  totalLessons: number;
  streakDays: number;
  currentMilestone: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'teacher' | 'coach' | 'system';
  content: string;
  timestamp: string;
}

// ==========================================
// Authentication Payload Types
// ==========================================

export interface AuthResponse {
  accessToken: string;
  user: BaseUser;
}

export interface RegisterPayload {
  email: string;
  passwordHash?: string; // Kept optional for frontend forms before encryption if any
  password?: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
  currentPassword?: string;
}
