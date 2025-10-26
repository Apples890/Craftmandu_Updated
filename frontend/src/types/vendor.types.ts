// frontend/types/vendor.types.ts
export type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

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
  status: VendorStatus;
  createdAt?: string;
  updatedAt?: string;
}
