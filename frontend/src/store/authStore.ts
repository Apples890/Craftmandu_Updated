// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthApi } from '@/api/auth.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

type AuthState = {
  token?: string;
  profile?: any | null;
  status: Status;
  error?: string | null;
  // actions
  setToken: (t?: string) => void;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: undefined,
      profile: null,
      status: 'idle',
      error: null,
      setToken(t) {
        set({ token: t });
      },
      async refreshProfile() {
        const token = get().token;
        if (!token) return;
        set({ status: 'loading', error: null });
        try {
          const { profile } = await AuthApi.me(token);
          set({ profile, status: 'success' });
        } catch (e: any) {
          set({ status: 'error', error: e?.message || 'Failed to refresh profile' });
        }
      },
      async login(email, password) {
        set({ status: 'loading', error: null });
        try {
          const { token } = await AuthApi.login({ email, password });
          set({ token });
          await get().refreshProfile();
        } catch (e: any) {
          set({ status: 'error', error: e?.message || 'Login failed' });
          throw e;
        }
      },
      async register(email, password, fullName) {
        set({ status: 'loading', error: null });
        try {
          const { token } = await AuthApi.register({ email, password, fullName });
          set({ token });
          await get().refreshProfile();
        } catch (e: any) {
          set({ status: 'error', error: e?.message || 'Register failed' });
          throw e;
        }
      },
      logout() {
        set({ token: undefined, profile: null, status: 'idle', error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, profile: state.profile }),
    }
  )
);
