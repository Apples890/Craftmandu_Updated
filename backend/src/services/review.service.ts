// services/review.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError } from '@/utils/error.utils';
import type { ReviewDbRow } from '@/types/review.types';

export const ReviewService = {
  async listForProduct(productId: string) {
    const db = supabaseClient('anon');
    const { data, error } = await db.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async create(userId: string, jwt: string, payload: { orderId: string; productId: string; rating: number; comment?: string | null; }) {
    const db = supabaseClient('anon', jwt);
    const insert: Partial<ReviewDbRow> = {
      order_id: payload.orderId,
      product_id: payload.productId,
      customer_id: userId,
      rating: payload.rating,
      comment: payload.comment ?? null,
    };
    const { data, error } = await db.from('reviews').insert(insert).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
