// api/vendor.api.ts
import { api } from '@/utils/api.client';

export type VendorUpdatePayload = {
  shopName?: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
};

export const VendorApi = {
  async me() {
    const res = await api.get('/api/vendors/me');
    return res.data as any;
  },
  async update(payload: VendorUpdatePayload) {
    const res = await api.patch('/api/vendors/me', payload);
    return res.data as any;
  },
  async uploadLogo(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/vendors/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data as { url?: string; vendor?: any };
  },
  async uploadBanner(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/vendors/banner', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data as { url?: string; vendor?: any };
  },
};

