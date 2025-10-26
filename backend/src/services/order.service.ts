// services/order.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError } from '@/utils/error.utils';
import type { OrderDbRow } from '@/types/order.types';

export const OrderService = {
  async listForCustomer(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<OrderDbRow>('orders').select('*').eq('customer_id', userId).order('placed_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async listForVendor(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', userId).single();
    const { data, error } = await db.from<OrderDbRow>('orders').select('*').eq('vendor_id', vendor!.id).order('placed_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async updateStatus(orderId: string, jwt: string, status: OrderDbRow['status']) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<OrderDbRow>('orders').update({ status }).eq('id', orderId).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
