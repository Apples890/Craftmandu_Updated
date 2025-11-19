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
    return res.data?.items as Array<{
      id: string;
      email: string;
      full_name: string;
      role: 'ADMIN'|'VENDOR'|'CUSTOMER';
      created_at: string;
      updated_at?: string;
    }>;
  },
  async vendors() {
    const res = await api.get('/api/admin/vendors');
    return res.data?.items as Array<{ id: string; user_id: string; shop_name: string; slug: string; status: 'PENDING'|'APPROVED'|'SUSPENDED'; created_at: string }>;
  },
  async setVendorStatus(id: string, status: 'PENDING'|'APPROVED'|'SUSPENDED') {
    const res = await api.patch(`/api/admin/vendors/${id}/status`, { status });
    return res.data;
  },
  async categories() {
    const res = await api.get('/api/admin/categories');
    return res.data?.items as Array<{ id: string; name: string; slug: string }>;
  },
  async createCategory(name: string) {
    const res = await api.post('/api/admin/categories', { name });
    return res.data;
  },
  async updateCategory(id: string, name: string) {
    const res = await api.patch(`/api/admin/categories/${id}`, { name });
    return res.data;
  },
  async deleteCategory(id: string) {
    await api.delete(`/api/admin/categories/${id}`);
  },
  async promoteToVendor(userId: string, shopName?: string, status: 'PENDING'|'APPROVED'|'SUSPENDED' = 'PENDING') {
    const res = await api.post('/api/admin/vendors/create', { userId, shopName, status });
    return res.data as { id: string; user_id: string; shop_name: string; status: string };
  },
  async deleteVendor(vendorId: string) {
    await api.delete(`/api/admin/vendors/${vendorId}`);
  },
  async reviewStats() {
    const res = await api.get('/api/admin/reviews/stats');
    return res.data as {
      total: number;
      averageRating: number;
      breakdown: Record<string, number>;
      topProducts: Array<{ productId: string; name: string; slug: string; averageRating: number; reviewCount: number }>;
    };
  },
};
