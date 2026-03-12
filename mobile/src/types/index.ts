// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  onboarded: boolean;
  bio: string | null;
  verified: boolean;
  loginAttempts: number;
  lockedUntil: string | null;
  xp: number;
  level: number;
  totalTasksCompleted: number;
  streakBest: number;
  createdAt: string;
  lastLogin: string | null;
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ExternalLink {
  id: string;
  text: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  estimatedMinutes?: number;
  energyLevel?: EnergyLevel;
  context?: string[];
  recurring?: string;
  subtasks?: Subtask[];
  externalLinks?: ExternalLink[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  estimatedMinutes?: number;
  energyLevel?: EnergyLevel;
  context?: string[];
  subtasks?: Omit<Subtask, 'id'>[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

// ─── Habit ────────────────────────────────────────────────────────────────────
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitGoalType = 'yesno' | 'duration' | 'count';
export type HabitCategory = 'health' | 'learning' | 'work' | 'personal';

export interface Habit {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  frequency: HabitFrequency;
  goalType: HabitGoalType;
  goalValue: number;
  category: HabitCategory;
  motivation?: string;
  currentStreak: number;
  longestStreak: number;
  streakFreezeAvailable: number;
  lastCompletedDate: string | null;
  startDate?: string;
  targetTime?: string;
  createdAt: string;
}

export interface HabitLog {
  date: string;
  completed: boolean;
  completedAt: string | null;
}

export interface HabitDashboardData {
  habits: Habit[];
  logs: Record<string, HabitLog[]>;
  intelligence: {
    consistencyScore: number;
    riskCount: number;
    longestStreak: number;
    weeklyCompletionRate: number;
  };
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  difficulty: number;
  frequency: HabitFrequency;
  goalType: HabitGoalType;
  goalValue: number;
  category: HabitCategory;
  motivation?: string;
  startDate?: string;
  targetTime?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface OtpResponse {
  message: string;
  maskedEmail: string;
  expiresInSeconds: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  totalPages?: number;
  totalElements?: number;
}

export interface PaginatedParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TaskFilterParams extends PaginatedParams {
  status?: TaskStatus;
  priority?: TaskPriority;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerify: { email: string; mode: 'signup' | 'reset'; maskedEmail: string };
  ForgotPassword: undefined;
  ResetPassword: { resetToken: string; email: string };
};

export type AppTabParamList = {
  Tasks: undefined;
  Habits: undefined;
  Deadlines: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
};

export type HabitStackParamList = {
  HabitList: undefined;
  HabitDetail: { habitId: string };
};
