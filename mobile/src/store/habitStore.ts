import { create } from 'zustand';
import { habitsApi } from '../api/habits';
import { toISODateString, getWeekDays } from '../utils/date';
import type { Habit, HabitLog, HabitDashboardData, CreateHabitPayload } from '../types';

interface HabitState {
  habits: Habit[];
  logs: Record<string, HabitLog[]>;
  intelligence: HabitDashboardData['intelligence'] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  createHabit: (payload: CreateHabitPayload) => Promise<Habit>;
  completeHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  fetchLogsForWeek: (habitId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isCompletedToday: (habitId: string) => boolean;
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: {},
  intelligence: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  clearError: () => set({ error: null }),

  isCompletedToday: (habitId) => {
    const today = toISODateString(new Date());
    const habitLogs = get().logs[habitId] ?? [];
    return habitLogs.some((l) => l.date === today && l.completed);
  },

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await habitsApi.getDashboard();
      const { habits, logs, intelligence } = res.data.data;
      set({ habits, logs, intelligence, isLoading: false });
    } catch (err) {
      set({ error: extractMessage(err), isLoading: false });
    }
  },

  createHabit: async (payload) => {
    const res = await habitsApi.create(payload);
    const newHabit = res.data.data;
    set((state) => ({ habits: [newHabit, ...state.habits] }));
    return newHabit;
  },

  completeHabit: async (habitId) => {
    // Optimistic update — increment streak and mark today
    const today = toISODateString(new Date());
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              currentStreak: h.currentStreak + 1,
              lastCompletedDate: today,
            }
          : h,
      ),
      logs: {
        ...state.logs,
        [habitId]: [
          ...(state.logs[habitId] ?? []),
          { date: today, completed: true, completedAt: new Date().toISOString() },
        ],
      },
    }));
    try {
      const res = await habitsApi.complete(habitId);
      const updated = res.data.data;
      set((state) => ({
        habits: state.habits.map((h) => (h.id === habitId ? updated : h)),
      }));
    } catch (err) {
      // Revert optimistic update
      get().fetchDashboard();
      throw err;
    }
  },

  deleteHabit: async (habitId) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== habitId),
    }));
    try {
      await habitsApi.delete(habitId);
    } catch (err) {
      get().fetchDashboard();
      throw err;
    }
  },

  fetchLogsForWeek: async (habitId) => {
    const days = getWeekDays();
    const startDate = toISODateString(days[0]);
    const endDate = toISODateString(days[6]);
    try {
      const res = await habitsApi.getLogs(habitId, startDate, endDate);
      set((state) => ({
        logs: { ...state.logs, [habitId]: res.data.data },
      }));
    } catch {
      // Non-critical, silently fail
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    try {
      await get().fetchDashboard();
    } finally {
      set({ isRefreshing: false });
    }
  },
}));

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
