// frontend/types/product.types.ts
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  vendorId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  status: ProductStatus;
  sku?: string | null;
  images?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
}
