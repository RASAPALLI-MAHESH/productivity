import { create } from 'zustand';
import client from '../api/client';
import { Habit, HabitLog, ApiResponse } from '../types';

export interface HabitIntelligence {
    consistencyScore: number;
    riskCount: number;
    longestStreak: number;
    weeklyCompletionRate: number;
}

export interface HabitDashboardData {
    habits: Habit[];
    logs: Record<string, HabitLog[]>;
    intelligence: HabitIntelligence;
}

interface HabitStoreState {
    // State
    habits: Habit[];
    habitLogs: Record<string, HabitLog[]>;
    intelligence: HabitIntelligence;
    loading: boolean;
    error: string | null;

    // Computed / Filters
    filterCategory: string;
    searchQuery: string;
    sortOption: 'Most Streak' | 'Recently Created' | 'Alphabetical' | 'Completion Rate';

    // UI Helpers
    lastDeletedHabit: Habit | null;
    gamificationEnabled: boolean;

    // Setters
    setFilterCategory: (cat: string) => void;
    setSearchQuery: (query: string) => void;
    setSortOption: (sort: 'Most Streak' | 'Recently Created' | 'Alphabetical' | 'Completion Rate') => void;
    setGamificationEnabled: (enabled: boolean) => void;

    // Actions
    fetchDashboard: () => Promise<void>;
    createHabit: (habit: Partial<Habit>) => Promise<void>;
    updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    undoDeleteHabit: () => Promise<void>;
    toggleCompletion: (id: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitStoreState>((set, get) => ({
    habits: [],
    habitLogs: {},
    intelligence: {
        consistencyScore: 0,
        riskCount: 0,
        longestStreak: 0,
        weeklyCompletionRate: 0,
    },
    loading: false,
    error: null,

    filterCategory: 'all',
    searchQuery: '',
    sortOption: 'Recently Created',

    lastDeletedHabit: null,
    gamificationEnabled: true,

    setFilterCategory: (cat) => set({ filterCategory: cat }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSortOption: (sort) => set({ sortOption: sort }),
    setGamificationEnabled: (enabled) => set({ gamificationEnabled: enabled }),

    fetchDashboard: async () => {
        set({ loading: true, error: null });
        try {
            const res = await client.get<ApiResponse<HabitDashboardData>>('/habits/dashboard');
            set({
                habits: res.data.data.habits || [],
                habitLogs: res.data.data.logs || {},
                intelligence: res.data.data.intelligence || {
                    consistencyScore: 0,
                    riskCount: 0,
                    longestStreak: 0,
                    weeklyCompletionRate: 0,
                },
                loading: false,
            });
        } catch (err) {
            set({ error: 'Failed to load habits dashboard', loading: false });
        }
    },

    createHabit: async (habit) => {
        const tempId = `temp-${Date.now()}`;
        const newHabit = {
            id: tempId,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: new Date().toISOString(),
            ...habit
        } as Habit;

        const prevHabits = get().habits;
        // Optimistic update
        set({ habits: [newHabit, ...prevHabits] });

        try {
            const res = await client.post<ApiResponse<Habit>>('/habits', habit);
            // Replace temp with real
            set({
                habits: get().habits.map(h => h.id === tempId ? res.data.data : h)
            });
        } catch {
            // Rollback
            set({ habits: prevHabits });
        }
    },

    updateHabit: async (id, updates) => {
        const prevHabits = get().habits;
        set({
            habits: prevHabits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        });

        try {
            await client.put(`/habits/${id}`, updates);
        } catch {
            set({ habits: prevHabits });
        }
    },

    deleteHabit: async (id) => {
        const habitToDelete = get().habits.find(h => h.id === id);
        if (!habitToDelete) return;

        const prevHabits = get().habits;
        const prevLogs = get().habitLogs;

        // Optimistic delete from UI, but keep in lastDeletedHabit
        set({
            habits: prevHabits.filter(h => h.id !== id),
            lastDeletedHabit: habitToDelete,
        });

        try {
            await client.delete(`/habits/${id}`);
            // Clear undo buffer after 5 seconds
            setTimeout(() => {
                if (get().lastDeletedHabit?.id === id) {
                    set({ lastDeletedHabit: null });
                }
            }, 5000);
        } catch {
            // Rollback
            set({ habits: prevHabits, habitLogs: prevLogs, lastDeletedHabit: null });
        }
    },

    undoDeleteHabit: async () => {
        const habit = get().lastDeletedHabit;
        if (!habit) return;

        const prevHabits = get().habits;
        set({
            habits: [habit, ...prevHabits],
            lastDeletedHabit: null
        });

        try {
            const { id, ...habitData } = habit;
            await client.post('/habits', habitData);
            // Intentionally reloading dashboard to restore logs and exact IDs
            get().fetchDashboard();
        } catch {
            set({ habits: prevHabits });
        }
    },

    toggleCompletion: async (id, dateStr) => {
        const prevHabits = get().habits;
        const prevLogs = get().habitLogs;
        const habit = prevHabits.find(h => h.id === id);
        if (!habit) return;

        const logsForHabit = prevLogs[id] || [];
        const isAlreadyCompleted = logsForHabit.some(l => l.date === dateStr && l.completed);

        if (isAlreadyCompleted) return; // Cannot undo completion yet per backend rules

        // Optimistic UI Update
        const optimisticLog: HabitLog = {
            date: dateStr,
            completed: true,
            completedAt: new Date().toISOString()
        };

        let newStreak = habit.currentStreak;
        let newLongest = habit.longestStreak;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (habit.lastCompletedDate === yesterday) {
            newStreak += 1;
        } else if (habit.lastCompletedDate !== today) {
            newStreak = 1;
        }

        if (newStreak > newLongest) {
            newLongest = newStreak;
        }

        set({
            habits: prevHabits.map(h => {
                if (h.id === id) {
                    return { ...h, currentStreak: newStreak, longestStreak: newLongest, lastCompletedDate: dateStr };
                }
                return h;
            }),
            habitLogs: {
                ...prevLogs,
                [id]: [...logsForHabit, optimisticLog]
            }
        });

        try {
            // Send API call to mark complete
            await client.post(`/habits/${id}/complete`, {});

            // Because XP computation requires user update, we don't manage `authStore.user.xp` directly inside `habitStore` synchronously,
            // we let the component handle the "+XP animation" visually. 
            // In a full system, you would call `useAuthStore.getState().fetchProfile()` here to sync the global XP.

        } catch {
            // Rollback on failure
            set({ habits: prevHabits, habitLogs: prevLogs });
        }
    }
}));
