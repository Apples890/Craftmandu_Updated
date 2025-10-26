// api/admin.api.ts
import { request } from './_base';

export const AdminApi = {
  stats(token: string) {
    return request<{ counts: Record<string, number> }>('/api/admin/stats', 'GET', undefined, token);
  },
};
