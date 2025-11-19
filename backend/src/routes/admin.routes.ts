// routes/admin.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { slugifyText } from '@/utils/slugify.utils';

const r = Router();
r.use(authMiddleware, requireRole('ADMIN'));

r.get('/stats', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const tables = ['users','vendors','products','orders','reviews','messages','notifications'];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { count, error } = await db.from(t).select('*', { count: 'exact', head: true });
      if (error) throw error;
      counts[t] = count || 0;
    }
    res.json({ counts });
  } catch (e) { next(e); }
});

// List users
r.get('/users', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db
      .from('users')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (e) { next(e); }
});

// List vendors
r.get('/vendors', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('vendors').select('id, user_id, shop_name, slug, status, created_at, updated_at').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (e) { next(e); }
});

// Update vendor status
const vendorStatusSchema = z.object({ status: z.enum(['PENDING','APPROVED','SUSPENDED']) });
r.patch('/vendors/:id/status', validate({ body: vendorStatusSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: vendor, error: vErr } = await db
      .from('vendors')
      .select('id, user_id, status, shop_name')
      .eq('id', req.params.id)
      .single();
    if (vErr) throw vErr;

    const { data, error } = await db
      .from('vendors')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select('id, user_id, status, shop_name')
      .single();
    if (error) throw error;

    if (vendor?.user_id) {
      const nextRole = req.body.status === 'APPROVED' ? 'VENDOR' : 'CUSTOMER';
      await db.from('users').update({ role: nextRole }).eq('id', vendor.user_id);
    }

    res.json(data);
  } catch (e) { next(e); }
});

// Categories management
const categorySchema = z.object({ name: z.string().min(2) });

async function generateCategorySlug(
  db: ReturnType<typeof supabaseClient>,
  name: string,
  excludeId?: string
) {
  const base = slugifyText(name, 'category');
  let candidate = base;
  let counter = 1;
  while (true) {
    const { data, error } = await db.from('categories').select('id').eq('slug', candidate).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data || data.id === excludeId) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

r.get('/categories', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db
      .from('categories')
      .select('id, name, slug, created_at, updated_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (e) { next(e); }
});

r.post('/categories', validate({ body: categorySchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const slug = await generateCategorySlug(db, req.body.name);
    const { data, error } = await db
      .from('categories')
      .insert({ name: req.body.name, slug })
      .select('id, name, slug, created_at, updated_at')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

r.patch('/categories/:id', validate({ body: categorySchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const slug = await generateCategorySlug(db, req.body.name, req.params.id);
    const { data, error } = await db
      .from('categories')
      .update({ name: req.body.name, slug })
      .eq('id', req.params.id)
      .select('id, name, slug, created_at, updated_at')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

r.delete('/categories/:id', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { error } = await db.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { next(e); }
});

// Admin analytics: daily revenue and orders for last N days
// GET /api/admin/analytics?days=30
r.get('/analytics', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const raw = Number.parseInt(String(req.query.days ?? ''), 10);
    const days = Number.isFinite(raw) && raw > 0 ? Math.min(365, raw) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data, error } = await db
      .from('orders')
      .select('id, total_cents, status, placed_at')
      .gte('placed_at', since.toISOString())
      .order('placed_at', { ascending: true });
    if (error) throw error;

    const orders = data || [];
    const revenue_cents = orders.reduce((s: number, o: any) => s + Number(o.total_cents || 0), 0);
    const by_status: Record<string, number> = {};
    for (const o of orders) { by_status[o.status] = (by_status[o.status] || 0) + 1; }
    const map: Record<string, { date: string; orders: number; revenue_cents: number }> = {};
    for (const o of orders) {
      const d = new Date(o.placed_at);
      const key = d.toISOString().slice(0,10);
      if (!map[key]) map[key] = { date: key, orders: 0, revenue_cents: 0 };
      map[key].orders += 1;
      map[key].revenue_cents += Number(o.total_cents || 0);
    }
    const series = Object.values(map).sort((a,b) => a.date.localeCompare(b.date));
    res.json({ revenue_cents, orders: orders.length, by_status, series, days });
  } catch (e) { next(e); }
});

// Create vendor profile for a user (promote to vendor)
const createVendorSchema = z.object({
  userId: z.string().uuid(),
  shopName: z.string().min(2).optional(),
  status: z.enum(['PENDING','APPROVED','SUSPENDED']).optional(),
});
r.post('/vendors/create', validate({ body: createVendorSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { userId, shopName, status } = req.body;
    const { data, error } = await db.rpc('promote_to_vendor', {
      p_user_id: userId,
      p_shop_name: shopName ?? null,
      p_status: status ?? 'PENDING',
    });
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// Delete vendor profile (and downgrade role to CUSTOMER)
r.delete('/vendors/:id', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: v, error: vErr } = await db.from('vendors').select('id, user_id').eq('id', req.params.id).single();
    if (vErr) throw vErr;
    const { error: delErr } = await db.from('vendors').delete().eq('id', req.params.id);
    if (delErr) throw delErr;
    if (v?.user_id) {
      await db.from('users').update({ role: 'CUSTOMER' }).eq('id', v.user_id);
    }
    res.status(204).send();
  } catch (e) { next(e); }
});

export default r;
