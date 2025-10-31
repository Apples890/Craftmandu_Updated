// routes/order.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { requireNotBanned, requireCan } from '@/middleware/moderation.middleware';
import { requireRole } from '@/middleware/role.middleware';

const r = Router();
r.use(authMiddleware);

// Checkout: create one order per vendor from cart items
const checkoutSchema = z.object({
  items: z.array(z.object({ product: z.string().min(1), qty: z.number().int().min(1) })).min(1),
  shipping: z.object({ address: z.string().min(1), province: z.string().min(1), district: z.string().min(1) }),
  payment: z.object({ method: z.enum(['COD','WALLET']), wallet: z.enum(['ESEWA','KHALTI']).optional() }),
});

r.post('/checkout', requireNotBanned(), requireCan('order'), validate({ body: checkoutSchema }), async (req, res, next): Promise<void> => {
  try {
    const db = supabaseClient('service');
    const items: Array<{ product: string; qty: number }> = req.body.items || [];
    const uuidRe = /^[0-9a-fA-F-]{36}$/;
    const ids = items.map(i => i.product).filter((p) => uuidRe.test(p));
    const slugs = items.map(i => i.product).filter((p) => !uuidRe.test(p));

    const productMap: Record<string, any> = {};
    if (slugs.length) {
      const { data: bySlug } = await db.from('products').select('id, slug, vendor_id, name, price_cents').in('slug', slugs);
      (bySlug || []).forEach((p: any) => { productMap[p.slug] = p; });
    }
    if (ids.length) {
      const { data: byId } = await db.from('products').select('id, slug, vendor_id, name, price_cents').in('id', ids);
      (byId || []).forEach((p: any) => { productMap[p.id] = p; });
    }

    type Line = { prod: any; qty: number };
    const byVendor: Record<string, Line[]> = {};
    for (const it of items) {
      const prod = productMap[it.product];
      if (!prod) { res.status(400).json({ error: `Invalid product: ${it.product}` }); return; }
      const v = prod.vendor_id as string;
      byVendor[v] = byVendor[v] || [];
      byVendor[v].push({ prod, qty: it.qty });
    }

    const created: any[] = [];
    for (const [vendorId, lines] of Object.entries(byVendor)) {
      const subtotal = lines.reduce((sum, l) => sum + (Number(l.prod.price_cents || 0) * l.qty), 0);
      const shipping = 0;
      const tax = 0;
      const { data: numRow } = await db.rpc('generate_order_number');
      const order_number: string | null = (Array.isArray(numRow) ? (numRow as any)[0] : (numRow as any)) || null;
      const { data: order, error: insErr } = await db
        .from('orders')
        .insert({
          order_number,
          customer_id: req.user!.id,
          vendor_id: vendorId,
          status: 'PENDING',
          subtotal_cents: subtotal,
          shipping_cents: shipping,
          tax_cents: tax,
          currency: 'NPR',
          shipping_address_json: req.body.shipping,
        })
        .select('*')
        .single();
      if (insErr) throw insErr;

      const rows = lines.map((l) => ({
        order_id: order!.id,
        product_id: l.prod.id,
        name_snapshot: l.prod.name,
        sku_snapshot: null,
        unit_price_cents: Number(l.prod.price_cents || 0),
        qty: l.qty,
        line_total_cents: Number(l.prod.price_cents || 0) * l.qty,
      }));
      const { error: itemErr } = await db.from('order_items').insert(rows);
      if (itemErr) throw itemErr;
      created.push(order);
    }

    res.status(201).json({ orders: created, count: created.length });
  } catch (e) { next(e); }
});
// Customer orders
r.get('/me', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
  const { data, error } = await db
      .from('orders')
      .select('id, order_number, customer_id, vendor_id, status, subtotal_cents, shipping_cents, tax_cents, total_cents, currency, placed_at, tracking_number')
      .eq('customer_id', req.user!.id)
      .order('placed_at', { ascending: false });
    if (error) throw error;

    const orders = data || [];
    const ids = orders.map((o: any) => o.id);
    if (!ids.length) { res.json({ orders }); return; }

    const { data: items } = await db
      .from('order_items')
      .select('order_id, line_total_cents')
      .in('order_id', ids);
    const sumMap: Record<string, number> = {};
    (items || []).forEach((it: any) => {
      sumMap[it.order_id] = (sumMap[it.order_id] || 0) + (it.line_total_cents || 0);
    });

    const enriched = orders.map((o: any) => {
      const itemSum = sumMap[o.id] || 0;
      const subtotal = typeof o.subtotal_cents === 'number' && o.subtotal_cents > 0 ? o.subtotal_cents : itemSum;
      const shipping = o.shipping_cents || 0;
      const tax = o.tax_cents || 0;
      const total = typeof o.total_cents === 'number' && o.total_cents > 0 ? o.total_cents : (subtotal + shipping + tax);
      return { ...o, subtotal_cents: subtotal, total_cents: total };
    });

    res.json({ orders: enriched });
  } catch (e) { next(e); }
});

// Vendor orders
r.get('/vendor', requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: v } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (!v) { res.json({ orders: [] }); return; }
    const { data, error } = await db
      .from('orders')
      .select('id, order_number, customer_id, vendor_id, status, subtotal_cents, shipping_cents, tax_cents, total_cents, currency, placed_at, tracking_number')
      .eq('vendor_id', v.id)
      .order('placed_at', { ascending: false });
    if (error) throw error;

    const orders = data || [];
    const ids = orders.map((o: any) => o.id);
    if (!ids.length) { res.json({ orders }); return; }

    const { data: items } = await db
      .from('order_items')
      .select('order_id, line_total_cents')
      .in('order_id', ids);
    const sumMap: Record<string, number> = {};
    (items || []).forEach((it: any) => {
      sumMap[it.order_id] = (sumMap[it.order_id] || 0) + (it.line_total_cents || 0);
    });

    const enriched = orders.map((o: any) => {
      const itemSum = sumMap[o.id] || 0;
      const subtotal = typeof o.subtotal_cents === 'number' && o.subtotal_cents > 0 ? o.subtotal_cents : itemSum;
      const shipping = o.shipping_cents || 0;
      const tax = o.tax_cents || 0;
      const total = typeof o.total_cents === 'number' && o.total_cents > 0 ? o.total_cents : (subtotal + shipping + tax);
      return { ...o, subtotal_cents: subtotal, total_cents: total };
    });

    res.json({ orders: enriched });
  } catch (e) { next(e); }
});

const statusSchema = z.object({ status: z.enum(['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED']) });
r.patch('/:id/status', requireRole('VENDOR'), validate({ body: statusSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('orders').update({ status: req.body.status }).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
// Vendor sales summary (revenue + counts) with optional day window
// GET /api/orders/vendor/summary?days=30
r.get('/vendor/summary', requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));
    const { data: v } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (!v) { res.json({ revenue_cents: 0, orders: 0, by_status: {}, series: [] }); return; }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { data, error } = await db
      .from('orders')
      .select('id, total_cents, status, placed_at')
      .eq('vendor_id', v.id)
      .gte('placed_at', since.toISOString())
      .order('placed_at', { ascending: true });
    if (error) throw error;

    const orders = data || [];
    const revenue_cents = orders.reduce((s: number, o: any) => s + Number(o.total_cents || 0), 0);
    const by_status: Record<string, number> = {};
    for (const o of orders) { by_status[o.status] = (by_status[o.status] || 0) + 1; }
    // Series by day
    const map: Record<string, { date: string; orders: number; revenue_cents: number }> = {};
    for (const o of orders) {
      const d = new Date(o.placed_at);
      const key = d.toISOString().slice(0,10);
      if (!map[key]) map[key] = { date: key, orders: 0, revenue_cents: 0 };
      map[key].orders += 1;
      map[key].revenue_cents += Number(o.total_cents || 0);
    }
    const series = Object.values(map).sort((a,b) => a.date.localeCompare(b.date));
    res.json({ revenue_cents, orders: orders.length, by_status, series });
  } catch (e) { next(e); }
});
