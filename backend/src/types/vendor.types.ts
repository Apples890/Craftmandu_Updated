// types/vendor.types.ts
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
