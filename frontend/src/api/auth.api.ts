// api/auth.api.ts
import { request } from './_base';

export type RegisterPayload = { email: string; password: string; fullName: string };
export type LoginPayload = { email: string; password: string };

export const AuthApi = {
  // Server-side profile (requires Supabase access token in Authorization header)
  me(token: string) {
    return request<{ auth: any; profile: any }>('/api/auth/me', 'GET', undefined, token);
  },

  // Optional precheck to see if email exists (server uses service role)
  precheck(email: string) {
    return request<{ exists: boolean }>('/api/auth/precheck', 'POST', { email });
  },

  // If you keep custom controllers for register/login on server, expose them:
  register(payload: RegisterPayload) {
    return request<{ user: any; token: string }>('/api/auth/register', 'POST', payload);
  },

  login(payload: LoginPayload) {
    return request<{ user: any; token: string }>('/api/auth/login', 'POST', payload);
  },
};
