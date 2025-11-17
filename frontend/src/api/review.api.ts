import { api } from '@/utils/api.client';

export type Review = {
  id: string;
  order_id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at: string;
};

export const ReviewApi = {
  async listByProductId(productId: string) {
    const res = await api.get('/api/reviews/product/' + encodeURIComponent(productId));
    return (res.data?.reviews || []) as Review[];
  },
  async listByProductSlug(slug: string) {
    const res = await api.get('/api/reviews/product/slug/' + encodeURIComponent(slug));
    return (res.data?.reviews || []) as Review[];
  },
  async create(payload: { productId: string; rating: number; title?: string; comment?: string; orderId?: string }) {
    const res = await api.post('/api/reviews', payload);
    return res.data as Review;
  },
};

