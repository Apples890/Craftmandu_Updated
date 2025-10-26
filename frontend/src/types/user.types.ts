// frontend/types/user.types.ts
export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
