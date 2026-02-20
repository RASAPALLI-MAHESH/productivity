import { create } from 'zustand';
import client from '../api/client';
import { setAccessToken, clearTokens } from '../api/client';
import type { User, ApiResponse, AuthResponse, OtpResponse } from '../types';

type AuthStep =
    | 'idle'
    | 'otp-verify'        // after signup, awaiting OTP
    | 'forgot-otp'        // forgot password, awaiting OTP
    | 'reset-password'    // OTP verified, set new password
    | 'account-locked'
    | 'email-not-verified';

interface AuthState {
    user: User | null;
    profile: User | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    // Auth flow state
    authStep: AuthStep;
    pendingEmail: string | null;      // email awaiting OTP
    maskedEmail: string | null;       // ma****@gmail.com
    otpExpiresIn: number;             // seconds
    resetToken: string | null;        // token for password reset

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    verifyResetOtp: (email: string, otp: string) => Promise<void>;
    resetPassword: (newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setAuthStep: (step: AuthStep) => void;
    initAuth: () => () => void;
    fetchProfile: () => Promise<void>;
    completeOnboarding: (bio: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    initialized: false,
    authStep: 'idle',
    pendingEmail: null,
    maskedEmail: null,
    otpExpiresIn: 300,
    resetToken: null,

    // ─── Login ──────────────────────────────────────
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<AuthResponse>>('/auth/login', {
                email,
                password,
            });
            const { user, tokens } = res.data.data;
            setAccessToken(tokens.accessToken);

            // Check if account is locked
            if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                set({ loading: false, authStep: 'account-locked', user });
                return;
            }

            // Check if email is verified
            if (!user.verified) {
                set({
                    loading: false,
                    authStep: 'email-not-verified',
                    pendingEmail: email,
                    user,
                });
                return;
            }

            set({ user, profile: user, loading: false, authStep: 'idle' });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Login failed');
            // Check for account locked response
            if (message.toLowerCase().includes('locked')) {
                set({ error: message, loading: false, authStep: 'account-locked' });
            } else {
                set({ error: message, loading: false });
            }
            throw err;
        }
    },

    // ─── Signup ─────────────────────────────────────
    signup: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<OtpResponse>>('/auth/signup', {
                email,
                password,
                displayName,
            });
            const { maskedEmail, expiresInSeconds } = res.data.data;
            set({
                loading: false,
                authStep: 'otp-verify',
                pendingEmail: email,
                maskedEmail,
                otpExpiresIn: expiresInSeconds,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Signup failed');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Verify OTP (post-signup) ───────────────────
    verifyOtp: async (email, otp) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<AuthResponse>>('/auth/verify-otp', {
                email,
                otp,
            });
            const { user, tokens } = res.data.data;
            setAccessToken(tokens.accessToken);
            set({
                user,
                profile: user,
                loading: false,
                authStep: 'idle',
                pendingEmail: null,
                maskedEmail: null,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Verification failed');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Resend OTP ─────────────────────────────────
    resendOtp: async (email) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<OtpResponse>>('/auth/resend-otp', { email });
            const { maskedEmail, expiresInSeconds } = res.data.data;
            set({
                loading: false,
                maskedEmail,
                otpExpiresIn: expiresInSeconds,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Failed to resend OTP');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Forgot Password ───────────────────────────
    forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<OtpResponse>>('/auth/forgot-password', { email });
            const { maskedEmail, expiresInSeconds } = res.data.data;
            set({
                loading: false,
                authStep: 'forgot-otp',
                pendingEmail: email,
                maskedEmail,
                otpExpiresIn: expiresInSeconds,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Request failed');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Verify Reset OTP ──────────────────────────
    verifyResetOtp: async (email, otp) => {
        set({ loading: true, error: null });
        try {
            const res = await client.post<ApiResponse<{ resetToken: string }>>('/auth/verify-reset-otp', {
                email,
                otp,
            });
            set({
                loading: false,
                authStep: 'reset-password',
                resetToken: res.data.data.resetToken,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Verification failed');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Reset Password ────────────────────────────
    resetPassword: async (newPassword) => {
        set({ loading: true, error: null });
        const { resetToken, pendingEmail } = get();
        try {
            await client.post('/auth/reset-password', {
                email: pendingEmail,
                resetToken,
                newPassword,
            });
            set({
                loading: false,
                authStep: 'idle',
                resetToken: null,
                pendingEmail: null,
                maskedEmail: null,
            });
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Reset failed');
            set({ error: message, loading: false });
            throw err;
        }
    },

    // ─── Logout ─────────────────────────────────────
    logout: async () => {
        try {
            await client.post('/auth/logout');
        } catch {
            // silent — server might be down
        }
        clearTokens();
        set({
            user: null,
            profile: null,
            authStep: 'idle',
            pendingEmail: null,
            maskedEmail: null,
            resetToken: null,
        });
    },

    clearError: () => set({ error: null }),

    setAuthStep: (step) => set({ authStep: step }),

    // ─── Init (try refresh on app load) ─────────────
    initAuth: () => {
        let isCancelled = false;
        
        const init = async () => {
            const { initialized } = get();
            if (initialized) return;

            // Safety timeout to prevent infinite loading if backend is hanging
            const timeoutId = setTimeout(() => {
                if (!isCancelled) {
                    console.warn('Auth initialization timed out, forcing initialized state');
                    set({ initialized: true });
                }
            }, 12000); 

            try {
                const res = await client.post<ApiResponse<AuthResponse>>('/auth/refresh', {});
                if (isCancelled) return;

                const { user, tokens } = res.data.data;
                setAccessToken(tokens.accessToken);
                set({ user, profile: user, initialized: true });
            } catch (err) {
                if (isCancelled) return;
                // No valid session — user needs to log in
                clearTokens();
                set({ initialized: true });
            } finally {
                clearTimeout(timeoutId);
            }
        };

        init();

        return () => { isCancelled = true; };
    },

    // ─── Fetch Profile ──────────────────────────────
    fetchProfile: async () => {
        try {
            const res = await client.get<ApiResponse<User>>('/users/me');
            set({ profile: res.data.data });
        } catch (err) {
            console.error('Failed to fetch profile', err);
            throw err;
        }
    },

    // ─── Complete Onboarding ────────────────────────
    completeOnboarding: async (bio: string) => {
        set({ loading: true });
        try {
            const res = await client.post<ApiResponse<User>>('/users/onboarding', { bio });
            set({ profile: res.data.data, loading: false });
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },
}));

// ─── Helpers ─────────────────────────────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        return axiosErr.response?.data?.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
}
