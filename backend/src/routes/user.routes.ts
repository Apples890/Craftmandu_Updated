// routes/user.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { z } from 'zod';
import { supabaseClient } from '@/config/database.config';
import { uploadSingleImage } from '@/middleware/upload.middleware';
import { comparePassword, hashPassword } from '@/utils/hash.utils';

const r = Router();
r.use(authMiddleware);

r.get('/profile', async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('users').select('*').eq('id', req.user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

const updateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(30).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
r.patch('/profile', validate({ body: updateSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const payload: any = {};
    if (req.body.fullName !== undefined) payload.full_name = req.body.fullName;
    if (req.body.phone !== undefined) payload.phone = req.body.phone;
    if (req.body.avatarUrl !== undefined) payload.avatar_url = req.body.avatarUrl;

    const { data, error } = await db.from('users').update(payload).eq('id', req.user!.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// Upload avatar to Supabase Storage and update user.avatar_url
r.post('/avatar', uploadSingleImage, async (req, res, next) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Missing file' }); return; }
    const storage = supabaseClient('service');
    const bucket = 'avatars';
    // Ensure bucket exists (ignore if already exists)
    try { await (storage as any).storage.createBucket(bucket, { public: true }); } catch {}

    const userId = req.user!.id;
    const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
    const path = `users/${userId}/${filename}`;

    const uploadRes = await (storage as any).storage.from(bucket).upload(path, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (uploadRes.error) throw uploadRes.error;

    const { data: pub } = (storage as any).storage.from(bucket).getPublicUrl(path);
    const publicUrl: string | undefined = pub?.publicUrl;

    // Update user row
    const { data: updated, error: updErr } = await storage.from('users').update({ avatar_url: publicUrl || null }).eq('id', userId).select('*').single();
    if (updErr) throw updErr;

    res.json({ url: publicUrl, profile: updated });
  } catch (e) { next(e); }
});

// Change password (verify current, then set new)
const changePwdSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});
r.post('/change-password', validate({ body: changePwdSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: userRow, error } = await db.from('users').select('id,password_hash').eq('id', req.user!.id).single();
    if (error || !userRow) { res.status(404).json({ error: 'User not found' }); return; }
    const ok = await comparePassword(req.body.currentPassword, userRow.password_hash);
    if (!ok) { res.status(401).json({ error: 'Invalid current password' }); return; }
    const newHash = await hashPassword(req.body.newPassword);
    const { error: updErr } = await db.from('users').update({ password_hash: newHash }).eq('id', req.user!.id);
    if (updErr) throw updErr;
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default r;
