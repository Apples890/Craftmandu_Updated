import { api } from '@/utils/api.client';

export type VendorProductPayload = {
  name: string;
  slug: string;
  description?: string | null;
  price: number; // major units
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
};

export const VendorProductsApi = {
  async listMine() {
    const res = await api.get('/api/products/mine');
    return res.data?.items || [];
  },
  async create(p: VendorProductPayload) {
    const res = await api.post('/api/products', {
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      priceCents: Math.round((p.price || 0) * 100),
      status: p.status,
    });
    return res.data;
  },
  async update(id: string, p: Partial<VendorProductPayload>) {
    const body: any = {};
    if (p.name !== undefined) body.name = p.name;
    if (p.slug !== undefined) body.slug = p.slug;
    if (p.description !== undefined) body.description = p.description;
    if (p.price !== undefined) body.priceCents = Math.round((p.price || 0) * 100);
    if (p.status !== undefined) body.status = p.status;
    const res = await api.patch(`/api/products/${id}`, body);
    return res.data;
  },
  async remove(id: string) {
    await api.delete(`/api/products/${id}`);
  },
  async uploadImage(productId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/api/products/${productId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.image;
  },
};

