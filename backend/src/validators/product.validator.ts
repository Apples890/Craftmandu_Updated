// validators/product.validator.ts
import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3),
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().nullable().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();
