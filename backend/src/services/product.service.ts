// services/product.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError, NotFoundError } from '@/utils/error.utils';
import type { ProductDbRow, ProductFilters} from '@/types/product.types';


export const ProductService = {
async list(filters: ProductFilters = {}, limit = 50) {
  const db = supabaseClient('anon');

  let query = db
    .from('products')
    .select('*')
    .eq('status', 'ACTIVE');

  // Search
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Category
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  // Price filter
  if (filters.minPrice !== undefined) {
    query = query.gte('price_cents', filters.minPrice * 100);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_cents', filters.maxPrice * 100);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price':
      query = query.order('price_cents', { ascending: true });
      break;
    case 'rating':
      query = query.order('avg_rating', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query.limit(limit);
  if (error) throw new BadRequestError(error.message);

  return data;
},

  async getProducts(filters?: ProductFilters) {
      const safeFilters = filters || {}; // default to empty object
  const params: any = { limit: 50 };

    Object.entries(safeFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error("Failed");

    return res.json();
  },


  async getBySlug(slug: string) {
    const db = supabaseClient('anon');
    const { data, error } = await db.from('products').select('*').eq('slug', slug).single();
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
    const { data, error } = await db.from('products').insert(insert).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async update(productId: string, jwt: string, patch: Partial<ProductDbRow>) {
    const db = supabaseClient('anon', jwt);
    const allowed: Partial<ProductDbRow> = {};
    const keys: (keyof ProductDbRow)[] = ['name','slug','description','price_cents','currency','status','category_id','sku'];
    for (const k of keys) if (k in (patch as any)) (allowed as any)[k] = (patch as any)[k];
    const { data, error } = await db.from('products').update(allowed).eq('id', productId).select('*').single();
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
