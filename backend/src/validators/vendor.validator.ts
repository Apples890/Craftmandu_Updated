// validators/vendor.validator.ts
import { z } from 'zod';

export const vendorCreateSchema = z.object({
  shopName: z.string().min(2).max(120),
  description: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
});

export const vendorUpdateSchema = vendorCreateSchema.partial();
