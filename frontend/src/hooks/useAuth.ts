// hooks/useAuth.ts
// Thin wrapper around the auth store so components can use a hook interface.
import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { LoginPayload, RegisterPayload } from '@/api/auth.api';

export function useAuth(_initialToken?: string) {
  const token = useAuthStore((s) => s.token);
  const profile = useAuthStore((s) => s.profile);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const loginAction = useAuthStore((s) => s.login);
  const registerAction = useAuthStore((s) => s.register);
  const logoutAction = useAuthStore((s) => s.logout);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  // Normalize shape to match previous usage across pages
  return {
    token,
    user: profile,
    profile,
    isAuthenticated,
    status,
    error,
    refresh: refreshProfile,
    login: (payload: LoginPayload) => loginAction(payload.email, payload.password),
    register: (payload: RegisterPayload) => registerAction(payload.email, payload.password, payload.fullName),
    logout: logoutAction,
  };
}
