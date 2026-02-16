import { create } from 'zustand';
import client from '../api/client';
import type { Task, Habit, DashboardData, ApiResponse, HabitLog } from '../types';

interface AppState {
    // Dashboard
    dashboard: DashboardData | null;
    dashboardLoading: boolean;
    fetchDashboard: () => Promise<void>;

    // Tasks
    tasks: Task[];
    taskLoading: boolean;
    totalPages: number;
    totalElements: number;
    fetchTasks: (params?: Record<string, string | number>) => Promise<void>;
    createTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (id: string, task: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Habits
    habits: Habit[];
    habitLoading: boolean;
    habitLogs: Record<string, HabitLog[]>;
    fetchHabits: () => Promise<void>;
    createHabit: (habit: Partial<Habit>) => Promise<void>;
    updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    completeHabit: (id: string) => Promise<void>;
    fetchHabitLogs: (habitId: string, startDate: string, endDate: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Dashboard
    dashboard: null,
    dashboardLoading: false,
    fetchDashboard: async () => {
        set({ dashboardLoading: true });
        try {
            const res = await client.get<ApiResponse<DashboardData>>('/dashboard');
            set({ dashboard: res.data.data, dashboardLoading: false });
        } catch {
            set({ dashboardLoading: false });
        }
    },

    // Tasks
    tasks: [],
    taskLoading: false,
    totalPages: 0,
    totalElements: 0,
    fetchTasks: async (params = {}) => {
        set({ taskLoading: true });
        try {
            const res = await client.get<ApiResponse<Task[]>>('/tasks', { params });
            set({
                tasks: res.data.data,
                totalPages: res.data.totalPages || 0,
                totalElements: res.data.totalElements || 0,
                taskLoading: false,
            });
        } catch {
            set({ taskLoading: false });
        }
    },
    createTask: async (task) => {
        await client.post('/tasks', task);
        await get().fetchTasks();
    },
    updateTask: async (id, task) => {
        await client.put(`/tasks/${id}`, task);
        await get().fetchTasks();
    },
    deleteTask: async (id) => {
        // Optimistic update
        const prev = get().tasks;
        set({ tasks: prev.filter((t) => t.id !== id) });
        try {
            await client.delete(`/tasks/${id}`);
        } catch {
            set({ tasks: prev });
        }
    },

    // Habits
    habits: [],
    habitLoading: false,
    habitLogs: {},
    fetchHabits: async () => {
        set({ habitLoading: true });
        try {
            const res = await client.get<ApiResponse<Habit[]>>('/habits');
            set({ habits: res.data.data, habitLoading: false });
        } catch {
            set({ habitLoading: false });
        }
    },
    createHabit: async (habit) => {
        await client.post('/habits', habit);
        await get().fetchHabits();
    },
    updateHabit: async (id, habit) => {
        await client.put(`/habits/${id}`, habit);
        await get().fetchHabits();
    },
    deleteHabit: async (id) => {
        const prev = get().habits;
        set({ habits: prev.filter((h) => h.id !== id) });
        try {
            await client.delete(`/habits/${id}`);
        } catch {
            set({ habits: prev });
        }
    },
    completeHabit: async (id) => {
        await client.post(`/habits/${id}/complete`);
        await get().fetchHabits();
    },
    fetchHabitLogs: async (habitId, startDate, endDate) => {
        try {
            const res = await client.get<ApiResponse<HabitLog[]>>(`/habits/${habitId}/logs`, {
                params: { startDate, endDate },
            });
            set((state) => ({
                habitLogs: { ...state.habitLogs, [habitId]: res.data.data },
            }));
        } catch {
            // silent fail
        }
    },
}));
