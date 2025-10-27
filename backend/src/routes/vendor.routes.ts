// routes/vendor.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validation.middleware';
import { z } from 'zod';
import { supabaseClient } from '@/config/database.config';
import { uploadSingleImage } from '@/middleware/upload.middleware';

const r = Router();

// Public vendor detail by slug
r.get('/slug/:slug', async (req, res, next) => {
  try {
    const db = supabaseClient('anon');
    const { data, error } = await db.from('vendors').select('*').eq('slug', req.params.slug).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// Vendor self endpoints
r.use(authMiddleware, requireRole('VENDOR'));

r.get('/me', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('vendors').select('*').eq('user_id', req.user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

const updateSchema = z.object({
  shopName: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  addressLine1: z.string().max(200).nullable().optional(),
  addressLine2: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
});
r.patch('/me', validate({ body: updateSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const payload: any = {};
    if (req.body.shopName !== undefined) payload.shop_name = req.body.shopName;
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.logoUrl !== undefined) payload.logo_url = req.body.logoUrl;
    if (req.body.bannerUrl !== undefined) payload.banner_url = req.body.bannerUrl;
    if (req.body.addressLine1 !== undefined) payload.address_line1 = req.body.addressLine1;
    if (req.body.addressLine2 !== undefined) payload.address_line2 = req.body.addressLine2;
    if (req.body.city !== undefined) payload.city = req.body.city;
    if (req.body.country !== undefined) payload.country = req.body.country;

    const { data, error } = await db.from('vendors').update(payload).eq('user_id', req.user!.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// Upload logo image, store in vendor-assets bucket and update logo_url
r.post('/logo', uploadSingleImage, async (req, res, next) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Missing file' }); return; }
    const db = supabaseClient('service');
    const { data: vendor, error } = await db.from('vendors').select('id').eq('user_id', req.user!.id).single();
    if (error || !vendor) { res.status(404).json({ error: 'Vendor not found' }); return; }
    const bucket = 'vendor-assets';
    try { await (db as any).storage.createBucket(bucket, { public: true }); } catch {}
    const vendorId = vendor.id;
    const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
    const filename = `logo_${Date.now()}.${ext}`;
    const path = `vendors/${vendorId}/${filename}`;
    const uploadRes = await (db as any).storage.from(bucket).upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    if (uploadRes.error) throw uploadRes.error;
    const { data: pub } = (db as any).storage.from(bucket).getPublicUrl(path);
    const publicUrl: string | undefined = pub?.publicUrl;
    const { data: updated, error: updErr } = await db.from('vendors').update({ logo_url: publicUrl || null }).eq('id', vendorId).select('*').single();
    if (updErr) throw updErr;
    res.json({ url: publicUrl, vendor: updated });
  } catch (e) { next(e); }
});

// Upload banner image
r.post('/banner', uploadSingleImage, async (req, res, next) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Missing file' }); return; }
    const db = supabaseClient('service');
    const { data: vendor, error } = await db.from('vendors').select('id').eq('user_id', req.user!.id).single();
    if (error || !vendor) { res.status(404).json({ error: 'Vendor not found' }); return; }
    const bucket = 'vendor-assets';
    try { await (db as any).storage.createBucket(bucket, { public: true }); } catch {}
    const vendorId = vendor.id;
    const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
    const filename = `banner_${Date.now()}.${ext}`;
    const path = `vendors/${vendorId}/${filename}`;
    const uploadRes = await (db as any).storage.from(bucket).upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true });
    if (uploadRes.error) throw uploadRes.error;
    const { data: pub } = (db as any).storage.from(bucket).getPublicUrl(path);
    const publicUrl: string | undefined = pub?.publicUrl;
    const { data: updated, error: updErr } = await db.from('vendors').update({ banner_url: publicUrl || null }).eq('id', vendorId).select('*').single();
    if (updErr) throw updErr;
    res.json({ url: publicUrl, vendor: updated });
  } catch (e) { next(e); }
});

export default r;
