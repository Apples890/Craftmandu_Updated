// services/vendor.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError, NotFoundError } from '@/utils/error.utils';
import type { VendorDbRow } from '@/types/vendor.types';

export const VendorService = {
  async getBySlug(slug: string) {
    const db = supabaseClient('anon');
    const { data, error } = await db.from<VendorDbRow>('vendors').select('*').eq('slug', slug).single();
    if (error) throw new NotFoundError('Vendor not found');
    return data;
  },

  async getMine(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<VendorDbRow>('vendors').select('*').eq('user_id', userId).single();
    if (error) throw new NotFoundError('Vendor profile not found');
    return data;
  },

  async updateMine(userId: string, jwt: string, patch: Partial<VendorDbRow>) {
    const db = supabaseClient('anon', jwt);
    // Only allow subset fields
    const allowed: Partial<VendorDbRow> = {};
    const keys: (keyof VendorDbRow)[] = ['shop_name','description','logo_url','banner_url','address_line1','address_line2','city','country'];
    for (const k of keys) if (k in (patch as any)) (allowed as any)[k] = (patch as any)[k];
    const { data, error } = await db.from<VendorDbRow>('vendors').update(allowed).eq('user_id', userId).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
