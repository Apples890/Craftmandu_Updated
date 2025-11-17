// routes/review.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { requireNotBanned } from '@/middleware/moderation.middleware';

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

// Public: list reviews by product slug
r.get('/product/slug/:slug', async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data: p, error: pErr } = await db.from('products').select('id').eq('slug', req.params.slug).single();
    if (pErr || !p) { res.json({ reviews: [] }); return; }
    const { data, error } = await db.from('reviews').select('*').eq('product_id', p.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch (e) { next(e); }
});

// Auth: create review if customer purchased and delivered (enforced by RLS ideally)
const createSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).nullable().optional(),
  orderId: z.string().uuid().optional(),
});
r.post('/', authMiddleware, requireNotBanned(), validate({ body: createSchema }), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const dbSrv = supabaseClient('service');
    let orderId: string | undefined = req.body.orderId as string | undefined;
    if (!orderId) {
      const { data: list } = await dbSrv
        .from('order_items')
        .select('order_id, orders!inner(customer_id, status)')
        .eq('product_id', req.body.productId)
        .order('order_id', { ascending: false })
        .limit(20);
      const match = (list || []).find((row: any) => row.orders?.customer_id === userId && row.orders?.status === 'DELIVERED');
      orderId = match?.order_id;
    }
    if (!orderId) { return res.status(400).json({ error: 'No eligible delivered order found for this product' }); }
    const db = supabaseClient('anon', req.user!.jwt);
    const payload: any = {
      order_id: orderId,
      product_id: req.body.productId,
      customer_id: userId,
      rating: req.body.rating,
      comment: req.body.comment ?? null,
      title: req.body.title ?? null,
    };
    const { data, error } = await db.from('reviews').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

export default r;
