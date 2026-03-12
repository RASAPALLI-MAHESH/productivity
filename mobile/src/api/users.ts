import apiClient from './client';
import type { ApiResponse, User } from '../types';

export const usersApi = {
  getMe() {
    return apiClient.get<ApiResponse<User>>('/users/me');
  },

  updateMe(payload: Partial<Pick<User, 'displayName' | 'bio' | 'photoURL'>>) {
    return apiClient.put<ApiResponse<User>>('/users/me', payload);
  },

  deleteAccount() {
    return apiClient.delete<ApiResponse<null>>('/users/me');
  },
};
