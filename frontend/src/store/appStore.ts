import { create } from 'zustand';
import client from '../api/client';
import type { Task, ApiResponse } from '../types';

interface AppState {

    // Tasks
    tasks: Task[];
    taskLoading: boolean;
    totalPages: number;
    totalElements: number;
    fetchTasks: (params?: Record<string, string | number>, options?: { silent?: boolean }) => Promise<void>;
    createTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (id: string, task: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    undoDeleteTask: () => Promise<void>;
    setTasks: (tasks: Task[]) => void;
    lastDeletedTask: Task | null;

    // Habits have been migrated to habitStore.ts
    gamificationEnabled: boolean;
    setGamificationEnabled: (enabled: boolean) => void;
    focusMode: boolean;
    setFocusMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({

    // Tasks
    tasks: [],
    taskLoading: false,
    totalPages: 0,
    totalElements: 0,
    lastDeletedTask: null,
    fetchTasks: async (params = {}, options = {}) => {
        if (!options?.silent) set({ taskLoading: true });
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
        const tempId = `temp-${Date.now()}`;
        const prevTasks = get().tasks;
        const newTask = {
            id: tempId,
            status: 'todo',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            ...task
        } as Task;

        // Optimistic update
        set({ tasks: [newTask, ...prevTasks] });

        try {
            const res = await client.post<ApiResponse<Task>>('/tasks', task);
            // Replace temp task with real one
            set({
                tasks: get().tasks.map(t => t.id === tempId ? res.data.data : t)
            });
        } catch {
            // Rollback
            set({ tasks: prevTasks });
        }
    },
    updateTask: async (id, task) => {
        // Optimistic update
        const prevTasks = get().tasks;

        // Update tasks list
        set({
            tasks: prevTasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
        });

        try {
            await client.put(`/tasks/${id}`, task);
        } catch {
            // Rollback
            set({ tasks: prevTasks });
        }
    },
    deleteTask: async (id) => {
        // Optimistic update
        const taskToDelete = get().tasks.find(t => t.id === id);
        if (!taskToDelete) return;

        const prev = get().tasks;
        set({
            tasks: prev.filter((t) => t.id !== id),
            lastDeletedTask: taskToDelete
        });

        try {
            await client.delete(`/tasks/${id}`);

            // Keep in lastDeletedTask for 5 seconds for undo
            setTimeout(() => {
                if (get().lastDeletedTask?.id === id) {
                    set({ lastDeletedTask: null });
                }
            }, 5000);
        } catch {
            set({ tasks: prev, lastDeletedTask: null });
        }
    },
    undoDeleteTask: async () => {
        const task = get().lastDeletedTask;
        if (!task) return;

        const prevTasks = get().tasks;
        set({
            tasks: [task, ...prevTasks],
            lastDeletedTask: null
        });

        try {
            const { id, ...taskData } = task;
            await client.post('/tasks', taskData);
        } catch {
            set({ tasks: prevTasks });
        }
    },
    setTasks: (tasks) => set({ tasks }),

    // Habits have been migrated to habitStore.ts
    gamificationEnabled: true,
    setGamificationEnabled: (enabled) => set({ gamificationEnabled: enabled }),
    focusMode: false,
    setFocusMode: (enabled) => set({ focusMode: enabled }),
}));
