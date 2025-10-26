// api/vendor.api.ts
import { request } from './_base';

export const VendorApi = {
  getBySlug(slug: string) {
    return request<any>(`/api/vendors/slug/${encodeURIComponent(slug)}`);
  },
  getMe(token: string) {
    return request<any>('/api/vendors/me', 'GET', undefined, token);
  },
  updateMe(token: string, patch: {
    shopName?: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    country?: string | null;
  }) {
    return request<any>('/api/vendors/me', 'PATCH', patch, token);
  },
};
