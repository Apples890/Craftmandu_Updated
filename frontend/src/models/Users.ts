import type { Session } from '@supabase/supabase-js';

// Minimal user/profile models to match current app usage
export type UserRole = 'admin' | 'vendor' | 'customer';

export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: UserRole;
  is_verified?: boolean;
}

export type FullUser = Profile;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationData = {
  email: string;
  password?: string;
  full_name?: string;
};

export type AuthContextType = {
  user: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setUser: (u: Profile | null) => void;
  setSession: (s: Session | null) => void;
  login: (c: LoginCredentials) => Promise<void>;
  register: (d: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<Profile | null>;
  recoverSession: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  clearError: () => void;
};

