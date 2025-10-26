// services/product.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError, NotFoundError } from '@/utils/error.utils';
import type { ProductDbRow } from '@/types/product.types';

export const ProductService = {
  async list(limit = 20) {
    const db = supabaseClient('anon');
    const { data, error } = await db.from<ProductDbRow>('products')
      .select('*')
      .eq('status','ACTIVE')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async getBySlug(slug: string) {
    const db = supabaseClient('anon');
    const { data, error } = await db.from<ProductDbRow>('products').select('*').eq('slug', slug).single();
    if (error) throw new NotFoundError('Product not found');
    return data;
  },

  async createForVendor(userId: string, jwt: string, payload: {
    name: string; slug: string; description?: string | null; priceCents: number; currency: string; status: 'DRAFT'|'ACTIVE'|'INACTIVE'; categoryId?: string | null; sku?: string | null;
  }) {
    const db = supabaseClient('anon', jwt);
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', userId).single();
    const insert: Partial<ProductDbRow> = {
      vendor_id: vendor!.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      price_cents: payload.priceCents,
      currency: payload.currency,
      status: payload.status,
      category_id: payload.categoryId ?? null,
      sku: payload.sku ?? null,
    };
    const { data, error } = await db.from<ProductDbRow>('products').insert(insert).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async update(productId: string, jwt: string, patch: Partial<ProductDbRow>) {
    const db = supabaseClient('anon', jwt);
    const allowed: Partial<ProductDbRow> = {};
    const keys: (keyof ProductDbRow)[] = ['name','slug','description','price_cents','currency','status','category_id','sku'];
    for (const k of keys) if (k in (patch as any)) (allowed as any)[k] = (patch as any)[k];
    const { data, error } = await db.from<ProductDbRow>('products').update(allowed).eq('id', productId).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async remove(productId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { error } = await db.from('products').delete().eq('id', productId);
    if (error) throw new BadRequestError(error.message);
    return { ok: true };
  },
};
