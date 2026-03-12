import { create } from 'zustand';
import { tasksApi } from '../api/tasks';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilterParams } from '../types';

interface TaskState {
  tasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;

  fetchTasks: (params?: TaskFilterParams) => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  fetchOverdueTasks: () => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  todayTasks: [],
  overdueTasks: [],
  selectedTask: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  totalPages: 0,
  currentPage: 0,

  clearError: () => set({ error: null }),

  fetchTasks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await tasksApi.getAll({ page: 0, size: 50, ...params });
      set({
        tasks: res.data.data,
        totalPages: res.data.totalPages ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({ error: extractMessage(err), isLoading: false });
    }
  },

  fetchTodayTasks: async () => {
    try {
      const res = await tasksApi.getToday();
      set({ todayTasks: res.data.data });
    } catch (err) {
      set({ error: extractMessage(err) });
    }
  },

  fetchOverdueTasks: async () => {
    try {
      const res = await tasksApi.getOverdue();
      set({ overdueTasks: res.data.data });
    } catch (err) {
      set({ error: extractMessage(err) });
    }
  },

  fetchTaskById: async (taskId) => {
    set({ isLoading: true });
    try {
      const res = await tasksApi.getById(taskId);
      set({ selectedTask: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: extractMessage(err), isLoading: false });
    }
  },

  createTask: async (payload) => {
    const res = await tasksApi.create(payload);
    const newTask = res.data.data;
    // Optimistic insert at top
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: async (taskId, payload) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? ({ ...t, ...payload } as Task) : t,
      ),
    }));
    try {
      const res = await tasksApi.update(taskId, payload);
      const updated = res.data.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
        selectedTask:
          state.selectedTask?.id === taskId ? updated : state.selectedTask,
      }));
    } catch (err) {
      // Revert on failure
      get().fetchTasks();
      throw err;
    }
  },

  completeTask: async (taskId) => {
    // Optimistic complete
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'done' as const } : t,
      ),
      todayTasks: state.todayTasks.map((t) =>
        t.id === taskId ? { ...t, status: 'done' as const } : t,
      ),
    }));
    try {
      await tasksApi.complete(taskId);
    } catch (err) {
      get().fetchTasks();
      throw err;
    }
  },

  deleteTask: async (taskId) => {
    // Optimistic remove
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      todayTasks: state.todayTasks.filter((t) => t.id !== taskId),
      overdueTasks: state.overdueTasks.filter((t) => t.id !== taskId),
    }));
    try {
      await tasksApi.delete(taskId);
    } catch (err) {
      get().fetchTasks();
      throw err;
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    try {
      await Promise.all([
        get().fetchTasks(),
        get().fetchTodayTasks(),
        get().fetchOverdueTasks(),
      ]);
    } finally {
      set({ isRefreshing: false });
    }
  },
}));

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

