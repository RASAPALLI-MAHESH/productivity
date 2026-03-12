import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { getToken, saveToken, clearTokens, getRefreshToken, saveRefreshToken } from '../utils/storage';

const BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ||
  'http://localhost:3000/api/v1';

// Queue of requests waiting for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // needed for httpOnly refresh cookie
});

// ─── Request interceptor — attach access token ────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await getRefreshToken();
        const response = await apiClient.post('/auth/refresh', { refreshToken: storedRefreshToken });
        const { tokens } = response.data.data;
        await saveToken(tokens.accessToken);
        await saveRefreshToken(tokens.refreshToken);
        processQueue(null, tokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        // Signal auth store to log out
        authEventEmitter.emit('logout');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Simple event emitter for auth events (avoids circular imports)
type Listener = () => void;
export const authEventEmitter = {
  listeners: new Map<string, Listener[]>(),
  emit(event: string) {
    this.listeners.get(event)?.forEach((cb) => cb());
  },
  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
    return () => this.off(event, cb);
  },
  off(event: string, cb: Listener) {
    const arr = this.listeners.get(event) ?? [];
    this.listeners.set(event, arr.filter((l) => l !== cb));
  },
};

export default apiClient;
