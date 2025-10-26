// frontend/utils/api.client.ts
import axios, { AxiosInstance } from 'axios';

const BASE_URL =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  '';

let authTokenGetter: (() => string | undefined) | null = null;

/**
 * Optionally register a token getter so interceptors can attach Authorization header
 * without creating a tight coupling to your state library.
 */
export function registerAuthTokenGetter(getter: () => string | undefined) {
  authTokenGetter = getter;
}

function getStoredToken(): string | undefined {
  try {
    // matches zustand persist key from authStore.ts
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token;
  } catch { return undefined; }
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = authTokenGetter?.() || getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for common 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Optionally broadcast a logout event
      window.dispatchEvent(new CustomEvent('app:unauthorized'));
    }
    return Promise.reject(err);
  }
);
