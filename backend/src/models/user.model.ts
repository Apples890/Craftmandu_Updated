// models/user.model.ts
export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface UserDbRow {
  id: string;
  email: string;           // citext comes back as string
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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

export const UserModel = {
  fromDb: (r: UserDbRow): User => ({
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    fullName: r.full_name,
    phone: r.phone,
    role: r.role,
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }),
  toDb: (u: Partial<User>): Partial<UserDbRow> => ({
    id: u.id,
    email: u.email,
    password_hash: u.passwordHash,
    full_name: u.fullName,
    phone: u.phone ?? null,
    role: u.role,
    avatar_url: u.avatarUrl ?? null,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
  }),
};
