// routes/product.routes.ts
import { Router } from 'express';
import { supabaseClient } from '@/config/database.config';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate, paginationSchema } from '@/middleware/validation.middleware';
import { z } from 'zod';

const r = Router();

// Public list & detail
r.get('/', validate({ query: paginationSchema.partial() }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(Number(req.query['limit'] || 20));
    if (error) throw error;
    res.json({ items: data });
  } catch (e) { next(e); }
});

r.get('/:slug', async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data, error } = await db.from('products').select('*').eq('slug', req.params.slug).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// Vendor-managed CRUD
const upsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.enum(['DRAFT','ACTIVE','INACTIVE']).default('ACTIVE'),
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().nullable().optional(),
});

r.use(authMiddleware, requireRole('VENDOR'));

r.post('/', validate({ body: upsertSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    // find vendor id for this user
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', req.user!.id).single();

    const payload = {
      vendor_id: vendor!.id,
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description ?? null,
      price_cents: req.body.priceCents,
      currency: req.body.currency,
      status: req.body.status,
      category_id: req.body.categoryId ?? null,
      sku: req.body.sku ?? null,
    };

    const { data, error } = await db.from('products').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

r.patch('/:id', validate({ body: upsertSchema.partial() }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const patch: any = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.slug !== undefined) patch.slug = req.body.slug;
    if (req.body.description !== undefined) patch.description = req.body.description;
    if (req.body.priceCents !== undefined) patch.price_cents = req.body.priceCents;
    if (req.body.currency !== undefined) patch.currency = req.body.currency;
    if (req.body.status !== undefined) patch.status = req.body.status;
    if (req.body.categoryId !== undefined) patch.category_id = req.body.categoryId;
    if (req.body.sku !== undefined) patch.sku = req.body.sku;

    const { data, error } = await db.from('products').update(patch).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { error } = await db.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { next(e); }
});

export default r;
