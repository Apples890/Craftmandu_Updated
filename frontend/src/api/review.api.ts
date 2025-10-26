// api/review.api.ts
import { request } from './_base';

export type ReviewCreate = {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string | null;
};

export const ReviewApi = {
  listForProduct(productId: string) {
    return request<{ reviews: any[] }>(`/api/reviews/product/${productId}`);
  },
  create(token: string, payload: ReviewCreate) {
    return request<any>('/api/reviews', 'POST', payload, token);
  },
};
