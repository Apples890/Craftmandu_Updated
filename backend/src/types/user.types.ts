// types/user.types.ts
export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface UserDbRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Optional: JWT payload fields you care about from Supabase */
export interface JwtUserPayload {
  sub: string;              // user id
  email?: string;
  app_role?: UserRole;      // if you inject this custom claim
  [k: string]: unknown;
}
