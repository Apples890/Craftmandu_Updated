// api/product.api.ts
import { request } from './_base';

export type ProductCreate = {
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  categoryId?: string | null;
  sku?: string | null;
};

export type ProductUpdate = Partial<ProductCreate>;

export const ProductApi = {
  list(limit = 20) {
    const query = new URLSearchParams({ limit: String(limit) }).toString();
    return request<{ items: any[] }>(`/api/products?${query}`);
  },
  getBySlug(slug: string) {
    return request<any>(`/api/products/${encodeURIComponent(slug)}`);
  },
  create(token: string, payload: ProductCreate) {
    return request<any>('/api/products', 'POST', payload, token);
  },
  update(token: string, id: string, patch: ProductUpdate) {
    return request<any>(`/api/products/${id}`, 'PATCH', patch, token);
  },
  remove(token: string, id: string) {
    return request<void>(`/api/products/${id}`, 'DELETE', undefined, token);
  },
};
