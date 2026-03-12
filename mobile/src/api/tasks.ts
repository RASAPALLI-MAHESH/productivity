import apiClient from './client';
import type {
  ApiResponse,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilterParams,
} from '../types';

export const tasksApi = {
  create(payload: CreateTaskPayload) {
    return apiClient.post<ApiResponse<Task>>('/tasks', payload);
  },

  getAll(params: TaskFilterParams = {}) {
    return apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
  },

  getOverdue() {
    return apiClient.get<ApiResponse<Task[]>>('/tasks/overdue');
  },

  getToday() {
    return apiClient.get<ApiResponse<Task[]>>('/tasks/today');
  },

  getById(taskId: string) {
    return apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
  },

  update(taskId: string, payload: UpdateTaskPayload) {
    return apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
  },

  delete(taskId: string) {
    return apiClient.delete<ApiResponse<null>>(`/tasks/${taskId}`);
  },

  complete(taskId: string) {
    return apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, {
      status: 'done',
    });
  },
};
