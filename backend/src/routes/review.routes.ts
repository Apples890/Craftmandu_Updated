// routes/review.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';

const r = Router();

const replySchema = z.object({ reply: z.string().min(2).max(2000) });

function buildSummary(rows: any[] = []) {
  const breakdown: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  if (!rows.length) {
    return { count: 0, averageRating: 0, breakdown };
  }
  let sum = 0;
  for (const item of rows) {
    const rating = Math.min(5, Math.max(1, Number(item.rating) || 0));
    sum += rating;
    const key = String(rating);
    breakdown[key] = (breakdown[key] || 0) + 1;
  }
  const avg = Math.round((sum / rows.length) * 10) / 10;
  return { count: rows.length, averageRating: avg, breakdown };
}

async function fetchReviewsByProduct(productId: string) {
  const db = supabaseClient('anon');
  const { data, error } = await db
    .from('reviews')
    .select('id, order_id, product_id, customer_id, rating, title, comment, vendor_reply, vendor_reply_at, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Public: list reviews for a product
r.get('/product/:productId', async (req, res, next) => {
  try {
    const rows = await fetchReviewsByProduct(req.params.productId);
    res.json({ reviews: rows, summary: buildSummary(rows) });
  } catch (e) { next(e); }
});

// Public: list reviews by product slug
r.get('/product/slug/:slug', async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data: product, error } = await db.from('products').select('id').eq('slug', req.params.slug).maybeSingle();
    if (error) throw error;
    if (!product?.id) { res.json({ reviews: [] }); return; }
    const rows = await fetchReviewsByProduct(product.id);
    res.json({ reviews: rows, summary: buildSummary(rows) });
  } catch (e) { next(e); }
});

// Auth: create review if customer purchased and delivered
const createSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).nullable().optional(),
  orderId: z.string().uuid().optional(),
});
r.post('/', authMiddleware, validate({ body: createSchema }), async (req, res, next) => {
  try {
    if (String(req.user?.role || '').toUpperCase() !== 'CUSTOMER') {
      res.status(403).json({ error: 'Only customers can leave reviews' });
      return;
    }
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
    if (!orderId) { res.status(400).json({ error: 'No eligible delivered order found for this product' }); return; }
    const db = supabaseClient('anon', req.user!.jwt);
    const payload: any = {
      order_id: orderId,
      product_id: req.body.productId,
      customer_id: userId,
      rating: Math.min(5, Math.max(1, req.body.rating ?? 5)),
      title: req.body.title ?? null,
      comment: req.body.comment ?? null,
    };
    const { data, error } = await db.from('reviews').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// Vendor: view all reviews for their products
r.get('/vendor', authMiddleware, requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (!vendor) { res.json({ reviews: [] }); return; }
    const { data, error } = await db
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        vendor_reply,
        vendor_reply_at,
        created_at,
        product:products!inner(id,name,slug),
        customer:users!reviews_customer_id_fkey(id, full_name, email)
      `)
      .eq('product.vendor_id', vendor.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reviews: data || [] });
  } catch (e) { next(e); }
});

// Vendor: reply to a review
r.post('/:id/reply', authMiddleware, requireRole('VENDOR'), validate({ body: replySchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (!vendor) { res.status(403).json({ error: 'Vendor profile not found' }); return; }
    const { data: review, error: reviewErr } = await db.from('reviews').select('id, product_id').eq('id', req.params.id).maybeSingle();
    if (reviewErr || !review) { res.status(404).json({ error: 'Review not found' }); return; }
    const { data: product, error: productErr } = await db.from('products').select('vendor_id').eq('id', review.product_id).maybeSingle();
    if (productErr || !product || product.vendor_id !== vendor.id) { res.status(403).json({ error: 'Not authorized to reply to this review' }); return; }
    const { data, error } = await db
      .from('reviews')
      .update({ vendor_reply: req.body.reply.trim(), vendor_reply_at: new Date().toISOString() })
      .eq('id', review.id)
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
