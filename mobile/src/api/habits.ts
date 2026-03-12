import apiClient from './client';
import type {
  ApiResponse,
  Habit,
  HabitLog,
  HabitDashboardData,
  CreateHabitPayload,
} from '../types';

export const habitsApi = {
  create(payload: CreateHabitPayload) {
    return apiClient.post<ApiResponse<Habit>>('/habits', payload);
  },

  getAll() {
    return apiClient.get<ApiResponse<Habit[]>>('/habits');
  },

  getDashboard() {
    return apiClient.get<ApiResponse<HabitDashboardData>>('/habits/dashboard');
  },

  getById(habitId: string) {
    return apiClient.get<ApiResponse<Habit>>(`/habits/${habitId}`);
  },

  update(habitId: string, payload: Partial<CreateHabitPayload>) {
    return apiClient.put<ApiResponse<Habit>>(`/habits/${habitId}`, payload);
  },

  delete(habitId: string) {
    return apiClient.delete<ApiResponse<null>>(`/habits/${habitId}`);
  },

  complete(habitId: string) {
    return apiClient.post<ApiResponse<Habit>>(`/habits/${habitId}/complete`);
  },

  getLogs(habitId: string, startDate: string, endDate: string) {
    return apiClient.get<ApiResponse<HabitLog[]>>(`/habits/${habitId}/logs`, {
      params: { startDate, endDate },
    });
  },
};
