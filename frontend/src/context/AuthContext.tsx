import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase.client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthApi } from '@/api/auth.api';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  recoverSession: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

const Ctx = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const profile = useAuthStore((s) => s.profile);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error || null);
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const navigate = useNavigate();

  const value = useMemo<AuthContextType>(() => ({
    user: profile || null,
    loading: status === 'loading',
    error,
    login,
    register,
    logout,
    recoverSession: async () => { await refreshProfile(); },
    sendPasswordResetEmail: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
  }), [profile, status, error, login, register, logout, refreshProfile]);

  // Auto-logout on 401s from API
  useEffect(() => {
    const onUnauthorized = () => {
      try { logout(); } finally { navigate('/dashboard', { replace: true }); }
    };
    window.addEventListener('app:unauthorized', onUnauthorized as any);
    return () => window.removeEventListener('app:unauthorized', onUnauthorized as any);
  }, [logout, navigate]);

  // Auto-logout when JWT expires (uses exp claim) and show 1-minute pre-expiry toast with refresh
  useEffect(() => {
    if (!token) return;
    let preId: number | undefined;
    let logoutId: number | undefined;
    function parseExp(t: string): number | undefined {
      try {
        const base = t.split('.')[1];
        const payload = JSON.parse(atob(base.replace(/-/g, '+').replace(/_/g, '/')));
        return typeof payload?.exp === 'number' ? payload.exp : undefined;
      } catch { return undefined; }
    }
    const exp = parseExp(token);
    if (!exp) return;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) {
      try { logout(); } finally { navigate('/dashboard', { replace: true }); }
      return;
    }
    // Pre-expiry toast 60s before
    const preMs = ms - 60_000;
    if (preMs > 0) {
      preId = window.setTimeout(() => {
        const tid = toast.custom((t) => (
          <div className="bg-white border border-gray-200 rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <div className="text-sm text-gray-700">Your session will expire in 1 minute.</div>
            <button
              className="text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 px-3 py-1.5 rounded-md"
              onClick={async () => {
                try {
                  const { token: newToken } = await AuthApi.refresh();
                  useAuthStore.getState().setToken(newToken);
                  await useAuthStore.getState().refreshProfile();
                  toast.dismiss(t.id);
                  toast.success('You are signed in for 30 more minutes');
                } catch (e: any) {
                  toast.error(e?.message || 'Failed to refresh session');
                }
              }}
            >
              Stay signed in
            </button>
          </div>
        ), { duration: Infinity });
      }, preMs);
    }

    logoutId = window.setTimeout(() => {
      try { logout(); } finally { navigate('/dashboard', { replace: true }); }
    }, ms);
    return () => { if (preId) clearTimeout(preId); if (logoutId) clearTimeout(logoutId); };
  }, [token, logout, navigate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
