import { api } from '@/utils/api.client';

export const AdminApi = {
  async stats() {
    const res = await api.get('/api/admin/stats');
    return res.data?.counts as Record<string, number>;
  },
  async analytics(days: number = 30) {
    const res = await api.get('/api/admin/analytics', { params: { days } });
    return res.data as { revenue_cents: number; orders: number; by_status: Record<string, number>; series: Array<{ date: string; orders: number; revenue_cents: number }>; days: number };
  },
  async users() {
    const res = await api.get('/api/admin/users');
    return res.data?.items as Array<{ id: string; email: string; full_name: string; role: string; created_at: string }>;
  },
  async setUserRole(id: string, role: 'ADMIN'|'VENDOR'|'CUSTOMER') {
    const res = await api.patch(`/api/admin/users/${id}/role`, { role });
    return res.data;
  },
  async vendors() {
    const res = await api.get('/api/admin/vendors');
    return res.data?.items as Array<{ id: string; user_id: string; shop_name: string; slug: string; status: 'PENDING'|'APPROVED'|'SUSPENDED'; created_at: string }>;
  },
  async setVendorStatus(id: string, status: 'PENDING'|'APPROVED'|'SUSPENDED') {
    const res = await api.patch(`/api/admin/vendors/${id}/status`, { status });
    return res.data;
  },
  async createCategory(name: string, slug: string) {
    const res = await api.post('/api/admin/categories', { name, slug });
    return res.data;
  },
};
