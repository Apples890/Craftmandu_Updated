import { api } from '@/utils/api.client';

export type Review = {
  id: string;
  order_id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  vendor_reply?: string | null;
  vendor_reply_at?: string | null;
  created_at: string;
};

export type ReviewSummary = {
  count: number;
  averageRating: number;
  breakdown: Record<string, number>;
};

export type VendorReview = Review & {
  product?: { id: string; name: string; slug: string };
  customer?: { id: string; full_name?: string | null; email?: string | null };
};

export const ReviewApi = {
  async listByProductId(productId: string) {
    const res = await api.get('/api/reviews/product/' + encodeURIComponent(productId));
    return { reviews: (res.data?.reviews || []) as Review[], summary: res.data?.summary as ReviewSummary | undefined };
  },
  async listByProductSlug(slug: string) {
    const res = await api.get('/api/reviews/product/slug/' + encodeURIComponent(slug));
    return { reviews: (res.data?.reviews || []) as Review[], summary: res.data?.summary as ReviewSummary | undefined };
  },
  async create(payload: { productId: string; rating?: number; title?: string; comment?: string; orderId?: string }) {
    const res = await api.post('/api/reviews', payload);
    return res.data as Review;
  },
  async vendorList() {
    const res = await api.get('/api/reviews/vendor');
    return (res.data?.reviews || []) as VendorReview[];
  },
  async reply(reviewId: string, reply: string) {
    const res = await api.post(`/api/reviews/${encodeURIComponent(reviewId)}/reply`, { reply });
    return res.data as Review;
  },
};
