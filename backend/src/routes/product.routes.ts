// routes/product.routes.ts
import { Router } from 'express';
import { supabaseClient } from '@/config/database.config';
import { hashPassword } from '@/utils/hash.utils';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate, paginationSchema } from '@/middleware/validation.middleware';
import { z } from 'zod';
import { uploadSingleImage } from '@/middleware/upload.middleware';

const r = Router();

// Dev-only seeding endpoint to create a demo vendor and sample products
if (process.env.NODE_ENV !== 'production') {
  r.post('/seed', async (_req, res, next) => {
    try {
      const db = supabaseClient('service');
      // Upsert demo vendor user
      const email = 'demo.vendor@example.com';
      const full_name = 'Demo Vendor';
      const password_hash = await hashPassword('Secret123!');
      const { data: userRow } = await db
        .from('users')
        .upsert({ email, full_name, role: 'VENDOR', password_hash }, { onConflict: 'email' })
        .select('*')
        .single();

      // Upsert vendor
      const shop_name = 'Demo Crafts Shop';
      const slug = 'demo-crafts-shop';
      const { data: vendorRow } = await db
        .from('vendors')
        .upsert({ user_id: userRow!.id, shop_name, slug, description: 'Handmade demo items' }, { onConflict: 'user_id' })
        .select('*')
        .single();

      // Ensure a category exists
      const catName = 'Home & Kitchen';
      let categoryId: string | null = null;
      const { data: cat } = await db.from('categories').select('id').eq('name', catName).maybeSingle();
      if (cat?.id) categoryId = cat.id;

      // Sample products
      const samples = [
        {
          name: 'Handwoven Table Runner', slug: 'handwoven-table-runner', description: 'Beautiful handwoven cotton table runner.', price_cents: 3499,
          images: ['https://images.unsplash.com/photo-1523419409543-a6d49002b6aa?q=80&w=800&auto=format&fit=crop'],
        },
        {
          name: 'Carved Wooden Bowl', slug: 'carved-wooden-bowl', description: 'Sustainably sourced carved wooden bowl.', price_cents: 2599,
          images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop'],
        },
        {
          name: 'Ceramic Mug Set', slug: 'ceramic-mug-set', description: 'Set of two hand-glazed ceramic mugs.', price_cents: 2999,
          images: ['https://images.unsplash.com/photo-1519165431625-342a8d1bf8d2?q=80&w=800&auto=format&fit=crop'],
        },
      ];

      let created = 0;
      for (const s of samples) {
        // Upsert product
        const { data: prod } = await db
          .from('products')
          .upsert({
            vendor_id: vendorRow!.id,
            category_id: categoryId,
            name: s.name,
            slug: s.slug,
            description: s.description,
            price_cents: s.price_cents,
            currency: 'USD',
            status: 'ACTIVE',
          }, { onConflict: 'slug' })
          .select('*')
          .single();
        if (!prod) continue;
        created++;
        // Images
        await db.from('product_images').delete().eq('product_id', prod.id);
        const rows = s.images.map((u, idx) => ({ product_id: prod.id, image_url: u, sort_order: idx }));
        if (rows.length) await db.from('product_images').insert(rows);
        // Inventory
        const { data: inv } = await db.from('inventory').select('id').eq('product_id', prod.id).maybeSingle();
        if (!inv) await db.from('inventory').insert({ product_id: prod.id, qty_available: 25 });
      }

      res.json({ ok: true, vendor: vendorRow, created });
    } catch (e) { next(e); }
  });
}
// Public list with filters
r.get('/', validate({ query: paginationSchema.partial() }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const limit = Number(req.query['limit'] || 20);
    const search = (req.query['search'] as string | undefined)?.trim();
    const category = (req.query['category'] as string | undefined)?.trim(); // slug
    const minCents = req.query['minPriceCents'] ? Number(req.query['minPriceCents']) : undefined;
    const maxCents = req.query['maxPriceCents'] ? Number(req.query['maxPriceCents']) : undefined;
    const sortBy = (req.query['sortBy'] as string | undefined) || 'newest';

    let q = db
      .from('products')
      .select('id, vendor_id, category_id, name, slug, description, price_cents, currency, status, created_at, updated_at, product_images(image_url, sort_order)')
      .eq('status', 'ACTIVE');

    if (search) {
      const term = `%${search}%`;
      // match against name, description, and slug for better keyword coverage
      q = q.or(`(name.ilike.${term},description.ilike.${term},slug.ilike.${term})`);
    }
    if (category) {
      // find category id by slug
      const { data: cat } = await db.from('categories').select('id').eq('slug', category).maybeSingle();
      if (cat?.id) q = q.eq('category_id', cat.id);
      else q = q.eq('category_id', null); // no matches
    }
    if (minCents !== undefined) q = q.gte('price_cents', minCents);
    if (maxCents !== undefined) q = q.lte('price_cents', maxCents);

    if (sortBy === 'price') q = q.order('price_cents', { ascending: true });
    else q = q.order('created_at', { ascending: false });

    q = q.limit(limit);

    const { data, error } = await q;
    if (error) throw error;

    const vendorIds = Array.from(new Set((data || []).map((d: any) => d.vendor_id).filter(Boolean)));
    const categoryIds = Array.from(new Set((data || []).map((d: any) => d.category_id).filter(Boolean)));
    const vendorMap: Record<string, any> = {};
    const catMap: Record<string, any> = {};
    if (vendorIds.length) {
      const { data: vrows } = await db.from('vendors').select('id, shop_name, slug').in('id', vendorIds);
      (vrows || []).forEach((v: any) => (vendorMap[v.id] = v));
    }
    if (categoryIds.length) {
      const { data: crows } = await db.from('categories').select('id, name, slug').in('id', categoryIds);
      (crows || []).forEach((c: any) => (catMap[c.id] = c));
    }

    const items = (data || []).map((d: any) => {
      const firstImg = (d.product_images && d.product_images[0]?.image_url) || null;
      return {
        ...d,
        vendor: vendorMap[d.vendor_id] || null,
        category: catMap[d.category_id] || null,
        image_url: firstImg,
      };
    });
    res.json({ items });
  } catch (e) { next(e); }
});

// Public categories list
r.get('/categories', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('categories').select('id, name, slug').order('name');
    if (error) throw error;
    res.json({ items: data || [] });
  } catch (e) { next(e); }
});

// detail route moved below vendor routes to prevent '/mine' matching ':slug'

// Vendor-managed CRUD
const upsertSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.enum(['DRAFT','ACTIVE','INACTIVE']).default('ACTIVE'),
  categoryId: z.string().uuid().nullable().optional(),
});

r.get('/mine', authMiddleware, requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (!vendor) { res.json({ items: [] }); return; }
    const { data, error } = await db
      .from('products')
      .select('id, name, slug, description, price_cents, currency, status, created_at, updated_at, product_images(image_url, sort_order)')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ items: data });
  } catch (e) { next(e); }
});

r.post('/', authMiddleware, requireRole('VENDOR'), validate({ body: upsertSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
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
    };

    const { data, error } = await db.from('products').insert(payload).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

r.patch('/:id', authMiddleware, requireRole('VENDOR'), validate({ body: upsertSchema.partial() }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const patch: any = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.slug !== undefined) patch.slug = req.body.slug;
    if (req.body.description !== undefined) patch.description = req.body.description;
    if (req.body.priceCents !== undefined) patch.price_cents = req.body.priceCents;
    if (req.body.currency !== undefined) patch.currency = req.body.currency;
    if (req.body.status !== undefined) patch.status = req.body.status;
    if (req.body.categoryId !== undefined) patch.category_id = req.body.categoryId;

    const { data, error } = await db.from('products').update(patch).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

r.delete('/:id', authMiddleware, requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { error } = await db.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { next(e); }
});

r.post('/:id/images', authMiddleware, requireRole('VENDOR'), uploadSingleImage, async (req, res, next) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Missing file' }); return; }
    const db = supabaseClient('service');
    const productId = req.params.id;
    const { data: vendor } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    const { data: prod } = await db.from('products').select('id, vendor_id').eq('id', productId).maybeSingle();
    if (!vendor || !prod || prod.vendor_id !== vendor.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    const bucket = 'product-assets';
    try { await (db as any).storage.createBucket(bucket, { public: true }); } catch {}
    const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
    const filename = `img_${Date.now()}.${ext}`;
    const path = `products/${productId}/${filename}`;
    const uploadRes = await (db as any).storage.from(bucket).upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    if (uploadRes.error) throw uploadRes.error;
    const { data: pub } = (db as any).storage.from(bucket).getPublicUrl(path);
    const url: string | undefined = pub?.publicUrl;
    const { data: existing } = await db.from('product_images').select('sort_order').eq('product_id', productId).order('sort_order', { ascending: false }).limit(1);
    const nextOrder = existing && existing[0] ? (existing[0].sort_order as number) + 1 : 0;
    const { data: row, error: insErr } = await db
      .from('product_images')
      .insert({ product_id: productId, image_url: url || '', sort_order: nextOrder })
      .select('*')
      .single();
    if (insErr) throw insErr;
    res.json({ image: row });
  } catch (e) { next(e); }
});

// Public detail (placed after vendor routes)
r.get('/:slug', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: prod, error } = await db.from('products').select('*').eq('slug', req.params.slug).maybeSingle();
    if (error || !prod) { res.status(404).json({ error: 'Product not found' }); return; }

    const [{ data: imgs }, { data: inv }, { data: vend }, { data: cat }] = await Promise.all([
      db.from('product_images').select('image_url, sort_order').eq('product_id', prod.id).order('sort_order', { ascending: true }),
      db.from('inventory').select('qty_available').eq('product_id', prod.id).limit(1),
      db.from('vendors').select('id, shop_name, slug').eq('id', prod.vendor_id).maybeSingle(),
      db.from('categories').select('id, name, slug').eq('id', prod.category_id).maybeSingle(),
    ]);

    const images = (imgs || []).map((r: any) => r.image_url);
    const qty = inv && inv[0] ? inv[0].qty_available : 0;
    const vendor = vend || null;
    const category = cat || null;

    res.json({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      description: prod.description,
      price_cents: prod.price_cents,
      currency: prod.currency,
      status: prod.status,
      created_at: prod.created_at,
      updated_at: prod.updated_at,
      images,
      vendor,
      category,
      inventory: { qty_available: qty },
    });
  } catch (e) { next(e); }
});

export default r;
