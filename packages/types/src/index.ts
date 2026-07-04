// Shared TypeScript interface definitions
export interface BaseUser {
  id: string;
  email: string;
  role: 'student' | 'admin';
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
