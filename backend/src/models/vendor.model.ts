// models/vendor.model.ts
export type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export interface VendorDbRow {
  id: string;
  user_id: string;
  shop_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  status: VendorStatus;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  userId: string;
  shopName: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
  status: VendorStatus;
  verificationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const VendorModel = {
  fromDb: (r: VendorDbRow): Vendor => ({
    id: r.id,
    userId: r.user_id,
    shopName: r.shop_name,
    slug: r.slug,
    description: r.description,
    logoUrl: r.logo_url,
    bannerUrl: r.banner_url,
    addressLine1: r.address_line1,
    addressLine2: r.address_line2,
    city: r.city,
    country: r.country,
    taxId: r.tax_id,
    status: r.status,
    verificationNotes: r.verification_notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }),
  toDb: (v: Partial<Vendor>): Partial<VendorDbRow> => ({
    id: v.id,
    user_id: v.userId,
    shop_name: v.shopName,
    slug: v.slug,
    description: v.description ?? null,
    logo_url: v.logoUrl ?? null,
    banner_url: v.bannerUrl ?? null,
    address_line1: v.addressLine1 ?? null,
    address_line2: v.addressLine2 ?? null,
    city: v.city ?? null,
    country: v.country ?? null,
    tax_id: v.taxId ?? null,
    status: v.status,
    verification_notes: v.verificationNotes ?? null,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  }),
};
