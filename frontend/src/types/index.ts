// ─── Task ────────────────────────────────────────
export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'in-progress' | 'done';
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Habit ───────────────────────────────────────
export interface Habit {
    id: string;
    name: string;
    description: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    createdAt: string;
}

export interface HabitLog {
    date: string;
    completed: boolean;
    completedAt: string | null;
}

// ─── Dashboard ───────────────────────────────────
export interface DashboardData {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    todayTasks: Task[];
    overdueTodayTasks: Task[];
    habits: Habit[];
    totalStreakDays: number;
    upcomingDeadlines: Task[];
    weeklyStats: {
        tasksCompleted: number;
        habitsCompleted: number;
        streakDays: number;
    };
}

// ─── User & Auth ─────────────────────────────────
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
    createdAt: string;
    lastLogin: string | null;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
}

export interface AuthResponse {
    user: User;
    tokens: TokenPair;
}

export interface OtpResponse {
    message: string;
    maskedEmail: string; // ma****@gmail.com
    expiresInSeconds: number;
}

// ─── API ─────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    timestamp: string;
    totalPages?: number;
    totalElements?: number;
}
