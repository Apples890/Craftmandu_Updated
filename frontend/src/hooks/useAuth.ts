// hooks/useAuth.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AuthApi, LoginPayload, RegisterPayload } from '@/api/auth.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useAuth(initialToken?: string) {
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [profile, setProfile] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const refresh = useCallback(async (overrideToken?: string) => {
    const t = overrideToken ?? token;
    if (!t) {
      setProfile(null);
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const res = await AuthApi.me(t);
      setProfile(res.profile ?? null);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile');
      setStatus('error');
    }
  }, [token]);

  const login = useCallback(async (payload: LoginPayload) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await AuthApi.login(payload);
      const t = res.token;
      setToken(t);
      await refresh(t);
      setStatus('success');
      return res;
    } catch (e: any) {
      setError(e?.message || 'Login failed');
      setStatus('error');
      throw e;
    }
  }, [refresh]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setStatus('loading');
    setError(null);
    try {
      const res = await AuthApi.register(payload);
      const t = res.token;
      setToken(t);
      await refresh(t);
      setStatus('success');
      return res;
    } catch (e: any) {
      setError(e?.message || 'Register failed');
      setStatus('error');
      throw e;
    }
  }, [refresh]);

  const logout = useCallback(() => {
    setToken(undefined);
    setProfile(null);
  }, []);

  useEffect(() => {
    if (token) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { token, setToken, profile, isAuthenticated, status, error, refresh, login, register, logout };
}
