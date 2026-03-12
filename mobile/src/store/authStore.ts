import { create } from 'zustand';
import { authApi } from '../api/auth';
import { saveToken, clearTokens, saveRefreshToken } from '../utils/storage';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<{ maskedEmail: string; expiresInSeconds: number }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ maskedEmail: string; expiresInSeconds: number }>;
  verifyResetOtp: (email: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  setUserFromTokens: (authResponse: AuthResponse) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setUserFromTokens: async (authResponse: AuthResponse) => {
    await saveToken(authResponse.tokens.accessToken);
    await saveRefreshToken(authResponse.tokens.refreshToken);
    set({ user: authResponse.user, isAuthenticated: true, error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const authResponse = res.data.data;
      await saveToken(authResponse.tokens.accessToken);
      await saveRefreshToken(authResponse.tokens.refreshToken);
      set({ user: authResponse.user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const msg = extractMessage(err);
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  signup: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.signup(email, password, displayName);
      set({ isLoading: false });
      return {
        maskedEmail: res.data.data.maskedEmail,
        expiresInSeconds: res.data.data.expiresInSeconds,
      };
    } catch (err: unknown) {
      set({ error: extractMessage(err), isLoading: false });
      throw err;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyOtp(email, otp);
      const authResponse = res.data.data;
      await saveToken(authResponse.tokens.accessToken);
      await saveRefreshToken(authResponse.tokens.refreshToken);
      set({ user: authResponse.user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      set({ error: extractMessage(err), isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.forgotPassword(email);
      set({ isLoading: false });
      return {
        maskedEmail: res.data.data.maskedEmail,
        expiresInSeconds: res.data.data.expiresInSeconds,
      };
    } catch (err: unknown) {
      set({ error: extractMessage(err), isLoading: false });
      throw err;
    }
  },

  verifyResetOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyResetOtp(email, otp);
      set({ isLoading: false });
      return res.data.data.resetToken;
    } catch (err: unknown) {
      set({ error: extractMessage(err), isLoading: false });
      throw err;
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resetPassword(resetToken, newPassword);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ error: extractMessage(err), isLoading: false });
      throw err;
    }
  },
}));

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
