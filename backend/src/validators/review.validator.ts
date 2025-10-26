// validators/review.validator.ts
import { z } from 'zod';

export const reviewCreateSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});
