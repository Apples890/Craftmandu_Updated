// api/_base.ts
// Minimal fetch wrapper for frontend. Works in Next.js, Vite, CRA.
// Uses either NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL.
// Prefer relative base in Vite dev so the dev proxy handles CORS
// api/_base.ts
const BASE_URL =
  (typeof process !== 'undefined' && (process.env as any)?.NEXT_PUBLIC_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && (process.env as any)?.REACT_APP_API_BASE_URL) || // <= CRA support
  'http://localhost:5000'; // final fallback


export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: any,
  token?: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg = (isJson && (data?.message || data?.error)) || res.statusText;
    throw new ApiError(msg || 'Request failed', res.status, data);
  }
  return data as T;
}
