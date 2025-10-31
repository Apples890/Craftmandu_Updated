// routes/review.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { requireNotBanned, requireCan } from '@/middleware/moderation.middleware';

const r = Router();

// Public: list reviews for a product
r.get('/product/:productId', async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data, error } = await db.from('reviews').select('*').eq('product_id', req.params.productId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch (e) { next(e); }
});

// Auth: create review if customer purchased and delivered (enforced by RLS ideally)
const createSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});
r.post('/', authMiddleware, requireNotBanned(), requireCan('review'), validate({ body: createSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const payload = {
      order_id: req.body.orderId,
      product_id: req.body.productId,
      customer_id: req.user!.id,
      rating: req.body.rating,
      comment: req.body.comment ?? null,
    };
    const { data, error } = await db.from('reviews').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

export default r;
