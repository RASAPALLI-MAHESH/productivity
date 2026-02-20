// ─── Task ────────────────────────────────────────
export interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'todo' | 'in-progress' | 'done';
    deadline: string | null;
    estimatedMinutes?: number;           // How long will this take?
    energyLevel?: 'low' | 'medium' | 'high'; // Deep work / Light work
    context?: string[];                   // Home / Office / Laptop / Mobile
    recurring?: string;                   // Daily / Weekly / Custom CRON
    subtasks?: {
        id: string;
        title: string;
        completed: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
}

// ─── Habit ───────────────────────────────────────
export interface Habit {
    id: string;
    name: string;
    description: string;
    difficulty: number;            // 1-5 scale
    frequency: string;             // Daily, Weekly, Custom
    currentStreak: number;
    longestStreak: number;
    streakFreezeAvailable: number; // Gamified recovery
    lastCompletedDate: string | null;
    createdAt: string;
}

export interface HabitLog {
    date: string;
    completed: boolean;
    completedAt: string | null;
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
    xp: number;                // Gamification: XP points
    level: number;             // Gamification: Rank/Tier
    totalTasksCompleted: number;
    streakBest: number;
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
