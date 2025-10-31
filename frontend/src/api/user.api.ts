// api/user.api.ts
import { api } from '@/utils/api.client';

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  shippingAddress?: { address: string; province: string; district: string };
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const UserApi = {
  async getProfile() {
    const res = await api.get('/api/users/profile');
    return res.data as any;
  },
  async updateProfile(payload: UpdateProfilePayload) {
    const res = await api.patch('/api/users/profile', payload);
    return res.data as any;
  },
  async changePassword(payload: ChangePasswordPayload) {
    const res = await api.post('/api/users/change-password', payload);
    return res.data as { success: boolean };
  },
  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data as { url?: string; profile?: any };
  },
};
