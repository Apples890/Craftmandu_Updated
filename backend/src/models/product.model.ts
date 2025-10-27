// models/product.model.ts
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

export interface Tag {
  id: string;
  name: string;
}

export interface ProductTagDbRow {
  product_id: string;
  tag_id: string;
}

export interface ProductTag {
  productId: string;
  tagId: string;
}

export const ProductModel = {
  fromDb: (r: ProductDbRow): Product => ({
    id: r.id,
    vendorId: r.vendor_id,
    categoryId: r.category_id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    priceCents: r.price_cents,
    currency: r.currency,
    status: r.status,
    sku: r.sku,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }),
  toDb: (p: Partial<Product>): Partial<ProductDbRow> => ({
    id: p.id,
    vendor_id: p.vendorId,
    category_id: p.categoryId ?? null,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    price_cents: p.priceCents,
    currency: p.currency,
    status: p.status,
    sku: p.sku ?? null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }),
};

export const VariantModel = {
  fromDb: (r: ProductVariantDbRow): ProductVariant => ({
    id: r.id,
    productId: r.product_id,
    name: r.name,
    sku: r.sku,
    priceCents: r.price_cents ?? null,
  }),
  toDb: (v: Partial<ProductVariant>): Partial<ProductVariantDbRow> => ({
    id: v.id,
    product_id: v.productId,
    name: v.name!,
    sku: v.sku ?? null,
    price_cents: v.priceCents ?? null,
  }),
};

export const InventoryModel = {
  fromDb: (r: InventoryDbRow): Inventory => ({
    id: r.id,
    productId: r.product_id,
    variantId: r.variant_id,
    qtyAvailable: r.qty_available,
  }),
  toDb: (i: Partial<Inventory>): Partial<InventoryDbRow> => ({
    id: i.id,
    product_id: i.productId ?? null,
    variant_id: i.variantId ?? null,
    qty_available: i.qtyAvailable!,
  }),
};

export const ProductImageModel = {
  fromDb: (r: ProductImageDbRow): ProductImage => ({
    id: r.id,
    productId: r.product_id,
    imageUrl: r.image_url,
    sortOrder: r.sort_order,
  }),
  toDb: (img: Partial<ProductImage>): Partial<ProductImageDbRow> => ({
    id: img.id,
    product_id: img.productId!,
    image_url: img.imageUrl!,
    sort_order: img.sortOrder ?? 0,
  }),
};

export const TagModel = {
  fromDb: (r: TagDbRow): Tag => ({ id: r.id, name: r.name }),
  toDb: (t: Partial<Tag>): Partial<TagDbRow> => ({ id: t.id, name: t.name! }),
};

export const ProductTagModel = {
  fromDb: (r: ProductTagDbRow): ProductTag => ({
    productId: r.product_id,
    tagId: r.tag_id,
  }),
  toDb: (pt: Partial<ProductTag>): Partial<ProductTagDbRow> => ({
    product_id: pt.productId!,
    tag_id: pt.tagId!,
  }),
};
