// types/product.types.ts
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export interface ProductDbRow {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: ProductStatus;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantDbRow {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_cents: number | null;
}
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  priceCents?: number | null;
}

export interface InventoryDbRow {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  qty_available: number;
}
export interface Inventory {
  id: string;
  productId?: string | null;
  variantId?: string | null;
  qtyAvailable: number;
}

export interface ProductImageDbRow {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface TagDbRow {
  id: string;
  name: string;
}
export interface Tag { id: string; name: string; }

export interface ProductTagDbRow {
  product_id: string;
  tag_id: string;
}
export interface ProductTag {
  productId: string;
  tagId: string;
}
