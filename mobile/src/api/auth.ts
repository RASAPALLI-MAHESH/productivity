import apiClient from './client';
import type {
  ApiResponse,
  AuthResponse,
  OtpResponse,
} from '../types';

export const authApi = {
  signup(email: string, password: string, displayName: string) {
    return apiClient.post<ApiResponse<OtpResponse>>('/auth/signup', {
      email: email.toLowerCase().trim(),
      password,
      displayName,
    });
  },

  verifyOtp(email: string, otp: string) {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', {
      email: email.toLowerCase().trim(),
      otp,
    });
  },

  resendOtp(email: string) {
    return apiClient.post<ApiResponse<OtpResponse>>('/auth/resend-otp', {
      email: email.toLowerCase().trim(),
    });
  },

  login(email: string, password: string) {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email: email.toLowerCase().trim(),
      password,
    });
  },

  googleAuth(idToken: string) {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/google', {
      token: idToken,
    });
  },

  forgotPassword(email: string) {
    return apiClient.post<ApiResponse<OtpResponse>>('/auth/forgot-password', {
      email: email.toLowerCase().trim(),
    });
  },

  verifyResetOtp(email: string, otp: string) {
    return apiClient.post<ApiResponse<{ resetToken: string }>>(
      '/auth/verify-reset-otp',
      { email: email.toLowerCase().trim(), otp },
    );
  },

  resetPassword(resetToken: string, newPassword: string) {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      '/auth/reset-password',
      { resetToken, newPassword },
    );
  },

  logout() {
    return apiClient.post('/auth/logout');
  },

  refresh() {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
  },
};
