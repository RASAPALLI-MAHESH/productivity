import { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}
